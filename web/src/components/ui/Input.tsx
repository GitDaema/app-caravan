// web/src/components/ui/Input.tsx
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      ref={ref}
      className="block w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-1 focus:ring-offset-slate-50 transition-colors"
      {...props}
    />
  )
})

Input.displayName = 'Input'
