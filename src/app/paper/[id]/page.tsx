import { notFound } from 'next/navigation'
import Link from 'next/link'
import PaperCard from '@/components/PaperCard'
import type { Paper } from '@/types/paper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PaperDetailPage({ params }: PageProps) {
  const { id } = await params
  const paperId = decodeURIComponent(id)

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/papers/${encodeURIComponent(paperId)}`,
    { cache: 'no-store' }
  )

  if (!res.ok) notFound()

  const { data }: { data: { paper: Paper; related: Paper[] } } = await res.json()
  const { paper, related } = data

  const publishedDate = paper.published_at
    ? new Date(paper.published_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-[var(--color-line-gray-400)] mb-6">
        <Link href="/" className="hover:text-[var(--color-line-navy-500)] transition-colors">홈</Link>
        <span>/</span>
        {paper.field_label && (
          <>
            <span className="text-[var(--color-line-gray-500)]">{paper.field_label}</span>
            <span>/</span>
          </>
        )}
        <span className="text-[var(--color-line-gray-700)] line-clamp-1 max-w-xs">{paper.title}</span>
      </nav>

      {/* Paper header */}
      <article>
        {paper.field_label && (
          <span className="inline-block text-[12px] font-medium px-2.5 py-1 rounded-full mb-3
            bg-[var(--color-line-navy-400)] text-white">
            {paper.field_label}
          </span>
        )}

        <h1 className="text-[23px] font-bold text-[var(--color-line-gray-900)] leading-snug mb-3">
          {paper.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--color-line-gray-500)] mb-6">
          <span>{paper.authors.join(', ')}</span>
          {publishedDate && <span>{publishedDate}</span>}
          {paper.citation_count > 0 && (
            <span>인용 {paper.citation_count.toLocaleString()}회</span>
          )}
        </div>

        {/* Links */}
        <div className="flex gap-3 mb-8">
          {paper.arxiv_url && (
            <a
              href={paper.arxiv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium
                bg-[var(--color-line-green)] text-white hover:opacity-90 transition-opacity"
            >
              arXiv 원문 보기 →
            </a>
          )}
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium
                border border-[var(--color-line-gray-300)] text-[var(--color-line-gray-700)]
                hover:bg-[var(--color-line-gray-100)] transition-colors"
            >
              DOI
            </a>
          )}
        </div>

        {/* Claude Summary */}
        {paper.summary?.summary_ko && (
          <section className="bg-[var(--color-line-gray-100)] rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[12px] font-semibold text-[var(--color-line-navy-500)] uppercase tracking-wide">
                AI 요약
              </span>
              <span className="text-[11px] text-[var(--color-line-gray-400)]">by Claude</span>
            </div>
            <p className="text-[15px] text-[var(--color-line-gray-800)] leading-relaxed">
              {paper.summary.summary_ko}
            </p>

            {paper.summary.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--color-line-gray-200)]">
                {paper.summary.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[12px] px-3 py-1 rounded-full
                      bg-white border border-[var(--color-line-gray-250)]
                      text-[var(--color-line-gray-600)]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Abstract */}
        {paper.abstract && (
          <section className="mb-8">
            <h2 className="text-[14px] font-semibold text-[var(--color-line-gray-600)] uppercase tracking-wide mb-3">
              Abstract
            </h2>
            <p className="text-[14px] text-[var(--color-line-gray-700)] leading-relaxed whitespace-pre-line">
              {paper.abstract}
            </p>
          </section>
        )}
      </article>

      {/* Related papers */}
      {related.length > 0 && (
        <section>
          <h2 className="text-[17px] font-bold text-[var(--color-line-gray-900)] mb-4">
            유사 논문 추천
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((p) => (
              <PaperCard key={p.id} paper={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
