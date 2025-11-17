// web/src/components/ui/Card.tsx
import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <div className={`rounded-xl bg-white p-6 shadow-lg ${className ?? ''}`}>{children}</div>
}

