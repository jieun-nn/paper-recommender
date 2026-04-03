import type { Metadata } from 'next'
import './globals.css'
import AuthButton from '@/components/AuthButton'

export const metadata: Metadata = {
  title: 'PaperFeed — 분야별 최신 논문 추천',
  description: '물리, 반도체, AI, 소프트웨어, 디자인, 심리 등 모든 분야의 최신 논문을 Claude AI 요약과 함께 제공합니다.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[var(--color-line-gray-200)]">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-[17px] font-bold text-[var(--color-line-navy-700)]">
                Paper<span className="text-[var(--color-line-green)]">Feed</span>
              </span>
            </a>
            <nav className="flex items-center gap-4 text-[13px] text-[var(--color-line-gray-600)]">
              <a href="/" className="hover:text-[var(--color-line-navy-500)] transition-colors">홈</a>
              <AuthButton />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-[var(--color-line-gray-200)] mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 text-[12px] text-[var(--color-line-gray-400)] text-center">
            논문 데이터: arXiv, Semantic Scholar · AI 요약: Claude (Anthropic)
          </div>
        </footer>
      </body>
    </html>
  )
}
