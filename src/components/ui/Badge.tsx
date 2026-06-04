import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray' | 'orange' | 'emerald' | 'rose'

interface BadgeProps {
  children: ReactNode
  color?: BadgeColor
  size?: 'sm' | 'md'
  className?: string
}

const colorClasses: Record<BadgeColor, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-rose-100 text-rose-700',
  purple: 'bg-violet-100 text-violet-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  gray: 'bg-slate-100 text-slate-600',
  orange: 'bg-orange-100 text-orange-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose: 'bg-rose-100 text-rose-700',
}

export default function Badge({
  children,
  color = 'blue',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  )
}
