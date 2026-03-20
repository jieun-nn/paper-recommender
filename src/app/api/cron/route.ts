import { NextRequest, NextResponse } from 'next/server'
import { fetchArxivPapers } from '@/lib/arxiv'
import { searchSemanticScholar } from '@/lib/semantic-scholar'
import { summarizePapers, summaryToDbRow } from '@/lib/claude'
import { getServiceClient } from '@/lib/supabase'
import { FIELDS } from '@/lib/fields'
import type { Paper } from '@/types/paper'

// Vercel Cron 또는 외부 호출로 매일 실행
// vercel.json: { "crons": [{ "path": "/api/cron", "schedule": "0 6 * * *" }] }

export async function POST(req: NextRequest) {
  // 보안: CRON_SECRET 검증
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getServiceClient()
  const results = { fetched: 0, saved: 0, summarized: 0, errors: [] as string[] }

  const allNewPapers: Paper[] = []

  // 1. arXiv에서 각 분야별 최신 논문 수집
  for (const field of FIELDS) {
    if (field.label === '전체' || field.label === '기타') continue

    for (const category of field.arxivCategories.slice(0, 2)) {
      try {
        const papers = await fetchArxivPapers({ category, maxResults: 10 })
        allNewPapers.push(...papers)
        await delay(300)
      } catch (err) {
        results.errors.push(`arXiv ${category}: ${String(err)}`)
      }
    }

    // Semantic Scholar 보완
    if (field.useSemanticScholar && field.semanticScholarQuery) {
      try {
        const papers = await searchSemanticScholar({
          query: field.semanticScholarQuery,
          limit: 10,
        })
        allNewPapers.push(...papers)
      } catch (err) {
        results.errors.push(`SemanticScholar ${field.label}: ${String(err)}`)
      }
    }
  }

  results.fetched = allNewPapers.length

  // 2. 중복 제거 및 DB 저장
  const uniquePapers = deduplicateByid(allNewPapers)

  // 기존 ID 확인
  const ids = uniquePapers.map((p) => p.id)
  const { data: existingIds } = await db
    .from('papers')
    .select('id')
    .in('id', ids)

  const existingSet = new Set((existingIds ?? []).map((r: { id: string }) => r.id))
  const newPapers = uniquePapers.filter((p) => !existingSet.has(p.id))

  if (newPapers.length > 0) {
    const { error: insertError } = await db.from('papers').insert(
      newPapers.map((p) => ({
        id: p.id,
        source: p.source,
        title: p.title,
        authors: p.authors,
        abstract: p.abstract,
        field_label: p.field_label,
        arxiv_categories: p.arxiv_categories,
        published_at: p.published_at,
        citation_count: p.citation_count,
        arxiv_url: p.arxiv_url,
        doi: p.doi,
      }))
    )
    if (insertError) results.errors.push(`Insert: ${insertError.message}`)
    else results.saved = newPapers.length
  }

  // 3. 요약이 없는 논문들 Claude로 요약
  const papersNeedingSummary = newPapers.filter((p) => p.abstract)
  if (papersNeedingSummary.length > 0) {
    const summaryMap = await summarizePapers(papersNeedingSummary)

    const summaryRows = Array.from(summaryMap.entries()).map(([paperId, result]) =>
      summaryToDbRow(paperId, result)
    )

    if (summaryRows.length > 0) {
      const { error: summaryError } = await db.from('summaries').upsert(summaryRows, {
        onConflict: 'paper_id',
      })
      if (summaryError) results.errors.push(`Summaries: ${summaryError.message}`)
      else results.summarized = summaryRows.length
    }
  }

  return NextResponse.json({ ok: true, results })
}

// GET: Vercel Cron은 GET도 지원
export async function GET(req: NextRequest) {
  return POST(req)
}

function deduplicateByid(papers: Paper[]): Paper[] {
  const seen = new Set<string>()
  return papers.filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
