'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { DEPARTMENTS } from '@/lib/subfields'

type Step = 1 | 2 | 3
type DegreeLevel = 'bachelor' | 'graduate'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [degree, setDegree] = useState<DegreeLevel | null>(null)
  const [deptSearch, setDeptSearch] = useState('')
  const [department, setDepartment] = useState<string | null>(null)
  const [subField, setSubField] = useState<string | null>(null)
  const [useDeptRecs, setUseDeptRecs] = useState(false)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setToken(session.access_token)
    })
  }, [router, supabase.auth])

  const filteredDepts = useMemo(() => {
    const q = deptSearch.trim().toLowerCase()
    if (!q) return DEPARTMENTS
    return DEPARTMENTS.filter((d) => d.name.toLowerCase().includes(q))
  }, [deptSearch])

  const selectedDept = useMemo(
    () => DEPARTMENTS.find((d) => d.name === department) ?? null,
    [department]
  )

  function handleDegreeSelect(d: DegreeLevel) {
    setDegree(d)
    setStep(2)
  }

  function handleDeptSelect(name: string) {
    setDepartment(name)
    setSubField(null)
    setUseDeptRecs(false)
    setStep(3)
  }

  async function handleFinish() {
    if (!token || !degree || !department) return
    setLoading(true)

    const fieldLabel = selectedDept?.fieldLabel ?? null

    await fetch('/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        degree_level: degree,
        department,
        sub_field: useDeptRecs ? null : subField,
        field_label: fieldLabel,
        use_dept_recs: useDeptRecs,
        onboarding_done: true,
      }),
    })

    setLoading(false)
    router.push('/')
  }

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-[12px] text-[var(--color-line-gray-400)] mb-2">
            <span>내 전공 설정</span>
            <span>{step} / 3</span>
          </div>
          <div className="h-1.5 bg-[var(--color-line-gray-200)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-line-green)] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step 1: 학위 선택 */}
        {step === 1 && (
          <div>
            <h1 className="text-[22px] font-bold text-[var(--color-line-gray-900)] mb-2">
              현재 학위 과정을 선택해주세요
            </h1>
            <p className="text-[14px] text-[var(--color-line-gray-500)] mb-8">
              학위 과정에 따라 추천 방식을 다르게 제공합니다.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleDegreeSelect('bachelor')}
                className="group p-6 rounded-2xl border-2 border-[var(--color-line-gray-200)]
                  hover:border-[var(--color-line-green)] hover:bg-green-50
                  transition-all text-left"
              >
                <div className="text-3xl mb-3">🎓</div>
                <div className="text-[16px] font-bold text-[var(--color-line-gray-900)] mb-1">학사</div>
                <div className="text-[13px] text-[var(--color-line-gray-500)]">
                  학과 기반 또는 세부전공을 직접 선택
                </div>
              </button>
              <button
                onClick={() => handleDegreeSelect('graduate')}
                className="group p-6 rounded-2xl border-2 border-[var(--color-line-gray-200)]
                  hover:border-[var(--color-line-green)] hover:bg-green-50
                  transition-all text-left"
              >
                <div className="text-3xl mb-3">🔬</div>
                <div className="text-[16px] font-bold text-[var(--color-line-gray-900)] mb-1">석·박사</div>
                <div className="text-[13px] text-[var(--color-line-gray-500)]">
                  세부전공을 선택해 맞춤 추천
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 학과 선택 */}
        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-[13px] text-[var(--color-line-gray-400)]
                hover:text-[var(--color-line-gray-700)] mb-6 transition-colors"
            >
              ← 이전
            </button>
            <h1 className="text-[22px] font-bold text-[var(--color-line-gray-900)] mb-2">
              학과를 선택해주세요
            </h1>
            <p className="text-[14px] text-[var(--color-line-gray-500)] mb-6">
              없으면 가장 유사한 학과를 선택하세요.
            </p>
            <input
              type="text"
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
              placeholder="학과 검색..."
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-line-gray-250)]
                text-[14px] focus:outline-none focus:border-[var(--color-line-navy-500)]
                mb-3 transition-colors"
            />
            <div className="max-h-72 overflow-y-auto space-y-1 rounded-xl border border-[var(--color-line-gray-200)] p-2">
              {filteredDepts.map((d) => (
                <button
                  key={d.name}
                  onClick={() => handleDeptSelect(d.name)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-[14px]
                    text-[var(--color-line-gray-700)] hover:bg-[var(--color-line-gray-100)]
                    transition-colors flex items-center justify-between group"
                >
                  <span>{d.name}</span>
                  <span className="text-[12px] text-[var(--color-line-gray-400)]
                    group-hover:text-[var(--color-line-navy-500)] transition-colors">
                    {d.fieldLabel}
                  </span>
                </button>
              ))}
              {filteredDepts.length === 0 && (
                <p className="text-center py-6 text-[13px] text-[var(--color-line-gray-400)]">
                  검색 결과가 없습니다
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: 세부전공 선택 */}
        {step === 3 && selectedDept && (
          <div>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-[13px] text-[var(--color-line-gray-400)]
                hover:text-[var(--color-line-gray-700)] mb-6 transition-colors"
            >
              ← 이전
            </button>
            <h1 className="text-[22px] font-bold text-[var(--color-line-gray-900)] mb-1">
              {department}
            </h1>
            <p className="text-[14px] text-[var(--color-line-gray-500)] mb-6">
              {degree === 'bachelor'
                ? '학과 기반 추천 또는 세부전공을 직접 선택하세요.'
                : '세부전공을 선택하면 더 정확한 논문을 추천해드립니다.'}
            </p>

            {/* 학사만: 학과 기반 추천 옵션 */}
            {degree === 'bachelor' && (
              <button
                onClick={() => { setUseDeptRecs(true); setSubField(null) }}
                className={`w-full p-4 rounded-xl border-2 mb-3 text-left transition-all ${
                  useDeptRecs
                    ? 'border-[var(--color-line-green)] bg-green-50'
                    : 'border-[var(--color-line-gray-200)] hover:border-[var(--color-line-gray-300)]'
                }`}
              >
                <div className="text-[15px] font-semibold text-[var(--color-line-gray-900)] mb-0.5">
                  학과 전공에 맞게 추천받기
                </div>
                <div className="text-[13px] text-[var(--color-line-gray-500)]">
                  {selectedDept.fieldLabel} 전반의 논문을 추천해드립니다
                </div>
              </button>
            )}

            {/* 세부전공 선택 */}
            {selectedDept.subFields.length > 0 && (
              <div className="space-y-2">
                {degree === 'bachelor' && (
                  <p className="text-[13px] text-[var(--color-line-gray-500)] mb-2">또는 세부전공 직접 선택:</p>
                )}
                {selectedDept.subFields.map((sf) => (
                  <button
                    key={sf}
                    onClick={() => { setSubField(sf); setUseDeptRecs(false) }}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      subField === sf && !useDeptRecs
                        ? 'border-[var(--color-line-green)] bg-green-50'
                        : 'border-[var(--color-line-gray-200)] hover:border-[var(--color-line-gray-300)]'
                    }`}
                  >
                    <span className="text-[14px] text-[var(--color-line-gray-800)]">{sf}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleFinish}
              disabled={loading || (!useDeptRecs && !subField && degree === 'graduate')}
              className="w-full mt-8 py-3 rounded-xl text-[15px] font-semibold text-white
                bg-[var(--color-line-green)] hover:opacity-90 disabled:opacity-40
                transition-opacity"
            >
              {loading ? '저장 중...' : '시작하기'}
            </button>

            {degree === 'bachelor' && !useDeptRecs && !subField && (
              <button
                onClick={handleFinish}
                className="w-full mt-2 py-2.5 rounded-xl text-[14px]
                  text-[var(--color-line-gray-500)] hover:text-[var(--color-line-gray-700)]
                  transition-colors"
              >
                나중에 설정하기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
