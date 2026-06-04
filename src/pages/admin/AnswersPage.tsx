import { useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../lib/firebase'
import { useCollection } from '../../hooks/useFirestore'
import { useData } from '../../context/DataContext'
import type { Answer, Subtopic } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Plus, Pencil, Trash2, MessageSquare, Eye, EyeOff,
  ToggleLeft, ToggleRight, BarChart2, Clock, User,
} from 'lucide-react'
import { formatDateTime } from '../../lib/utils'

const EMPTY_FORM = {
  categoryId: '',
  subtopicId: '',
  subtopicName: '',
  categoryName: '',
  content: '',
  tags: '',
  active: true,
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Solo activas' },
  { value: 'inactive', label: 'Solo inactivas' },
]

export default function AnswersPage() {
  const { data: answers, loading, add, update, remove } = useCollection<Answer>(COLLECTIONS.ANSWERS, 'updatedAt', 'desc')
  const { allCategories: categories } = useData()
  const [filterCatId, setFilterCatId] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const [search, setSearch] = useState('')
  const [subtopics, setSubtopics] = useState<Subtopic[]>([])
  const [modal, setModal] = useState<'add' | 'edit' | 'detail' | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)

  const categoryOptions = categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))
  const filterCatOptions = [{ value: '', label: 'Todas las categorías' }, ...categoryOptions]

  const displayed = answers.filter((a) => {
    const matchCat = !filterCatId || a.categoryId === filterCatId
    const isActive = a.active !== false
    const matchStatus =
      filterActive === 'all' ||
      (filterActive === 'active' && isActive) ||
      (filterActive === 'inactive' && !isActive)
    const matchSearch =
      !search ||
      a.subtopicName?.toLowerCase().includes(search.toLowerCase()) ||
      a.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchStatus && matchSearch
  })

  async function loadSubtopics(catId: string) {
    if (!catId) { setSubtopics([]); return }
    const q = query(collection(db, COLLECTIONS.SUBTOPICS), where('categoryId', '==', catId))
    const snap = await getDocs(q)
    setSubtopics(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subtopic)))
  }

  async function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setPreview(false)
    await loadSubtopics('')
    setModal('add')
  }

  async function openEdit(ans: Answer) {
    setForm({
      categoryId: ans.categoryId,
      subtopicId: ans.subtopicId,
      subtopicName: ans.subtopicName ?? '',
      categoryName: ans.categoryName ?? '',
      content: ans.content,
      tags: ans.tags?.join(', ') ?? '',
      active: ans.active !== false,
    })
    setEditingId(ans.id)
    setPreview(false)
    await loadSubtopics(ans.categoryId)
    setModal('edit')
  }

  function openDetail(ans: Answer) {
    setSelectedAnswer(ans)
    setModal('detail')
  }

  function closeModal() { setModal(null); setEditingId(null); setSelectedAnswer(null) }

  async function handleSave() {
    if (!form.content.trim() || !form.subtopicId) return
    setSaving(true)
    try {
      const cat = categories.find((c) => c.id === form.categoryId)
      const sub = subtopics.find((s) => s.id === form.subtopicId)
      const payload = {
        categoryId: form.categoryId,
        categoryName: cat?.name ?? form.categoryName,
        subtopicId: form.subtopicId,
        subtopicName: sub?.name ?? form.subtopicName,
        content: form.content.trim(),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        active: form.active,
        updatedBy: 'Administrador',
        consultCount: 0,
      }
      if (modal === 'edit' && editingId) {
        // Preserve consultCount on edit
        const existing = answers.find((a) => a.id === editingId)
        await update(editingId, { ...payload, consultCount: existing?.consultCount ?? 0 })
      } else {
        await add(payload as Omit<Answer, 'id' | 'createdAt' | 'updatedAt'>)
      }
      closeModal()
    } catch {
      alert('Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(ans: Answer) {
    try {
      await update(ans.id, {
        active: !(ans.active !== false),
        updatedBy: 'Administrador',
      } as Partial<Answer>)
    } catch {
      alert('Error al cambiar estado.')
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try { await remove(deleteId); setDeleteId(null) }
    catch { alert('Error al eliminar.') }
  }

  if (loading) return <div className="p-8 flex justify-center pt-20"><Spinner label="Cargando respuestas..." /></div>

  const activeCount = answers.filter((a) => a.active !== false).length
  const totalConsults = answers.reduce((acc, a) => acc + (a.consultCount ?? 0), 0)

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <PageHeader
        title="Base de Conocimiento — Respuestas"
        subtitle={`${answers.length} respuestas · ${activeCount} activas · ${totalConsults} consultas totales`}
        actions={
          <Button size="sm" onClick={openAdd} icon={<Plus size={14} />}>
            Nueva respuesta
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Input
          placeholder="Buscar en subtemas, categorías o contenido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] max-w-sm"
        />
        <Select options={filterCatOptions} value={filterCatId} onChange={(e) => setFilterCatId(e.target.value)} className="max-w-xs" />
        <Select options={STATUS_OPTIONS} value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="max-w-[180px]" />
      </div>

      <div className="card overflow-hidden">
        {displayed.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-3">
              {answers.length === 0
                ? 'No hay respuestas aún. Crea la primera desde el botón "Nueva respuesta".'
                : 'No hay respuestas que coincidan con los filtros.'}
            </p>
            {answers.length === 0 && (
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Las respuestas se asocian a un subtema específico y son el contenido que verán los usuarios al realizar consultas.
              </p>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Subtema / Categoría</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Contenido</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-1"><BarChart2 size={12} /> Consultas</div>
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-1"><Clock size={12} /> Actualizado</div>
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3">Estado</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((ans) => {
                const isActive = ans.active !== false
                return (
                  <tr key={ans.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-[10px] font-semibold text-brand-600 uppercase tracking-wide mb-0.5">
                        {ans.categoryName}
                      </p>
                      <p className={`text-sm font-medium ${isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                        {ans.subtopicName || <span className="text-slate-400 italic">Sin subtema asignado</span>}
                      </p>
                      {ans.tags && ans.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ans.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-brand-50 text-brand-600 text-[9px] rounded-md">{tag}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell max-w-xs">
                      <p className="text-xs text-slate-500 truncate">
                        {ans.content.replace(/[#*`_[\]]/g, '').slice(0, 100)}
                        {ans.content.length > 100 ? '…' : ''}
                      </p>
                    </td>
                    <td className="px-3 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <BarChart2 size={13} className="text-brand-400" />
                        <span className="text-sm font-semibold text-slate-700">{ans.consultCount ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                        <User size={11} />
                        <span>{ans.updatedBy ?? '—'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{formatDateTime(ans.updatedAt)}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        onClick={() => handleToggleActive(ans)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {isActive
                          ? <ToggleRight size={18} className="text-emerald-500" />
                          : <ToggleLeft size={18} className="text-slate-400" />
                        }
                        <span className="hidden sm:inline">{isActive ? 'Activa' : 'Inactiva'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDetail(ans)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Ver contenido"><Eye size={14} /></button>
                        <button onClick={() => openEdit(ans)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Editar"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteId(ans.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Solo las respuestas <strong>activas</strong> son mostradas en el chat. Las inactivas son invisibles para los usuarios.
      </p>

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={closeModal} title="Contenido de la respuesta" size="lg">
        {selectedAnswer && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">{selectedAnswer.categoryName}</p>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">{selectedAnswer.subtopicName}</h3>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge color={selectedAnswer.active !== false ? 'green' : 'gray'} size="sm">
                  {selectedAnswer.active !== false ? 'Activa' : 'Inactiva'}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <BarChart2 size={11} />
                  <span>{selectedAnswer.consultCount ?? 0} consultas</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 prose prose-sm max-w-none min-h-[120px]">
              {selectedAnswer.content
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedAnswer.content}</ReactMarkdown>
                : <p className="text-slate-400 italic">Sin contenido</p>
              }
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <User size={11} />
                <span>Actualizado por: <strong>{selectedAnswer.updatedBy ?? '—'}</strong></span>
              </div>
              <span>{formatDateTime(selectedAnswer.updatedAt)}</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
              <Button onClick={() => { closeModal(); setTimeout(() => openEdit(selectedAnswer), 50) }} icon={<Pencil size={13} />}>
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={closeModal} title={modal === 'edit' ? 'Editar respuesta' : 'Nueva respuesta'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Categoría *"
              value={form.categoryId}
              onChange={(e) => {
                const cat = categories.find((c) => c.id === e.target.value)
                setForm((p) => ({ ...p, categoryId: e.target.value, categoryName: cat?.name ?? '', subtopicId: '' }))
                loadSubtopics(e.target.value)
              }}
              options={categoryOptions}
              placeholder="Selecciona categoría"
            />
            <Select
              label="Subtema *"
              value={form.subtopicId}
              onChange={(e) => {
                const sub = subtopics.find((s) => s.id === e.target.value)
                setForm((p) => ({ ...p, subtopicId: e.target.value, subtopicName: sub?.name ?? '' }))
              }}
              options={subtopics.map((s) => ({ value: s.id, label: s.name }))}
              placeholder={form.categoryId ? 'Selecciona subtema' : 'Primero elige categoría'}
            />
          </div>

          {/* Content editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label">Contenido (soporta Markdown) *</label>
              <button
                type="button"
                onClick={() => setPreview((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 transition-colors"
              >
                {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                {preview ? 'Editar' : 'Vista previa'}
              </button>
            </div>

            {preview ? (
              <div className="min-h-[220px] bg-slate-50 border border-slate-200 rounded-xl p-4 prose prose-sm max-w-none overflow-y-auto">
                {form.content
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                  : <p className="text-slate-400 italic">Sin contenido</p>
                }
              </div>
            ) : (
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                rows={10}
                placeholder={`Escribe la respuesta en Markdown...

Ejemplos de formato:
**Texto en negrita**
- Punto de lista
- Otro punto

> Cita o nota importante

Puedes usar títulos con ## y ### para estructurar la respuesta.`}
                className="font-mono text-sm"
              />
            )}
          </div>

          {/* Tags */}
          <Input
            label="Etiquetas (separadas por coma)"
            placeholder="ej: comité, protocolo, legal"
            value={form.tags}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            hint="Opcional — para clasificación y búsqueda interna"
          />

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ans-active"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="w-4 h-4 rounded accent-brand-500"
            />
            <label htmlFor="ans-active" className="text-sm text-slate-700">
              Respuesta activa
              <span className="text-xs text-slate-400 ml-1">(visible en el chat)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {modal === 'edit' ? 'Guardar cambios' : 'Crear respuesta'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Eliminar respuesta" size="sm">
        <p className="text-sm text-slate-600 mb-2">¿Eliminar esta respuesta de la base de conocimiento?</p>
        <p className="text-xs text-slate-400 mb-5">Esta acción no se puede deshacer. Considera desactivarla en su lugar.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
