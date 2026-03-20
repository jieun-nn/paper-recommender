import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { FieldLabel, SortOption } from '@/types/paper'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const field = searchParams.get('field') as FieldLabel | null
  const sort = (searchParams.get('sort') ?? 'latest') as SortOption
  const q = searchParams.get('q')
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50)

  let query = supabase
    .from('papers')
    .select('*, summary:summaries(summary_ko, keywords)')
    .limit(limit)

  // 분야 필터
  if (field && field !== '전체') {
    query = query.eq('field_label', field)
  }

  // 검색
  if (q) {
    query = query.or(`title.ilike.%${q}%,abstract.ilike.%${q}%`)
  }

  // 정렬
  if (sort === 'citations') {
    query = query.order('citation_count', { ascending: false })
  } else {
    query = query.order('published_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  // summaries는 배열로 반환되므로 첫 번째 요소를 summary로 변환
  const papers = (data ?? []).map((p) => ({
    ...p,
    summary: Array.isArray(p.summary) ? p.summary[0] ?? null : p.summary ?? null,
  }))

  return NextResponse.json({ data: papers })
}
