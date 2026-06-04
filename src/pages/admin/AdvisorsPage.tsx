import { useState } from 'react'
import { COLLECTIONS } from '../../lib/firebase'
import { useCollection } from '../../hooks/useFirestore'
import type { Advisor } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { Plus, Pencil, Trash2, UserCog, Eye, EyeOff, Key } from 'lucide-react'
import { formatDate } from '../../lib/utils'

const EMPTY_FORM = { name: '', email: '', password: '', active: true }

export default function AdvisorsPage() {
  const { data: advisors, loading, add, update, remove } = useCollection<Advisor>(COLLECTIONS.ADVISORS, 'createdAt', 'desc')
  const [modal, setModal] = useState<'add' | 'edit' | 'password' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function openAdd() { setForm(EMPTY_FORM); setEditingId(null); setShowPass(false); setModal('add') }

  function openEdit(adv: Advisor) {
    setForm({ name: adv.name, email: adv.email, password: '', active: adv.active })
    setEditingId(adv.id)
    setShowPass(false)
    setModal('edit')
  }

  function openChangePassword(adv: Advisor) {
    setEditingId(adv.id)
    setNewPassword('')
    setShowPass(false)
    setModal('password')
  }

  function closeModal() { setModal(null); setEditingId(null) }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return
    if (modal === 'add' && !form.password.trim()) { alert('La contraseña es requerida'); return }
    setSaving(true)
    try {
      if (modal === 'edit' && editingId) {
        const updates: Partial<Advisor> = { name: form.name, email: form.email, active: form.active }
        await update(editingId, updates)
      } else {
        await add({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password.trim(),
          active: true,
        } as Omit<Advisor, 'id' | 'createdAt' | 'updatedAt'>)
      }
      closeModal()
    } catch { alert('Error al guardar.') }
    finally { setSaving(false) }
  }

  async function handleChangePassword() {
    if (!editingId || !newPassword.trim()) return
    setSaving(true)
    try {
      await update(editingId, { password: newPassword.trim() } as Partial<Advisor>)
      closeModal()
    } catch { alert('Error al cambiar contraseña.') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    try { await remove(deleteId); setDeleteId(null) }
    catch { alert('Error al eliminar.') }
  }

  if (loading) return <div className="p-8 flex justify-center pt-20"><Spinner label="Cargando asesores..." /></div>

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <PageHeader
        title="Asesores"
        subtitle={`${advisors.length} asesores registrados`}
        actions={<Button size="sm" onClick={openAdd} icon={<Plus size={14} />}>Nuevo asesor</Button>}
      />

      <div className="card overflow-hidden">
        {advisors.length === 0 ? (
          <div className="p-12 text-center">
            <UserCog size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No hay asesores registrados.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Asesor</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden sm:table-cell">Estado</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Creado</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {advisors.map((adv) => (
                <tr key={adv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-800">{adv.name}</p>
                    <p className="text-xs text-slate-500">{adv.email}</p>
                  </td>
                  <td className="px-3 py-3.5 hidden sm:table-cell">
                    <Badge color={adv.active ? 'green' : 'gray'} size="sm">
                      {adv.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-3 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-slate-500">{formatDate(adv.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(adv)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Editar"><Pencil size={14} /></button>
                      <button onClick={() => openChangePassword(adv)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Cambiar contraseña"><Key size={14} /></button>
                      <button onClick={() => setDeleteId(adv.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={closeModal} title={modal === 'edit' ? 'Editar asesor' : 'Nuevo asesor'} size="sm">
        <div className="space-y-4">
          <Input label="Nombre completo *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Correo electrónico *" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          {modal === 'add' && (
            <Input
              label="Contraseña *"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              rightElement={
                <button type="button" onClick={() => setShowPass((v) => !v)} className="text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
          )}
          {modal === 'edit' && (
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked })) } className="rounded" />
              <label htmlFor="active" className="text-sm text-slate-700">Cuenta activa</label>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>{modal === 'edit' ? 'Guardar' : 'Crear asesor'}</Button>
          </div>
        </div>
      </Modal>

      {/* Change password modal */}
      <Modal open={modal === 'password'} onClose={closeModal} title="Cambiar contraseña" size="sm">
        <div className="space-y-4">
          <Input
            label="Nueva contraseña *"
            type={showPass ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            rightElement={
              <button type="button" onClick={() => setShowPass((v) => !v)} className="text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleChangePassword} loading={saving}>Cambiar contraseña</Button>
          </div>
        </div>
      </Modal>

      {/* Delete */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Eliminar asesor" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Eliminar este asesor? Perderá el acceso al sistema inmediatamente.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
