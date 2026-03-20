'use client'

import { useState, useEffect, useCallback } from 'react'
import PaperCard from '@/components/PaperCard'
import FieldSidebar from '@/components/FieldSidebar'
import SearchBar from '@/components/SearchBar'
import type { Paper, FieldLabel, SortOption } from '@/types/paper'

export default function HomePage() {
  const [selectedField, setSelectedField] = useState<FieldLabel>('전체')
  const [sort, setSort] = useState<SortOption>('latest')
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPapers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ sort })
      if (selectedField !== '전체') params.set('field', selectedField)
      const res = await fetch(`/api/papers?${params}`)
      if (!res.ok) throw new Error('논문을 불러오는 데 실패했습니다.')
      const { data } = await res.json()
      setPapers(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [selectedField, sort])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center gap-4 mb-6">
        <SearchBar />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[13px] text-[var(--color-line-gray-500)]">정렬:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-[13px] px-2 py-1.5 rounded-lg border border-[var(--color-line-gray-250)]
              bg-white text-[var(--color-line-gray-700)] focus:outline-none
              focus:border-[var(--color-line-navy-500)] cursor-pointer"
          >
            <option value="latest">최신순</option>
            <option value="citations">인용순</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <FieldSidebar selected={selectedField} onChange={setSelectedField} />

        {/* Paper grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[17px] font-bold text-[var(--color-line-gray-900)]">
              {selectedField === '전체' ? '전체 논문' : `${selectedField} 논문`}
            </h1>
            {!loading && (
              <span className="text-[13px] text-[var(--color-line-gray-400)]">
                {papers.length}편
              </span>
            )}
          </div>

          {loading && <LoadingSkeleton />}

          {!loading && error && (
            <div className="rounded-2xl border border-[var(--color-line-red-400)] bg-red-50 p-6 text-center">
              <p className="text-[14px] text-red-600">{error}</p>
              <button
                onClick={fetchPapers}
                className="mt-3 text-[13px] text-[var(--color-line-navy-500)] hover:underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && papers.length === 0 && (
            <div className="rounded-2xl border border-[var(--color-line-gray-200)] p-12 text-center">
              <p className="text-[14px] text-[var(--color-line-gray-500)]">
                해당 분야의 논문이 없습니다.
              </p>
            </div>
          )}

          {!loading && !error && papers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[var(--color-line-gray-100)] rounded-2xl p-4 animate-pulse">
          <div className="h-3 w-16 bg-[var(--color-line-gray-250)] rounded-full mb-3" />
          <div className="h-4 bg-[var(--color-line-gray-250)] rounded mb-2" />
          <div className="h-4 w-3/4 bg-[var(--color-line-gray-250)] rounded mb-3" />
          <div className="h-16 bg-[var(--color-line-gray-200)] rounded-lg mb-3" />
          <div className="flex gap-2">
            <div className="h-3 w-12 bg-[var(--color-line-gray-200)] rounded-full" />
            <div className="h-3 w-16 bg-[var(--color-line-gray-200)] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
