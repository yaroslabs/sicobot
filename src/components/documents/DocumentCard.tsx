import { FileText, Download, Lock, ExternalLink } from 'lucide-react'
import { ref, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { useState } from 'react'
import { storage, db, COLLECTIONS } from '../../lib/firebase'
import type { SicoDocument } from '../../types'
import { formatBytes } from '../../lib/utils'
import Badge from '../ui/Badge'

interface DocumentCardProps {
  document: SicoDocument
  canAccess: boolean
}

const MIME_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-powerpoint': '📋',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📋',
}

export default function DocumentCard({ document, canAccess }: DocumentCardProps) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    if (!canAccess || !document.storagePath) return
    setLoading(true)
    try {
      const storageRef = ref(storage, document.storagePath)
      const url = await getDownloadURL(storageRef)

      // Track download
      const statsRef = doc(db, COLLECTIONS.STATS, 'downloads')
      await Promise.all([
        updateDoc(statsRef, {
          total: increment(1),
          [`byDocument.${document.id}`]: increment(1),
          lastUpdated: serverTimestamp(),
        }),
        updateDoc(doc(db, COLLECTIONS.DOCUMENTS, document.id), {
          downloadCount: increment(1),
        }),
      ])

      // Trigger download
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.fileName
      a.target = '_blank'
      a.rel = 'noopener'
      a.click()
    } catch {
      // File not uploaded yet — show placeholder
      alert('El archivo estará disponible próximamente.')
    } finally {
      setLoading(false)
    }
  }

  const icon = document.mimeType ? (MIME_ICONS[document.mimeType] ?? '📄') : '📄'

  return (
    <div className="card p-4 flex items-start gap-3 card-hover group">
      <div className="flex-shrink-0 w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-xl">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug truncate">
            {document.name}
          </h3>
          <Badge color={document.accessLevel === 'public' ? 'blue' : 'purple'} size="sm">
            {document.accessLevel === 'public' ? 'Público' : 'Asesor'}
          </Badge>
        </div>

        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
          {document.description}
        </p>

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            {document.fileSize ? (
              <span>{formatBytes(document.fileSize)}</span>
            ) : null}
            {document.downloadCount > 0 && (
              <span>{document.downloadCount} descargas</span>
            )}
          </div>

          {canAccess ? (
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download size={13} />
                  Descargar
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Lock size={11} />
              <span>Solo asesores</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
