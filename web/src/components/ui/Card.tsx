// web/src/components/ui/Card.tsx
import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white border border-gray-200 p-6 shadow-xl shadow-gray-400/20 ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
