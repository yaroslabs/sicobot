import { useState } from 'react'
import { COLLECTIONS } from '../../lib/firebase'
import { useCollection } from '../../hooks/useFirestore'
import { useData } from '../../context/DataContext'
import type { Subtopic } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'

const EMPTY_FORM = { categoryId: '', name: '', description: '', keywords: '', order: 99, active: true }

export default function SubtopicsPage() {
  const { data: subtopics, loading, add, update, remove } = useCollection<Subtopic>(COLLECTIONS.SUBTOPICS, 'order')
  const { allCategories: categories, refresh } = useData()
  const [filterCatId, setFilterCatId] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const categoryOptions = categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))
  const filterOptions = [{ value: '', label: 'Todas las categorías' }, ...categoryOptions]
  const statusFilterOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Solo activos' },
    { value: 'inactive', label: 'Solo inactivos' },
  ]

  const displayed = subtopics.filter((s) => {
    const matchCat = !filterCatId || s.categoryId === filterCatId
    const isActive = s.active !== false
    const matchStatus =
      filterActive === 'all' ||
      (filterActive === 'active' && isActive) ||
      (filterActive === 'inactive' && !isActive)
    return matchCat && matchStatus
  })

  function openAdd() {
    setForm({ ...EMPTY_FORM, categoryId: filterCatId || categories[0]?.id || '' })
    setEditingId(null)
    setModal('add')
  }

  function openEdit(sub: Subtopic) {
    setForm({
      categoryId: sub.categoryId,
      name: sub.name,
      description: sub.description,
      keywords: sub.keywords.join(', '),
      order: sub.order,
      active: sub.active !== false,
    })
    setEditingId(sub.id)
    setModal('edit')
  }

  function closeModal() { setModal(null); setEditingId(null) }

  async function handleSave() {
    if (!form.name.trim() || !form.categoryId) return
    setSaving(true)
    try {
      const cat = categories.find((c) => c.id === form.categoryId)
      const payload = {
        categoryId: form.categoryId,
        categoryName: cat?.name ?? '',
        name: form.name.trim(),
        description: form.description.trim(),
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        order: Number(form.order) || 99,
        active: form.active,
        updatedBy: 'Administrador',
      }
      if (modal === 'edit' && editingId) {
        await update(editingId, payload)
      } else {
        await add(payload as Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>)
      }
      await refresh()
      closeModal()
    } catch {
      alert('Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(sub: Subtopic) {
    try {
      await update(sub.id, { active: !(sub.active !== false), updatedBy: 'Administrador' } as Partial<Subtopic>)
      await refresh()
    } catch {
      alert('Error al cambiar estado.')
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try { await remove(deleteId); setDeleteId(null) }
    catch { alert('Error al eliminar.') }
  }

  if (loading) return <div className="p-8 flex justify-center pt-20"><Spinner label="Cargando subtemas..." /></div>

  const activeCount = subtopics.filter((s) => s.active !== false).length

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <PageHeader
        title="Subtemas"
        subtitle={`${subtopics.length} subtemas · ${activeCount} activos`}
        actions={
          <Button size="sm" onClick={openAdd} icon={<Plus size={14} />}>
            Nuevo subtema
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select options={filterOptions} value={filterCatId} onChange={(e) => setFilterCatId(e.target.value)} className="max-w-xs" />
        <Select options={statusFilterOptions} value={filterActive} onChange={(e) => setFilterActive(e.target.value as typeof filterActive)} className="max-w-[180px]" />
      </div>

      <div className="card overflow-hidden">
        {displayed.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No hay subtemas que coincidan con los filtros.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Subtema</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden sm:table-cell">Categoría</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">Actualizado</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3">Estado</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((sub) => {
                const cat = categories.find((c) => c.id === sub.categoryId)
                const isActive = sub.active !== false
                return (
                  <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className={`text-sm font-medium ${isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                        {sub.name}
                      </p>
                      {sub.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs hidden sm:block">{sub.description}</p>
                      )}
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <span className="text-xs font-medium text-slate-600">
                        {cat?.icon} {cat?.name ?? sub.categoryId}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 hidden lg:table-cell">
                      <p className="text-xs text-slate-500">{sub.updatedBy ?? '—'}</p>
                      <p className="text-[10px] text-slate-400">{formatDateTime(sub.updatedAt)}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        onClick={() => handleToggleActive(sub)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {isActive
                          ? <ToggleRight size={18} className="text-emerald-500" />
                          : <ToggleLeft size={18} className="text-slate-400" />
                        }
                        <span className="hidden sm:inline">{isActive ? 'Activo' : 'Inactivo'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(sub)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteId(sub.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
        Solo los subtemas <strong>activos</strong> son visibles en el chat.
      </p>

      {/* Add/Edit Modal */}
      <Modal open={modal !== null} onClose={closeModal} title={modal === 'edit' ? 'Editar subtema' : 'Nuevo subtema'}>
        <div className="space-y-4">
          <Select
            label="Categoría *"
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            options={categoryOptions}
            placeholder="Selecciona una categoría"
          />
          <Input
            label="Nombre del subtema *"
            placeholder="Ej: ¿Quiénes deben integrar el comité?"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Descripción"
            placeholder="Descripción breve..."
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <Textarea
            label="Keywords para clasificación (separadas por coma)"
            placeholder="quienes, integrantes, miembros, participar..."
            value={form.keywords}
            onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))}
            rows={2}
            hint="Keywords que permiten al clasificador seleccionar este subtema"
          />
          <div className="flex items-center gap-6">
            <Input
              label="Orden"
              type="number"
              value={String(form.order)}
              onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
              className="w-24"
            />
            <div className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                id="sub-active"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                className="w-4 h-4 rounded accent-brand-500"
              />
              <label htmlFor="sub-active" className="text-sm text-slate-700">Subtema activo</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {modal === 'edit' ? 'Guardar cambios' : 'Crear subtema'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Eliminar subtema" size="sm">
        <p className="text-sm text-slate-600 mb-5">
          ¿Eliminar este subtema? La respuesta asociada no se elimina automáticamente. Considera desactivarlo en su lugar.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
