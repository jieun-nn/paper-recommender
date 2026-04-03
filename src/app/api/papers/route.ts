import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { FieldLabel, SortOption } from '@/types/paper'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const field = searchParams.get('field') as FieldLabel | null
  const subField = searchParams.get('sub_field')
  const sort = (searchParams.get('sort') ?? 'latest') as SortOption
  const q = searchParams.get('q')
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = searchParams.get('limit') ? Math.min(Number(searchParams.get('limit')), 50) : PAGE_SIZE
  const offset = (page - 1) * limit

  function applyFilters<T extends ReturnType<typeof supabase.from>>(query: T): T {
    if (subField) {
      query = (query as any).eq('sub_field', subField)
    } else if (field && field !== '전체') {
      query = (query as any).eq('field_label', field)
    }
    if (q) query = (query as any).or(`title.ilike.%${q}%,abstract.ilike.%${q}%`)
    return query
  }

  // count 쿼리
  const countQuery = applyFilters(
    supabase.from('papers').select('id', { count: 'exact', head: true })
  )
  const { count } = await countQuery

  // 데이터 쿼리
  let query = applyFilters(
    supabase
      .from('papers')
      .select('*, summary:summaries(summary_ko, keywords)')
      .range(offset, offset + limit - 1) as any
  )

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

  const papers = (data ?? []).map((p: any) => ({
    ...p,
    summary: Array.isArray(p.summary) ? p.summary[0] ?? null : p.summary ?? null,
  }))

  const total = count ?? 0
  const hasMore = offset + papers.length < total

  return NextResponse.json({ data: papers, total, hasMore, page })
}
