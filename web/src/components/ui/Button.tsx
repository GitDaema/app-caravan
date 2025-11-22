// web/src/components/ui/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

const base =
  'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold tracking-tight ' +
  'transition-colors transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ' +
  'shadow-sm hover:shadow-md hover:-translate-y-0.5'

const variants: Record<string, string> = {
  primary:
    'bg-[#0F766E] text-white hover:bg-[#115e57] focus-visible:ring-[#0F766E] focus-visible:ring-offset-slate-50',
  secondary:
    'bg-white text-slate-900 ring-1 ring-gray-900/5 hover:text-[#0F766E] hover:bg-slate-50 ' +
    'focus-visible:ring-[#0F766E]',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300 focus-visible:ring-offset-slate-50',
}

export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
