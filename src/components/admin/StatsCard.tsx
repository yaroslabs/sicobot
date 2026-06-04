import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'rose'
  trend?: { value: number; label: string }
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-700' },
  green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700' },
  purple: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', text: 'text-violet-700' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', text: 'text-orange-700' },
  rose: { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', text: 'text-rose-700' },
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  trend,
}: StatsCardProps) {
  const colors = colorMap[color]

  return (
    <div className={cn('card p-5 card-hover', colors.bg)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', colors.text)}>
            {typeof value === 'number' ? value.toLocaleString('es-CL') : value}
          </p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <p
              className={cn(
                'text-xs mt-1 font-medium',
                trend.value >= 0 ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-2xl flex-shrink-0', colors.icon)}>
          {icon}
        </div>
      </div>
    </div>
  )
}
