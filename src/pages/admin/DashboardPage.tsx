import { useEffect, useState } from 'react'
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../lib/firebase'
import { useData } from '../../context/DataContext'
import type { QueryStats, DownloadStats, LeadStats, Lead } from '../../types'
import StatsCard from '../../components/admin/StatsCard'
import PageHeader from '../../components/admin/PageHeader'
import StatusBadge from '../../components/crm/StatusBadge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { isSeedNeeded, runSeed } from '../../lib/seedData'
import { formatDateTime } from '../../lib/utils'
import {
  MessageSquare, Download, Users, BarChart2,
  Database, RefreshCw, FolderOpen, Tag,
} from 'lucide-react'

export default function DashboardPage() {
  const { allCategories: categories, allSubtopics: subtopics } = useData()
  const [queryStats, setQueryStats] = useState<QueryStats | null>(null)
  const [downloadStats, setDownloadStats] = useState<DownloadStats | null>(null)
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedNeeded, setSeedNeeded] = useState(false)

  async function fetchStats() {
    setLoading(true)
    try {
      const [qDoc, dDoc, lDoc, leadsSnap, seedCheck] = await Promise.all([
        getDoc(doc(db, COLLECTIONS.STATS, 'queries')),
        getDoc(doc(db, COLLECTIONS.STATS, 'downloads')),
        getDoc(doc(db, COLLECTIONS.STATS, 'leads')),
        getDocs(query(collection(db, COLLECTIONS.LEADS), orderBy('createdAt', 'desc'), limit(5))),
        isSeedNeeded(),
      ])

      if (qDoc.exists()) setQueryStats(qDoc.data() as QueryStats)
      if (dDoc.exists()) setDownloadStats(dDoc.data() as DownloadStats)
      if (lDoc.exists()) setLeadStats(lDoc.data() as LeadStats)
      setRecentLeads(leadsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Lead)))
      setSeedNeeded(seedCheck)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  async function handleSeed() {
    setSeeding(true)
    try {
      await runSeed()
      await fetchStats()
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert('Error al inicializar la base de datos.')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center pt-20">
        <Spinner label="Cargando dashboard..." />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de actividad de SicoBot"
        actions={
          <Button variant="ghost" size="sm" onClick={fetchStats} icon={<RefreshCw size={14} />}>
            Actualizar
          </Button>
        }
      />

      {/* Seed banner */}
      {seedNeeded && (
        <div className="card p-4 mb-6 bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Database size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Base de datos vacía</p>
            <p className="text-xs text-amber-600 mt-0.5">
              No se encontraron datos. Inicializa la base de conocimiento con categorías, subtemas, respuestas y documentos de ejemplo.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleSeed}
            loading={seeding}
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600"
          >
            {seeding ? 'Inicializando...' : 'Inicializar BD'}
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Consultas totales"
          value={queryStats?.total ?? 0}
          icon={<MessageSquare size={20} />}
          color="blue"
        />
        <StatsCard
          title="Descargas"
          value={downloadStats?.total ?? 0}
          icon={<Download size={20} />}
          color="green"
        />
        <StatsCard
          title="Leads generados"
          value={leadStats?.total ?? 0}
          icon={<Users size={20} />}
          color="purple"
        />
        <StatsCard
          title="Categorías"
          value={categories.filter((c) => c.active !== false).length}
          subtitle={`${subtopics.filter((s) => s.active !== false).length} subtemas activos`}
          icon={<FolderOpen size={20} />}
          color="orange"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top categories */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart2 size={15} className="text-brand-500" />
            Consultas por categoría
          </h3>
          {!queryStats || Object.keys(queryStats.byCategory).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Aún no hay consultas registradas</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(queryStats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([catId, count]) => {
                  const cat = categories.find((c) => c.id === catId)
                  const total = queryStats.total || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={catId}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-medium truncate max-w-[70%]">
                          {cat?.icon} {cat?.name ?? catId}
                        </span>
                        <span className="text-slate-500">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Recent leads */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={15} className="text-ia" />
            Leads recientes
          </h3>
          {recentLeads.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No hay leads registrados aún</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{lead.name}</p>
                    <p className="text-xs text-slate-500 truncate">{lead.company}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <StatusBadge status={lead.status} size="sm" />
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(lead.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
