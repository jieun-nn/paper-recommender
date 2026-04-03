import type { Paper } from '@/types/paper'
import { inferFieldLabel } from './fields'

const SS_API_BASE = 'https://api.semanticscholar.org/graph/v1'
const FIELDS_PARAM = 'paperId,title,authors,abstract,year,citationCount,externalIds,fieldsOfStudy,publicationDate'

export interface SemanticScholarOptions {
  query: string
  limit?: number
  offset?: number
}

export async function searchSemanticScholar(options: SemanticScholarOptions): Promise<Paper[]> {
  const { query, limit = 20, offset = 0 } = options

  const params = new URLSearchParams({
    query,
    limit: String(limit),
    offset: String(offset),
    fields: FIELDS_PARAM,
  })

  const res = await fetch(`${SS_API_BASE}/paper/search?${params}`, {
    headers: { 'User-Agent': 'paper-recommender/1.0' },
  })

  if (!res.ok) throw new Error(`Semantic Scholar API error: ${res.status}`)

  const json: SemanticScholarSearchResponse = await res.json()
  return (json.data ?? []).map(toPaper)
}

export async function getSemanticScholarPaper(paperId: string): Promise<Paper | null> {
  const params = new URLSearchParams({ fields: FIELDS_PARAM })
  const res = await fetch(`${SS_API_BASE}/paper/${paperId}?${params}`, {
    headers: { 'User-Agent': 'paper-recommender/1.0' },
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Semantic Scholar API error: ${res.status}`)

  const item: SemanticScholarPaper = await res.json()
  return toPaper(item)
}

export async function getSimilarPapers(paperId: string, limit = 5): Promise<Paper[]> {
  const params = new URLSearchParams({ fields: FIELDS_PARAM, limit: String(limit) })
  const res = await fetch(`${SS_API_BASE}/paper/${paperId}/recommendations?${params}`, {
    headers: { 'User-Agent': 'paper-recommender/1.0' },
  })

  if (!res.ok) return []
  const json: { recommendedPapers: SemanticScholarPaper[] } = await res.json()
  return (json.recommendedPapers ?? []).map(toPaper)
}

function toPaper(item: SemanticScholarPaper): Paper {
  const arxivId = item.externalIds?.ArXiv
  const id = arxivId ?? `ss:${item.paperId}`

  return {
    id,
    source: 'semantic_scholar',
    title: item.title ?? '(제목 없음)',
    authors: (item.authors ?? []).map((a) => a.name),
    abstract: item.abstract ?? null,
    field_label: item.fieldsOfStudy?.[0]
      ? inferFieldLabel([item.fieldsOfStudy[0]])
      : '기타',
    sub_field: null,
    arxiv_categories: [],
    published_at: item.publicationDate ?? (item.year ? `${item.year}-01-01` : null),
    citation_count: item.citationCount ?? 0,
    arxiv_url: arxivId ? `https://arxiv.org/abs/${arxivId}` : null,
    doi: item.externalIds?.DOI ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

interface SemanticScholarSearchResponse {
  data: SemanticScholarPaper[]
  total?: number
}

interface SemanticScholarPaper {
  paperId: string
  title?: string
  authors?: { authorId: string; name: string }[]
  abstract?: string
  year?: number
  citationCount?: number
  publicationDate?: string
  externalIds?: { ArXiv?: string; DOI?: string }
  fieldsOfStudy?: string[]
}
