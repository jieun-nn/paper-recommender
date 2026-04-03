/**
 * 기존 papers 테이블의 sub_field를 arxiv_categories로부터 추론해 업데이트
 * 실행: node scripts/update-subfields.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const ARXIV_TO_SUBFIELD = {
  'cs.CV': '컴퓨터비전',
  'cs.CL': '자연어처리',
  'cs.AI': '인공지능·기계학습',
  'cs.LG': '인공지능·기계학습',
  'cs.NE': '신경망·진화계산',
  'stat.ML': '통계적 기계학습',
  'cs.RO': '제어·로보틱스',
  'cs.IR': '데이터베이스·빅데이터',
  'cs.AR': '컴퓨터구조',
  'cs.ET': '컴퓨터구조',
  'cs.SY': '제어·로보틱스',
  'eess.SP': '신호처리·통신',
  'eess.SY': '제어·로보틱스',
  'eess.EE': '전력·에너지시스템',
  'eess.IV': '신호처리·통신',
  'cs.SE': '소프트웨어공학',
  'cs.PL': '소프트웨어공학',
  'cs.OS': '시스템·운영체제',
  'cs.DC': '네트워크·분산컴퓨팅',
  'cs.NI': '네트워크·분산컴퓨팅',
  'cs.DB': '데이터베이스·빅데이터',
  'cs.CR': '보안·암호학',
  'cs.HC': 'UX·인터랙션디자인',
  'cs.GR': '시각·그래픽디자인',
  'cond-mat.mes-hall': '나노·메조스케일 물리',
  'cond-mat.mtrl-sci': '재료과학',
  'cond-mat.supr-con': '초전도·강상관계',
  'cond-mat.str-el': '강상관계',
  'cond-mat.quant-gas': '고체물리',
  'cond-mat.soft': '고체물리',
  'cond-mat.stat-mech': '고체물리',
  'cond-mat': '고체물리',
  'quant-ph': '양자정보·양자컴퓨팅',
  'hep-th': '고에너지이론',
  'hep-ph': '입자·핵물리',
  'hep-ex': '입자·핵물리',
  'nucl-th': '입자·핵물리',
  'nucl-ex': '입자·핵물리',
  'physics.atom-ph': '원자·분자·광학물리',
  'physics.optics': '원자·분자·광학물리',
  'physics.plasm-ph': '플라즈마물리',
  'physics.acc-ph': '입자·핵물리',
  'physics.comp-ph': '수리물리',
  'astro-ph': '천체물리·우주론',
  'gr-qc': '천체물리·우주론',
  'physics': '수리물리',
  'math-ph': '수리물리',
  'math.AG': '대수학',
  'math.RA': '대수학',
  'math.AC': '대수학',
  'math.GR': '대수학',
  'math.CA': '해석학',
  'math.CV': '해석학',
  'math.FA': '해석학',
  'math.AP': '해석학',
  'math.AT': '위상수학·기하학',
  'math.GN': '위상수학·기하학',
  'math.GT': '위상수학·기하학',
  'math.DG': '위상수학·기하학',
  'math.PR': '확률론·통계학',
  'math.ST': '확률론·통계학',
  'math.OC': '수치해석·최적화',
  'math.NA': '수치해석·최적화',
  'math.CO': '조합론·이산수학',
  'math.NT': '정수론',
  'q-bio.NC': '신경심리학',
  'q-bio.QM': '신경심리학',
}

const sortedKeys = Object.keys(ARXIV_TO_SUBFIELD).sort((a, b) => b.length - a.length)

function inferSubField(categories) {
  if (!Array.isArray(categories)) return null
  for (const cat of categories) {
    for (const key of sortedKeys) {
      if (cat.startsWith(key)) return ARXIV_TO_SUBFIELD[key]
    }
  }
  return null
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BATCH = 500

async function run() {
  console.log('🔍 sub_field가 없는 논문 조회 중...')
  let offset = 0
  let total = 0

  while (true) {
    const { data, error } = await supabase
      .from('papers')
      .select('id, arxiv_categories')
      .is('sub_field', null)
      .range(offset, offset + BATCH - 1)

    if (error) { console.error(error); break }
    if (!data || data.length === 0) break

    const updates = data
      .map((p) => ({ id: p.id, sub_field: inferSubField(p.arxiv_categories) }))
      .filter((u) => u.sub_field !== null)

    if (updates.length > 0) {
      for (const u of updates) {
        await supabase.from('papers').update({ sub_field: u.sub_field }).eq('id', u.id)
      }
    }

    total += updates.length
    offset += data.length
    process.stdout.write(`\r  처리: ${total}편 업데이트됨 (offset ${offset})`)

    if (data.length < BATCH) break
    await new Promise((r) => setTimeout(r, 300))
  }

  console.log(`\n✅ 완료: 총 ${total}편 sub_field 업데이트`)
}

run().catch(console.error)
