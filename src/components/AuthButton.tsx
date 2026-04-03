'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-[13px] px-3 py-1.5 rounded-lg
          bg-[var(--color-line-green)] text-white font-medium
          hover:opacity-90 transition-opacity"
      >
        로그인
      </Link>
    )
  }

  const initials = (user.email ?? '?')[0].toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 text-[13px] text-[var(--color-line-gray-700)]
          hover:text-[var(--color-line-gray-900)] transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-[var(--color-line-navy-400)] text-white
          flex items-center justify-center text-[12px] font-bold shrink-0">
          {initials}
        </span>
        <span className="hidden sm:block max-w-[120px] truncate">{user.email}</span>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-48
            bg-white border border-[var(--color-line-gray-200)] rounded-xl shadow-lg
            overflow-hidden">
            <Link
              href="/onboarding"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-[13px] text-[var(--color-line-gray-700)]
                hover:bg-[var(--color-line-gray-100)] transition-colors"
            >
              전공 설정 변경
            </Link>
            <hr className="border-[var(--color-line-gray-150)]" />
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 text-[13px] text-red-500
                hover:bg-red-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  )
}
