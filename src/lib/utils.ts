import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | { toDate: () => Date } | undefined): string {
  if (!date) return '—'
  const d = typeof (date as { toDate?: () => Date }).toDate === 'function'
    ? (date as { toDate: () => Date }).toDate()
    : (date as Date)
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | { toDate: () => Date } | undefined): string {
  if (!date) return '—'
  const d = typeof (date as { toDate?: () => Date }).toDate === 'function'
    ? (date as { toDate: () => Date }).toDate()
    : (date as Date)
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '…'
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  asignado: 'Asignado',
  contactado: 'Contactado',
  respondio: 'Respondió',
  propuesta_enviada: 'Propuesta enviada',
  ganado: 'Ganado',
  perdido: 'Perdido',
}

export const LEAD_STATUS_COLORS: Record<string, string> = {
  nuevo: 'bg-blue-100 text-blue-700',
  asignado: 'bg-indigo-100 text-indigo-700',
  contactado: 'bg-amber-100 text-amber-700',
  respondio: 'bg-orange-100 text-orange-700',
  propuesta_enviada: 'bg-purple-100 text-purple-700',
  ganado: 'bg-emerald-100 text-emerald-700',
  perdido: 'bg-rose-100 text-rose-700',
}

export const CONTACT_METHOD_LABELS: Record<string, string> = {
  email: 'Correo electrónico',
  telefono: 'Teléfono',
  whatsapp: 'WhatsApp',
}
