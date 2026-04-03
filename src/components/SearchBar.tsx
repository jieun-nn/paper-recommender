'use client'

import { useState } from 'react'

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
  onSearch?: (q: string) => void
}

export default function SearchBar({
  defaultValue = '',
  placeholder = '논문 제목, 저자, 키워드 검색...',
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch?.(value.trim())
  }

  function handleClear() {
    setValue('')
    onSearch?.('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        {/* Search icon */}
        <svg
          className="absolute left-3 text-[var(--color-line-gray-400)] pointer-events-none"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-line-gray-250)]
            bg-[var(--color-line-gray-100)] text-[14px] text-[var(--color-line-gray-900)]
            placeholder:text-[var(--color-line-gray-400)]
            focus:outline-none focus:border-[var(--color-line-navy-500)] focus:bg-white
            transition-colors"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-[var(--color-line-gray-400)] hover:text-[var(--color-line-gray-600)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}
