import { parseStringPromise } from 'xml2js'
import type { Paper } from '@/types/paper'
import { inferFieldLabel } from './fields'

const ARXIV_API_BASE = 'https://export.arxiv.org/api/query'

export interface ArxivFetchOptions {
  category?: string       // e.g. 'cs.AI', 'physics'
  maxResults?: number
  start?: number
  sortBy?: 'submittedDate' | 'relevance' | 'lastUpdatedDate'
}

export async function fetchArxivPapers(options: ArxivFetchOptions = {}): Promise<Paper[]> {
  const {
    category,
    maxResults = 20,
    start = 0,
    sortBy = 'submittedDate',
  } = options

  const searchQuery = category ? `cat:${category}` : 'all:*'

  const params = new URLSearchParams({
    search_query: searchQuery,
    start: String(start),
    max_results: String(maxResults),
    sortBy,
    sortOrder: 'descending',
  })

  const res = await fetch(`${ARXIV_API_BASE}?${params}`)
  if (!res.ok) throw new Error(`arXiv API error: ${res.status}`)

  const xml = await res.text()
  const parsed = await parseStringPromise(xml, { explicitArray: false })

  const feed = parsed?.feed
  if (!feed?.entry) return []

  const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry]

  return entries.map((entry: ArxivEntry): Paper => {
    const id = (entry.id as string).split('/abs/').pop() ?? entry.id
    const categories: string[] = []

    if (entry.category) {
      const cats = Array.isArray(entry.category) ? entry.category : [entry.category]
      cats.forEach((c: { $: { term: string } }) => {
        if (c.$?.term) categories.push(c.$.term)
      })
    }

    const authors = entry.author
      ? (Array.isArray(entry.author) ? entry.author : [entry.author]).map(
          (a: { name: string }) => a.name
        )
      : []

    return {
      id,
      source: 'arxiv',
      title: cleanText(entry.title),
      authors,
      abstract: cleanText(entry.summary ?? ''),
      field_label: inferFieldLabel(categories),
      arxiv_categories: categories,
      published_at: entry.published ?? null,
      citation_count: 0,
      arxiv_url: `https://arxiv.org/abs/${id}`,
      doi: entry['arxiv:doi']?._ ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  })
}

interface ArxivEntry {
  id: string
  title: string
  summary?: string
  published?: string
  category?: { $: { term: string } } | { $: { term: string } }[]
  author?: { name: string } | { name: string }[]
  'arxiv:doi'?: { _: string }
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}
