/**
 * fetch-historical.mjs
 * 최근 3년간 분야별 논문을 Supabase에 대량 수집
 *
 * 실행: node scripts/fetch-historical.mjs
 * 옵션: node scripts/fetch-historical.mjs --field "cs.AI" --max 500
 */

import { parseStringPromise } from 'xml2js'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// .env.local 로드
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  const eq = line.indexOf('=')
  if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
})

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// ── 설정 ──────────────────────────────────────────
const BATCH_SIZE = 200        // arXiv API 한 번에 가져올 수
const MAX_PER_CATEGORY = 500  // 카테고리당 최대 수집량
const DELAY_MS = 3500         // arXiv rate limit 준수 (3초 이상)
const DATE_FROM = '20230101'  // 3년 전
const DATE_TO = '20261231'

// 수집할 카테고리 목록 (분야 → arXiv 카테고리)
const CATEGORIES = [
  // AI / 머신러닝
  { label: 'AI / 머신러닝', cat: 'cs.AI' },
  { label: 'AI / 머신러닝', cat: 'cs.LG' },
  // 반도체
  { label: '반도체', cat: 'cond-mat.mes-hall' },
  { label: '반도체', cat: 'cond-mat.mtrl-sci' },
  // 물리
  { label: '물리', cat: 'quant-ph' },
  { label: '물리', cat: 'hep-th' },
  { label: '물리', cat: 'cond-mat.str-el' },
  // 하드웨어
  { label: '하드웨어', cat: 'cs.AR' },
  { label: '하드웨어', cat: 'eess.SY' },
  // 소프트웨어
  { label: '소프트웨어', cat: 'cs.SE' },
  { label: '소프트웨어', cat: 'cs.PL' },
  // 수학
  { label: '수학', cat: 'math.CO' },
  { label: '수학', cat: 'math.NT' },
  // 디자인
  { label: '디자인', cat: 'cs.HC' },
  { label: '디자인', cat: 'cs.GR' },
  // 심리
  { label: '심리', cat: 'q-bio.NC' },
]

// ── arXiv API ─────────────────────────────────────
async function fetchArxivPage(category, start) {
  const query = `cat:${category}+AND+submittedDate:[${DATE_FROM}+TO+${DATE_TO}]`
  const url = `https://export.arxiv.org/api/query?search_query=${query}&start=${start}&max_results=${BATCH_SIZE}&sortBy=submittedDate&sortOrder=descending`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`arXiv API ${res.status}`)
  const xml = await res.text()
  const parsed = await parseStringPromise(xml, { explicitArray: false })
  const feed = parsed?.feed
  if (!feed?.entry) return { papers: [], total: 0 }

  const totalStr = feed['opensearch:totalResults']?._ ?? feed['opensearch:totalResults'] ?? '0'
  const total = parseInt(totalStr, 10)
  const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry]

  const papers = entries.map(entry => {
    const id = String(entry.id).split('/abs/').pop() ?? entry.id
    const categories = []
    if (entry.category) {
      const cats = Array.isArray(entry.category) ? entry.category : [entry.category]
      cats.forEach(c => { if (c?.$?.term) categories.push(c.$.term) })
    }
    const authors = entry.author
      ? (Array.isArray(entry.author) ? entry.author : [entry.author]).map(a => a.name)
      : []

    return {
      id,
      source: 'arxiv',
      title: clean(entry.title),
      authors,
      abstract: clean(entry.summary ?? ''),
      field_label: inferFieldLabel(categories),
      arxiv_categories: categories,
      published_at: entry.published ?? null,
      citation_count: 0,
      arxiv_url: `https://arxiv.org/abs/${id}`,
      doi: entry['arxiv:doi']?._ ?? null,
    }
  })

  return { papers, total }
}

// ── 분야 추론 ─────────────────────────────────────
const FIELD_MAP = [
  { label: '반도체', prefixes: ['cond-mat.mes-hall', 'cond-mat.mtrl-sci', 'cond-mat.supr-con'] },
  { label: 'AI / 머신러닝', prefixes: ['cs.AI', 'cs.LG', 'cs.NE', 'stat.ML'] },
  { label: '물리', prefixes: ['physics', 'cond-mat', 'quant-ph', 'hep-', 'gr-qc', 'nucl-'] },
  { label: '하드웨어', prefixes: ['cs.AR', 'cs.ET', 'cs.NI', 'eess'] },
  { label: '소프트웨어', prefixes: ['cs.SE', 'cs.PL', 'cs.OS', 'cs.DC'] },
  { label: '수학', prefixes: ['math.'] },
  { label: '디자인', prefixes: ['cs.HC', 'cs.GR'] },
  { label: '심리', prefixes: ['q-bio.NC'] },
]

function inferFieldLabel(categories) {
  for (const { label, prefixes } of FIELD_MAP) {
    for (const cat of categories) {
      if (prefixes.some(p => cat.startsWith(p))) return label
    }
  }
  return '기타'
}

function clean(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim()
}

// ── DB 저장 ───────────────────────────────────────
async function savePapers(papers) {
  if (papers.length === 0) return { saved: 0, skipped: 0 }

  // 이미 있는 ID 확인
  const ids = papers.map(p => p.id)
  const { data: existing } = await db.from('papers').select('id').in('id', ids)
  const existingSet = new Set((existing ?? []).map(r => r.id))
  const newPapers = papers.filter(p => !existingSet.has(p.id))

  if (newPapers.length === 0) return { saved: 0, skipped: papers.length }

  const { error } = await db.from('papers').insert(newPapers)
  if (error) {
    console.error('  Insert error:', error.message)
    return { saved: 0, skipped: papers.length }
  }
  return { saved: newPapers.length, skipped: existingSet.size }
}

// ── 메인 ──────────────────────────────────────────
async function main() {
  console.log(`\n📚 PaperFeed Historical Fetch`)
  console.log(`기간: ${DATE_FROM} ~ ${DATE_TO}`)
  console.log(`카테고리당 최대: ${MAX_PER_CATEGORY}편\n`)

  let totalFetched = 0, totalSaved = 0

  for (const { label, cat } of CATEGORIES) {
    console.log(`\n[${label}] ${cat} 수집 시작...`)
    let start = 0
    let categorySaved = 0

    while (start < MAX_PER_CATEGORY) {
      try {
        const { papers, total } = await fetchArxivPage(cat, start)
        if (papers.length === 0) break

        const { saved, skipped } = await savePapers(papers)
        categorySaved += saved
        totalFetched += papers.length
        totalSaved += saved

        console.log(`  [${start}~${start + papers.length}/${Math.min(total, MAX_PER_CATEGORY)}] +${saved}편 저장 (${skipped}편 중복 스킵)`)

        if (papers.length < BATCH_SIZE || start + BATCH_SIZE >= MAX_PER_CATEGORY) break
        start += BATCH_SIZE
        await delay(DELAY_MS)
      } catch (err) {
        console.error(`  에러: ${err.message}`)
        await delay(DELAY_MS * 2)
        break
      }
    }

    console.log(`  → ${cat} 완료: ${categorySaved}편 저장`)
    await delay(DELAY_MS)
  }

  console.log(`\n✅ 완료! 총 ${totalFetched}편 처리, ${totalSaved}편 신규 저장`)
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

main().catch(console.error)
