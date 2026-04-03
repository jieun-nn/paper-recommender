'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

type Tab = 'signin' | 'signup'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) { setError(error.message); return }

    // 온보딩 완료 여부 확인
    const session = data.session
    const profileRes = await fetch('/api/user/profile', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    const { data: profile } = await profileRes.json()

    if (profile?.onboarding_done) {
      router.push('/')
    } else {
      router.push('/onboarding')
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) { setError(error.message); return }
    setMessage('가입 완료! 이메일을 확인하거나 바로 로그인하세요.')
    setTab('signin')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-[22px] font-bold text-[var(--color-line-navy-700)]">
              Paper<span className="text-[var(--color-line-green)]">Feed</span>
            </span>
          </Link>
          <p className="mt-2 text-[13px] text-[var(--color-line-gray-500)]">
            내 전공에 맞는 최신 논문을 추천받으세요
          </p>
        </div>

        {/* Tab */}
        <div className="flex rounded-xl border border-[var(--color-line-gray-200)] overflow-hidden mb-6">
          {(['signin', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setMessage(null) }}
              className={`flex-1 py-2.5 text-[14px] font-medium transition-colors ${
                tab === t
                  ? 'bg-[var(--color-line-navy-500)] text-white'
                  : 'text-[var(--color-line-gray-600)] hover:bg-[var(--color-line-gray-100)]'
              }`}
            >
              {t === 'signin' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-line-gray-700)] mb-1.5">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-line-gray-250)]
                text-[14px] text-[var(--color-line-gray-900)]
                focus:outline-none focus:border-[var(--color-line-navy-500)]
                transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--color-line-gray-700)] mb-1.5">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="8자 이상"
              minLength={8}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-line-gray-250)]
                text-[14px] text-[var(--color-line-gray-900)]
                focus:outline-none focus:border-[var(--color-line-navy-500)]
                transition-colors"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          {message && (
            <p className="text-[13px] text-[var(--color-line-green)] bg-green-50 rounded-lg px-3 py-2">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-[15px] font-semibold text-white
              bg-[var(--color-line-green)] hover:opacity-90 disabled:opacity-50
              transition-opacity"
          >
            {loading ? '처리 중...' : tab === 'signin' ? '로그인' : '회원가입'}
          </button>
        </form>

        <p className="text-center mt-6 text-[12px] text-[var(--color-line-gray-400)]">
          <Link href="/" className="hover:text-[var(--color-line-navy-500)] transition-colors">
            로그인 없이 둘러보기 →
          </Link>
        </p>
      </div>
    </div>
  )
}
