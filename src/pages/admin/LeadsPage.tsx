import { useState } from 'react'
import { COLLECTIONS } from '../../lib/firebase'
import { useCollection } from '../../hooks/useFirestore'
import type { Lead, LeadStatus } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import StatusBadge from '../../components/crm/StatusBadge'
import { Users, Search, Eye, Pencil } from 'lucide-react'
import { formatDateTime, LEAD_STATUS_LABELS, CONTACT_METHOD_LABELS } from '../../lib/utils'

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'asignado', label: 'Asignado' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'respondio', label: 'Respondió' },
  { value: 'propuesta_enviada', label: 'Propuesta enviada' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' },
]

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  ...STATUS_OPTIONS,
]

export default function LeadsPage() {
  const { data: leads, loading, update } = useCollection<Lead>(COLLECTIONS.LEADS, 'createdAt', 'desc')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [editModal, setEditModal] = useState(false)
  const [editStatus, setEditStatus] = useState<LeadStatus>('nuevo')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || l.status === filterStatus
    return matchSearch && matchStatus
  })

  function openDetail(lead: Lead) {
    setSelectedLead(lead)
  }

  function openEdit(lead: Lead) {
    setSelectedLead(lead)
    setEditStatus(lead.status)
    setEditNotes(lead.notes ?? '')
    setEditModal(true)
  }

  async function handleUpdate() {
    if (!selectedLead) return
    setSaving(true)
    try {
      await update(selectedLead.id, { status: editStatus, notes: editNotes } as Partial<Lead>)
      setEditModal(false)
    } catch {
      alert('Error al actualizar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center pt-20"><Spinner label="Cargando leads..." /></div>

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <PageHeader
        title="Leads CRM"
        subtitle={`${leads.length} leads en total`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input
          placeholder="Buscar por nombre, empresa o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={14} />}
          className="max-w-sm"
        />
        <Select
          options={STATUS_FILTER_OPTIONS}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Stats strip */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_OPTIONS.map((s) => {
          const count = leads.filter((l) => l.status === s.value).length
          return count > 0 ? (
            <button
              key={s.value}
              onClick={() => setFilterStatus(filterStatus === s.value ? '' : s.value)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs transition-colors"
            >
              <StatusBadge status={s.value} size="sm" />
              <span className="font-bold text-slate-700">{count}</span>
            </button>
          ) : null
        })}
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No hay leads que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Contacto</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden sm:table-cell">Empresa / Cargo</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Fecha</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-slate-800">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.email}</p>
                  </td>
                  <td className="px-3 py-3.5 hidden sm:table-cell">
                    <p className="text-sm text-slate-700">{lead.company}</p>
                    <p className="text-xs text-slate-400">{lead.position}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-3 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-slate-500">{formatDateTime(lead.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openDetail(lead)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Ver detalle"><Eye size={14} /></button>
                      <button onClick={() => openEdit(lead)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Editar estado"><Pencil size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={!!selectedLead && !editModal} onClose={() => setSelectedLead(null)} title="Detalle del lead" size="md">
        {selectedLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Nombre', selectedLead.name],
                ['Empresa', selectedLead.company],
                ['Cargo', selectedLead.position],
                ['Correo', selectedLead.email],
                ['Teléfono', selectedLead.phone],
                ['Contacto preferido', CONTACT_METHOD_LABELS[selectedLead.contactMethod] ?? selectedLead.contactMethod],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">{label}</p>
                  <p className="text-sm text-slate-800">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Necesidad</p>
              <p className="text-sm text-slate-800 bg-slate-50 rounded-xl p-3">{selectedLead.need}</p>
            </div>
            {selectedLead.notes && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Notas</p>
                <p className="text-sm text-slate-800 bg-slate-50 rounded-xl p-3">{selectedLead.notes}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <StatusBadge status={selectedLead.status} />
              <Button size="sm" onClick={() => { openEdit(selectedLead) }} icon={<Pencil size={13} />}>
                Cambiar estado
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Actualizar estado" size="sm">
        <div className="space-y-4">
          <Select
            label="Estado"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as LeadStatus)}
            options={STATUS_OPTIONS}
          />
          <Textarea
            label="Notas internas"
            placeholder="Agrega notas sobre el seguimiento de este lead..."
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditModal(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} loading={saving}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
