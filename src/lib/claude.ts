import Anthropic from '@anthropic-ai/sdk'
import type { Paper, Summary } from '@/types/paper'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-sonnet-4-6'

export interface SummaryResult {
  summary_ko: string
  keywords: string[]
}

/** 논문 abstract를 한국어로 요약하고 키워드 추출 */
export async function summarizePaper(paper: Paper): Promise<SummaryResult> {
  const prompt = `다음 논문의 abstract를 한국어로 요약해주세요.

제목: ${paper.title}
저자: ${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ' 외' : ''}
Abstract:
${paper.abstract ?? '(abstract 없음)'}

응답 형식 (JSON):
{
  "summary_ko": "3줄 이내의 핵심 내용 요약. 일반 독자도 이해할 수 있게 쉽게 설명.",
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"]
}

규칙:
- summary_ko는 반드시 한국어로, 3줄(문장) 이내
- keywords는 3~5개의 한국어 또는 영어 핵심 키워드
- JSON만 반환 (다른 텍스트 없이)`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    return JSON.parse(jsonMatch[0]) as SummaryResult
  } catch {
    return {
      summary_ko: text.slice(0, 300),
      keywords: [],
    }
  }
}

/** 여러 논문을 배치 처리 (rate limit 고려, 500ms 딜레이) */
export async function summarizePapers(
  papers: Paper[],
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, SummaryResult>> {
  const results = new Map<string, SummaryResult>()

  for (let i = 0; i < papers.length; i++) {
    const paper = papers[i]
    try {
      const result = await summarizePaper(paper)
      results.set(paper.id, result)
      onProgress?.(i + 1, papers.length)
      if (i < papers.length - 1) await delay(500)
    } catch (err) {
      console.error(`Failed to summarize paper ${paper.id}:`, err)
    }
  }

  return results
}

/** 유사 논문 추천 (논문 제목+요약 기반 Claude 분석) */
export async function recommendRelatedPapers(
  paper: Paper,
  candidates: Paper[]
): Promise<Paper[]> {
  if (candidates.length === 0) return []

  const candidateList = candidates
    .map((p, i) => `${i + 1}. ${p.title} (${p.authors[0] ?? ''})\n   ${p.abstract?.slice(0, 150) ?? ''}`)
    .join('\n\n')

  const prompt = `다음 논문과 가장 관련성 높은 논문 3개를 선택해주세요.

기준 논문:
제목: ${paper.title}
요약: ${paper.abstract?.slice(0, 300) ?? ''}

후보 논문:
${candidateList}

응답 형식 (JSON):
{ "indices": [1, 3, 5] }

번호만 JSON으로 반환 (1-based index, 3개 선택)`

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 128,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return candidates.slice(0, 3)
    const { indices } = JSON.parse(jsonMatch[0]) as { indices: number[] }
    return indices
      .filter((i) => i >= 1 && i <= candidates.length)
      .map((i) => candidates[i - 1])
      .slice(0, 3)
  } catch {
    return candidates.slice(0, 3)
  }
}

export function summaryToDbRow(paperId: string, result: SummaryResult): Omit<Summary, 'id' | 'created_at'> {
  return {
    paper_id: paperId,
    summary_ko: result.summary_ko,
    keywords: result.keywords,
    model: MODEL,
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
