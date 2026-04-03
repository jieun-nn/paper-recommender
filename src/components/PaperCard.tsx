import Link from 'next/link'
import type { Paper } from '@/types/paper'

interface PaperCardProps {
  paper: Paper
}

export default function PaperCard({ paper }: PaperCardProps) {
  const publishedDate = paper.published_at
    ? new Date(paper.published_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const authorText =
    paper.authors.length === 0
      ? '저자 미상'
      : paper.authors.length <= 3
      ? paper.authors.join(', ')
      : `${paper.authors.slice(0, 3).join(', ')} 외 ${paper.authors.length - 3}명`

  return (
    <Link href={`/paper/${encodeURIComponent(paper.id)}`}>
      <article className="group bg-white border border-[var(--color-line-gray-200)] rounded-2xl p-4
        hover:border-[var(--color-line-navy-400)] hover:shadow-md transition-all cursor-pointer h-full flex flex-col">

        {/* 분야 태그 + 세부전공 태그 */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {paper.field_label && (
            <span className="inline-block text-[12px] font-medium px-2 py-0.5 rounded-full
              bg-[var(--color-line-navy-400)] text-white">
              {paper.field_label}
            </span>
          )}
          {paper.sub_field && (
            <span className="inline-block text-[12px] px-2 py-0.5 rounded-full
              bg-[var(--color-line-gray-150)] text-[var(--color-line-gray-600)] border border-[var(--color-line-gray-200)]">
              {paper.sub_field}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h3 className="text-[15px] font-semibold text-[var(--color-line-gray-900)] leading-snug
          group-hover:text-[var(--color-line-navy-500)] transition-colors line-clamp-2 mb-1">
          {paper.title}
        </h3>

        {/* 저자 */}
        <p className="text-[12px] text-[var(--color-line-gray-500)] mb-2 line-clamp-1">
          {authorText}
        </p>

        {/* Claude 요약 */}
        {paper.summary?.summary_ko && (
          <div className="bg-[var(--color-line-gray-100)] rounded-lg p-3 mb-3">
            <p className="text-[13px] text-[var(--color-line-gray-700)] leading-relaxed line-clamp-3">
              {paper.summary.summary_ko}
            </p>
          </div>
        )}

        {/* 키워드 */}
        {paper.summary?.keywords && paper.summary.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {paper.summary.keywords.slice(0, 4).map((kw) => (
              <span
                key={kw}
                className="text-[12px] px-2 py-0.5 rounded-full bg-[var(--color-line-gray-150)]
                  text-[var(--color-line-gray-600)]"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* 메타 정보 */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--color-line-gray-150)]">
          <span className="text-[12px] text-[var(--color-line-gray-400)]">
            {publishedDate ?? '날짜 미상'}
          </span>
          <div className="flex items-center gap-3">
            {paper.citation_count > 0 && (
              <span className="flex items-center gap-1 text-[12px] text-[var(--color-line-gray-500)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                {paper.citation_count.toLocaleString()}
              </span>
            )}
            {paper.arxiv_url && (
              <span
                onClick={(e) => {
                  e.preventDefault()
                  window.open(paper.arxiv_url!, '_blank')
                }}
                className="text-[12px] text-[var(--color-line-navy-500)] hover:underline"
              >
                arXiv →
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
