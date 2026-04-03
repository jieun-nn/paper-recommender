'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import PaperCard from '@/components/PaperCard'
import FieldSidebar from '@/components/FieldSidebar'
import SearchBar from '@/components/SearchBar'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Paper, FieldLabel, SortOption, UserProfile } from '@/types/paper'

export default function HomePage() {
  const [selectedField, setSelectedField] = useState<FieldLabel>('전체')
  const [sort, setSort] = useState<SortOption>('latest')
  const [papers, setPapers] = useState<Paper[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(searchQuery)
  searchRef.current = searchQuery

  const [mounted, setMounted] = useState(false)

  // 개인화 추천
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [personalPapers, setPersonalPapers] = useState<Paper[]>([])
  const [personalLoading, setPersonalLoading] = useState(false)

  const supabase = getSupabaseBrowserClient()

  // 로그인 상태 + 프로필 로드
  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const { data } = await res.json()
      if (data?.onboarding_done) setProfile(data)
    })
  }, [supabase.auth])

  // 맞춤 논문 로드
  useEffect(() => {
    if (!profile) return
    setPersonalLoading(true)

    const params = new URLSearchParams({ sort: 'latest', page: '1', limit: '6' })
    if (profile.sub_field && !profile.use_dept_recs) {
      params.set('sub_field', profile.sub_field)
    } else if (profile.field_label) {
      params.set('field', profile.field_label)
    }

    fetch(`/api/papers?${params}`)
      .then((r) => r.json())
      .then(({ data }) => setPersonalPapers(data ?? []))
      .finally(() => setPersonalLoading(false))
  }, [profile])

  const fetchPapers = useCallback(async (field: FieldLabel, sortOpt: SortOption, q: string) => {
    setLoading(true)
    setError(null)
    setPapers([])
    setPage(1)
    setHasMore(false)
    try {
      const params = new URLSearchParams({ sort: sortOpt, page: '1' })
      if (field !== '전체') params.set('field', field)
      if (q) params.set('q', q)
      const res = await fetch(`/api/papers?${params}`)
      if (!res.ok) throw new Error('논문을 불러오는 데 실패했습니다.')
      const json = await res.json()
      setPapers(json.data ?? [])
      setTotal(json.total ?? 0)
      setHasMore(json.hasMore ?? false)
      setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams({ sort, page: String(nextPage) })
      if (selectedField !== '전체') params.set('field', selectedField)
      if (searchRef.current) params.set('q', searchRef.current)
      const res = await fetch(`/api/papers?${params}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setPapers((prev) => [...prev, ...(json.data ?? [])])
      setHasMore(json.hasMore ?? false)
      setPage(nextPage)
    } catch {
      // silent
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page, sort, selectedField])

  useEffect(() => {
    fetchPapers(selectedField, sort, searchQuery)
  }, [selectedField, sort]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    fetchPapers(selectedField, sort, q)
  }, [selectedField, sort, fetchPapers])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* 맞춤 추천 섹션 */}
      {mounted && profile && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-bold text-[var(--color-line-gray-900)]">
                내 맞춤 논문
              </h2>
              <p className="text-[13px] text-[var(--color-line-gray-500)] mt-0.5">
                {profile.use_dept_recs
                  ? `${profile.department} 전공 기반`
                  : `${profile.sub_field ?? profile.department} 세부전공 기반`}
              </p>
            </div>
            <Link
              href="/onboarding"
              className="text-[12px] text-[var(--color-line-gray-400)] hover:text-[var(--color-line-navy-500)] transition-colors"
            >
              전공 변경 →
            </Link>
          </div>

          {personalLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[var(--color-line-gray-100)] rounded-2xl p-4 h-40 animate-pulse" />
              ))}
            </div>
          ) : personalPapers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personalPapers.slice(0, 6).map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--color-line-gray-200)] p-8 text-center">
              <p className="text-[14px] text-[var(--color-line-gray-500)]">
                아직 해당 세부전공 논문이 없습니다.
              </p>
            </div>
          )}

          <hr className="border-[var(--color-line-gray-200)] mt-8" />
        </section>
      )}

      {/* 비로그인 배너 */}
      {mounted && !profile && (
        <div className="rounded-2xl border border-[var(--color-line-gray-200)] bg-[var(--color-line-gray-100)]
          px-6 py-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold text-[var(--color-line-gray-900)]">
              내 전공에 맞는 논문을 추천받으세요
            </p>
            <p className="text-[13px] text-[var(--color-line-gray-500)] mt-0.5">
              학과와 세부전공을 설정하면 맞춤 논문을 먼저 볼 수 있어요
            </p>
          </div>
          <Link
            href="/login"
            className="shrink-0 px-4 py-2 rounded-xl text-[13px] font-medium
              bg-[var(--color-line-green)] text-white hover:opacity-90 transition-opacity"
          >
            시작하기
          </Link>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center gap-4 mb-6">
        <SearchBar onSearch={handleSearch} />
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
        <FieldSidebar selected={selectedField} onChange={setSelectedField} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[17px] font-bold text-[var(--color-line-gray-900)]">
              {selectedField === '전체' ? '전체 논문' : `${selectedField} 논문`}
            </h1>
            {!loading && (
              <span className="text-[13px] text-[var(--color-line-gray-400)]">
                총 {total.toLocaleString()}편
              </span>
            )}
          </div>

          {loading && <LoadingSkeleton />}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-[14px] text-red-600">{error}</p>
              <button
                onClick={() => fetchPapers(selectedField, sort, searchQuery)}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {papers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-xl text-[14px] font-medium
                      border border-[var(--color-line-gray-300)] text-[var(--color-line-gray-700)]
                      hover:bg-[var(--color-line-gray-100)] disabled:opacity-50
                      transition-colors cursor-pointer"
                  >
                    {loadingMore ? '불러오는 중...' : `더 보기 (${papers.length} / ${total.toLocaleString()}편)`}
                  </button>
                </div>
              )}

              {!hasMore && papers.length > 20 && (
                <p className="text-center text-[13px] text-[var(--color-line-gray-400)] mt-8">
                  전체 {total.toLocaleString()}편 모두 표시됨
                </p>
              )}
            </>
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
