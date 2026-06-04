import { Timestamp } from 'firebase/firestore'

// ─── Knowledge Base ───────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  description: string
  keywords: string[]
  icon: string
  order: number
  active: boolean
  updatedBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Subtopic {
  id: string
  categoryId: string
  categoryName: string
  name: string
  description: string
  keywords: string[]
  order: number
  active: boolean
  updatedBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Answer {
  id: string
  subtopicId: string
  subtopicName: string
  categoryId: string
  categoryName: string
  content: string
  tags: string[]
  active: boolean
  updatedBy: string
  consultCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Documents ────────────────────────────────────────────────────────────────

export type DocumentAccess = 'public' | 'advisor'

export interface SicoDocument {
  id: string
  name: string
  description: string
  storagePath: string
  fileName: string
  fileSize?: number
  mimeType?: string
  accessLevel: DocumentAccess
  downloadCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Leads / CRM ──────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'nuevo'
  | 'asignado'
  | 'contactado'
  | 'respondio'
  | 'propuesta_enviada'
  | 'ganado'
  | 'perdido'

export type ContactMethod = 'email' | 'telefono' | 'whatsapp'

export interface Lead {
  id: string
  name: string
  company: string
  position: string
  email: string
  phone: string
  need: string
  contactMethod: ContactMethod
  status: LeadStatus
  assignedTo?: string
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Advisors ─────────────────────────────────────────────────────────────────

export interface Advisor {
  id: string
  name: string
  email: string
  password: string
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface QueryStats {
  total: number
  byCategory: Record<string, number>
  bySubtopic: Record<string, number>
  lastUpdated: Timestamp
}

export interface DownloadStats {
  total: number
  byDocument: Record<string, number>
  lastUpdated: Timestamp
}

export interface LeadStats {
  total: number
  byStatus: Record<LeadStatus, number>
  lastUpdated: Timestamp
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'public' | 'advisor' | 'admin'

export interface AuthState {
  role: UserRole
  advisorId?: string
  advisorName?: string
}

// ─── Chat / Classifier ────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'bot'

export type BotMessageVariant =
  | 'classification-categories'
  | 'classification-subtopics'
  | 'answer'
  | 'info'
  | 'error'

export interface ChatMessage {
  id: string
  role: MessageRole
  content?: string
  variant?: BotMessageVariant
  categories?: Category[]
  subtopics?: Subtopic[]
  answer?: Answer
  subtopicName?: string
  categoryName?: string
  timestamp: Date
}

export interface ClassificationResult {
  confident: boolean
  topCategory?: Category
  suggestedSubtopics?: Subtopic[]
  suggestedCategories?: Category[]
  score: number
}

// ─── Admin Config ─────────────────────────────────────────────────────────────

export interface AppConfig {
  adminPassword: string
  appName: string
  version: string
}
