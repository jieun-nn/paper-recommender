import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSimilarPapers } from '@/lib/semantic-scholar'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const paperId = decodeURIComponent(id)

  // 논문 + 요약 조회
  const { data: paper, error } = await supabase
    .from('papers')
    .select('*, summary:summaries(summary_ko, keywords, model, created_at)')
    .eq('id', paperId)
    .single()

  if (error || !paper) {
    return NextResponse.json({ data: null, error: 'Paper not found' }, { status: 404 })
  }

  const paperWithSummary = {
    ...paper,
    summary: Array.isArray(paper.summary) ? paper.summary[0] ?? null : paper.summary ?? null,
  }

  // 유사 논문 추천 (Semantic Scholar)
  let related: typeof paper[] = []
  try {
    const semanticId = paper.id.startsWith('ss:') ? paper.id.slice(3) : paper.id
    const similarPapers = await getSimilarPapers(semanticId, 4)

    if (similarPapers.length > 0) {
      // DB에 있는 유사 논문 조회 (요약 포함)
      const ids = similarPapers.map((p) => p.id)
      const { data: dbRelated } = await supabase
        .from('papers')
        .select('*, summary:summaries(summary_ko, keywords)')
        .in('id', ids)

      related = (dbRelated ?? similarPapers).map((p) => ({
        ...p,
        summary: Array.isArray(p.summary) ? p.summary[0] ?? null : p.summary ?? null,
      }))
    }
  } catch {
    // 유사 논문 실패해도 상세 페이지는 정상 반환
  }

  return NextResponse.json({ data: { paper: paperWithSummary, related } })
}
