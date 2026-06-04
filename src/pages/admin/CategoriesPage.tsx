import { useState } from 'react'
import { COLLECTIONS } from '../../lib/firebase'
import { useCollection } from '../../hooks/useFirestore'
import { useData } from '../../context/DataContext'
import type { Category } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'

const EMPTY_FORM = {
  name: '',
  description: '',
  keywords: '',
  icon: '📌',
  order: 99,
  active: true,
}

export default function CategoriesPage() {
  const { data: categories, loading, add, update, remove } = useCollection<Category>(COLLECTIONS.CATEGORIES, 'order')
  const { refresh } = useData()
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setModal('add')
  }

  function openEdit(cat: Category) {
    setForm({
      name: cat.name,
      description: cat.description,
      keywords: cat.keywords.join(', '),
      icon: cat.icon,
      order: cat.order,
      active: cat.active !== false,
    })
    setEditingId(cat.id)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditingId(null)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        icon: form.icon || '📌',
        order: Number(form.order) || 99,
        active: form.active,
        updatedBy: 'Administrador',
      }
      if (modal === 'edit' && editingId) {
        await update(editingId, payload)
      } else {
        await add(payload as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>)
      }
      await refresh()
      closeModal()
    } catch {
      alert('Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(cat: Category) {
    try {
      await update(cat.id, { active: !cat.active, updatedBy: 'Administrador' } as Partial<Category>)
      await refresh()
    } catch {
      alert('Error al cambiar estado.')
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await remove(deleteId)
      await refresh()
      setDeleteId(null)
    } catch {
      alert('Error al eliminar.')
    }
  }

  if (loading) {
    return <div className="p-8 flex justify-center pt-20"><Spinner label="Cargando categorías..." /></div>
  }

  const activeCount = categories.filter((c) => c.active !== false).length

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <PageHeader
        title="Categorías"
        subtitle={`${categories.length} categorías · ${activeCount} activas`}
        actions={
          <Button size="sm" onClick={openAdd} icon={<Plus size={14} />}>
            Nueva categoría
          </Button>
        }
      />

      <div className="card overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No hay categorías. Crea la primera o inicializa la BD desde el Dashboard.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3 w-8">#</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3">Categoría</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Keywords</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">Actualizado</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3">Estado</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => {
                const isActive = cat.active !== false
                return (
                  <tr key={cat.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-slate-400">{i + 1}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xl ${!isActive ? 'opacity-40 grayscale' : ''}`}>{cat.icon}</span>
                        <div>
                          <p className={`text-sm font-medium ${isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs hidden sm:block">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cat.keywords.slice(0, 3).map((kw) => (
                          <span key={kw} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md">{kw}</span>
                        ))}
                        {cat.keywords.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{cat.keywords.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 hidden lg:table-cell">
                      <p className="text-xs text-slate-500">{cat.updatedBy ?? '—'}</p>
                      <p className="text-[10px] text-slate-400">{formatDateTime(cat.updatedAt)}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={isActive ? 'Desactivar' : 'Activar'}
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
                        <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteId(cat.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Note */}
      <p className="text-xs text-slate-400 mt-3">
        Solo las categorías <strong>activas</strong> son visibles en el chat y el clasificador.
      </p>

      {/* Add / Edit Modal */}
      <Modal open={modal !== null} onClose={closeModal} title={modal === 'edit' ? 'Editar categoría' : 'Nueva categoría'}>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              label="Icono"
              value={form.icon}
              onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
              className="w-20 text-center text-xl"
            />
            <div className="flex-1">
              <Input
                label="Nombre *"
                placeholder="Ej: Comités de Aplicación"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
          </div>

          <Textarea
            label="Descripción"
            placeholder="Breve descripción de la categoría..."
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={2}
          />

          <Textarea
            label="Keywords para clasificación (separadas por coma)"
            placeholder="comité, aplicación, integrantes, roles, organizar..."
            value={form.keywords}
            onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))}
            rows={3}
            hint="Las keywords permiten al clasificador asociar preguntas a esta categoría"
          />

          <div className="flex items-center gap-6">
            <Input
              label="Orden de aparición"
              type="number"
              value={String(form.order)}
              onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
              className="w-24"
            />
            <div className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                id="cat-active"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                className="w-4 h-4 rounded accent-brand-500"
              />
              <label htmlFor="cat-active" className="text-sm text-slate-700">Categoría activa</label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {modal === 'edit' ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Eliminar categoría" size="sm">
        <p className="text-sm text-slate-600 mb-5">
          ¿Eliminar esta categoría? Los subtemas y respuestas asociados no se eliminan automáticamente.
          Considera desactivarla en su lugar.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
