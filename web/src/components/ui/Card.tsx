// web/src/components/ui/Card.tsx
import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-900/5 ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
