import type { LeadStatus } from '../../types'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface StatusBadgeProps {
  status: LeadStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        LEAD_STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'
      )}
    >
      {LEAD_STATUS_LABELS[status] ?? status}
    </span>
  )
}
