import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db, COLLECTIONS } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import type { SicoDocument } from '../types'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import DocumentCard from '../components/documents/DocumentCard'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { FileText, Lock, LogOut } from 'lucide-react'

export default function AdvisorDocumentsPage() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<SicoDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocs() {
      try {
        const snap = await getDocs(
          query(collection(db, COLLECTIONS.DOCUMENTS), orderBy('accessLevel', 'asc'))
        )
        setDocuments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SicoDocument)))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  const publicDocs = documents.filter((d) => d.accessLevel === 'public')
  const advisorDocs = documents.filter((d) => d.accessLevel === 'advisor')

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
                <Lock size={13} />
                Área exclusiva para asesores
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Bienvenido, {auth.advisorName}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Tienes acceso completo a todos los documentos del protocolo.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut size={14} />}>
              Salir
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner label="Cargando documentos..." />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Advisor-exclusive documents */}
              <section>
                <h2 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Lock size={16} className="text-ia" />
                  Documentos exclusivos para asesores
                  <span className="ml-auto text-xs text-slate-400 font-normal">{advisorDocs.length} documentos</span>
                </h2>
                {advisorDocs.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay documentos de asesor disponibles aún.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {advisorDocs.map((docItem) => (
                      <DocumentCard key={docItem.id} document={docItem} canAccess={true} />
                    ))}
                  </div>
                )}
              </section>

              {/* Public documents (also accessible) */}
              <section>
                <h2 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-brand-500" />
                  Documentos públicos
                  <span className="ml-auto text-xs text-slate-400 font-normal">{publicDocs.length} documentos</span>
                </h2>
                {publicDocs.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay documentos públicos disponibles.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {publicDocs.map((docItem) => (
                      <DocumentCard key={docItem.id} document={docItem} canAccess={true} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
