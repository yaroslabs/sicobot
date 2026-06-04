import { useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../../lib/firebase'
import { COLLECTIONS } from '../../lib/firebase'
import { useCollection } from '../../hooks/useFirestore'
import type { SicoDocument, DocumentAccess } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { Plus, Pencil, Trash2, FileText, Upload } from 'lucide-react'
import { formatBytes } from '../../lib/utils'

const ACCESS_OPTIONS = [
  { value: 'public', label: 'Público' },
  { value: 'advisor', label: 'Solo asesores' },
]

const EMPTY_FORM = { name: '', description: '', accessLevel: 'public' as DocumentAccess }

export default function DocumentsAdminPage() {
  const { data: documents, loading, add, update, remove, refetch } = useCollection<SicoDocument>(COLLECTIONS.DOCUMENTS, 'createdAt', 'desc')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function openAdd() {
    setForm(EMPTY_FORM)
    setFile(null)
    setUploadProgress(0)
    setEditingId(null)
    setModal('add')
  }

  function openEdit(doc: SicoDocument) {
    setForm({ name: doc.name, description: doc.description, accessLevel: doc.accessLevel })
    setFile(null)
    setEditingId(doc.id)
    setModal('edit')
  }

  function closeModal() { setModal(null); setEditingId(null); setFile(null) }

  async function uploadFile(orgPath: string): Promise<{ storagePath: string; fileName: string; fileSize: number; mimeType: string }> {
    if (!file) throw new Error('No file selected')
    const storageRef = ref(storage, orgPath)
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file)
      task.on(
        'state_changed',
        (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        () => resolve({
          storagePath: orgPath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        })
      )
    })
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      let fileData = {}
      if (file) {
        const path = `documents/${Date.now()}_${file.name}`
        fileData = await uploadFile(path)
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        accessLevel: form.accessLevel,
        ...fileData,
      }

      if (modal === 'edit' && editingId) {
        await update(editingId, payload)
      } else {
        await add({
          ...payload,
          storagePath: '',
          fileName: file?.name ?? '',
          downloadCount: 0,
        } as Omit<SicoDocument, 'id' | 'createdAt' | 'updatedAt'>)
      }
      closeModal()
    } catch {
      alert('Error al guardar el documento.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    const docToDelete = documents.find((d) => d.id === deleteId)
    try {
      if (docToDelete?.storagePath) {
        try { await deleteObject(ref(storage, docToDelete.storagePath)) } catch { /* file may not exist */ }
      }
      await remove(deleteId)
      setDeleteId(null)
    } catch {
      alert('Error al eliminar.')
    }
  }

  if (loading) return <div className="p-8 flex justify-center pt-20"><Spinner label="Cargando documentos..." /></div>

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <PageHeader
        title="Gestión Documental"
        subtitle={`${documents.length} documentos en el sistema`}
        actions={
          <Button size="sm" onClick={openAdd} icon={<Plus size={14} />}>
            Nuevo documento
          </Button>
        }
      />

      <div className="card overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No hay documentos. Agrega el primero.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Documento</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden sm:table-cell">Acceso</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Descargas</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((docItem) => (
                <tr key={docItem.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-800">{docItem.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {docItem.fileName || 'Sin archivo'} {docItem.fileSize ? `· ${formatBytes(docItem.fileSize)}` : ''}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 hidden sm:table-cell">
                    <Badge color={docItem.accessLevel === 'public' ? 'blue' : 'purple'} size="sm">
                      {docItem.accessLevel === 'public' ? 'Público' : 'Asesor'}
                    </Badge>
                  </td>
                  <td className="px-3 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-slate-600">{docItem.downloadCount}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(docItem)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(docItem.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal !== null} onClose={closeModal} title={modal === 'edit' ? 'Editar documento' : 'Nuevo documento'}>
        <div className="space-y-4">
          <Input label="Nombre *" placeholder="Nombre del documento" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Textarea label="Descripción" placeholder="Breve descripción del documento..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
          <Select label="Nivel de acceso" value={form.accessLevel} onChange={(e) => setForm((p) => ({ ...p, accessLevel: e.target.value as DocumentAccess }))} options={ACCESS_OPTIONS} />

          {/* File upload */}
          <div>
            <label className="label">Archivo</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-brand-300 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                accept=".pdf,.xlsx,.xls,.pptx,.ppt,.docx,.doc"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={20} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">
                  {file ? file.name : 'Haz clic para seleccionar archivo'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">PDF, Excel, PowerPoint, Word</p>
              </label>
            </div>
            {saving && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1 text-right">{uploadProgress}%</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {modal === 'edit' ? 'Guardar cambios' : 'Crear documento'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Eliminar documento" size="sm">
        <p className="text-sm text-slate-600 mb-5">¿Eliminar este documento? El archivo también se eliminará del storage.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
