import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db, COLLECTIONS } from '../lib/firebase'
import type { SicoDocument } from '../types'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import DocumentCard from '../components/documents/DocumentCard'
import Spinner from '../components/ui/Spinner'
import { FileText, Lock, ChevronRight } from 'lucide-react'

export default function DocumentsPage() {
  const { isAdvisor } = useAuth()
  const [documents, setDocuments] = useState<SicoDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocs() {
      try {
        const snap = await getDocs(
          query(collection(db, COLLECTIONS.DOCUMENTS), orderBy('createdAt', 'asc'))
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

  const publicDocs = documents.filter((d) => d.accessLevel === 'public')
  const advisorDocs = documents.filter((d) => d.accessLevel === 'advisor')

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              <FileText size={13} />
              Centro de documentos
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Documentos del Protocolo
            </h1>
            <p className="mt-2 text-slate-500 text-sm max-w-lg mx-auto">
              Accede a los documentos oficiales, guías y planillas del Protocolo de Vigilancia de Riesgos Psicosociales.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner label="Cargando documentos..." />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Public documents */}
              <section>
                <h2 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-brand-500" />
                  Documentos públicos
                </h2>
                {publicDocs.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay documentos públicos disponibles aún.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {publicDocs.map((doc) => (
                      <DocumentCard key={doc.id} document={doc} canAccess={true} />
                    ))}
                  </div>
                )}
              </section>

              {/* Advisor documents */}
              <section>
                <h2 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Lock size={16} className="text-ia" />
                  Documentos para asesores
                </h2>

                {!isAdvisor && (
                  <div className="card p-4 mb-4 bg-violet-50 border border-violet-100 flex items-start gap-3">
                    <Lock size={16} className="text-ia flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-violet-800">Acceso exclusivo para asesores</p>
                      <p className="text-xs text-violet-600 mt-0.5 mb-2">
                        Estos documentos requieren credenciales de asesor para descargarse.
                      </p>
                      <Link
                        to="/asesor"
                        className="inline-flex items-center gap-1 text-xs font-medium text-ia hover:text-violet-700 transition-colors"
                      >
                        Ingresar como asesor <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                )}

                {advisorDocs.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay documentos de asesor disponibles aún.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {advisorDocs.map((docItem) => (
                      <DocumentCard
                        key={docItem.id}
                        document={docItem}
                        canAccess={isAdvisor}
                      />
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
