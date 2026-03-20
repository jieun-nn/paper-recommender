'use client'

import { FIELD_LABELS } from '@/lib/fields'
import type { FieldLabel } from '@/types/paper'

interface FieldSidebarProps {
  selected: FieldLabel
  onChange: (field: FieldLabel) => void
}

export default function FieldSidebar({ selected, onChange }: FieldSidebarProps) {
  return (
    <aside className="w-48 shrink-0">
      <h2 className="text-[13px] font-semibold text-[var(--color-line-gray-500)] uppercase tracking-wider mb-3 px-3">
        분야
      </h2>
      <nav>
        <ul className="space-y-0.5">
          {FIELD_LABELS.map((label) => {
            const isActive = selected === label
            return (
              <li key={label}>
                <button
                  onClick={() => onChange(label as FieldLabel)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    isActive
                      ? 'bg-[var(--color-line-green)] text-white font-medium'
                      : 'text-[var(--color-line-gray-700)] hover:bg-[var(--color-line-gray-100)]'
                  }`}
                >
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
