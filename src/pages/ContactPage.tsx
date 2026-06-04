import { useState } from 'react'
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore'
import { db, COLLECTIONS } from '../lib/firebase'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Select from '../components/ui/Select'
import { CheckCircle, Mail, Phone, MessageSquare } from 'lucide-react'
import type { ContactMethod } from '../types'

const CONTACT_METHODS = [
  { value: 'email', label: 'Correo electrónico' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

interface FormData {
  name: string
  company: string
  position: string
  email: string
  phone: string
  need: string
  contactMethod: ContactMethod
}

const INITIAL_FORM: FormData = {
  name: '',
  company: '',
  position: '',
  email: '',
  phone: '',
  need: '',
  contactMethod: 'email',
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const newErrors: Partial<FormData> = {}
    if (!form.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!form.company.trim()) newErrors.company = 'La empresa es requerida'
    if (!form.position.trim()) newErrors.position = 'El cargo es requerido'
    if (!form.email.trim()) newErrors.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Correo inválido'
    if (!form.phone.trim()) newErrors.phone = 'El teléfono es requerido'
    if (!form.need.trim()) newErrors.need = 'Describe tu necesidad'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      await addDoc(collection(db, COLLECTIONS.LEADS), {
        ...form,
        status: 'nuevo',
        assignedTo: '',
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Update stats
      await updateDoc(doc(db, COLLECTIONS.STATS, 'leads'), {
        total: increment(1),
        'byStatus.nuevo': increment(1),
        lastUpdated: serverTimestamp(),
      })

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert('Ocurrió un error al enviar el formulario. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col gradient-bg">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-16 px-4">
          <div className="card p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">¡Solicitud enviada!</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hemos recibido tu solicitud de evaluación. Un asesor se pondrá en contacto contigo a la brevedad por {' '}
              <strong>
                {form.contactMethod === 'email' ? 'correo electrónico' : form.contactMethod}
              </strong>.
            </p>
            <Button
              variant="secondary"
              className="mt-6 w-full"
              onClick={() => { setForm(INITIAL_FORM); setSubmitted(false) }}
            >
              Enviar otra solicitud
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              <Mail size={13} />
              Evaluación de servicios
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Solicita una evaluación
            </h1>
            <p className="mt-2 text-slate-500 text-sm max-w-md mx-auto">
              Completa el formulario y un asesor especializado se pondrá en contacto contigo para presentarte nuestros servicios de implementación del protocolo psicosocial.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
            {/* Contact info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Nombre completo *"
                placeholder="Juan Pérez"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
              />
              <Input
                label="Empresa *"
                placeholder="Mi Empresa S.A."
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
                error={errors.company}
              />
              <Input
                label="Cargo *"
                placeholder="Gerente de RRHH"
                value={form.position}
                onChange={(e) => handleChange('position', e.target.value)}
                error={errors.position}
              />
              <Input
                label="Correo electrónico *"
                type="email"
                placeholder="juan@empresa.cl"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                leftIcon={<Mail size={14} />}
              />
              <Input
                label="Teléfono *"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                leftIcon={<Phone size={14} />}
              />
              <Select
                label="Medio de contacto preferido"
                value={form.contactMethod}
                onChange={(e) => handleChange('contactMethod', e.target.value as ContactMethod)}
                options={CONTACT_METHODS}
              />
            </div>

            <Textarea
              label="¿Cuál es tu necesidad? *"
              placeholder="Describe brevemente qué etapa del protocolo psicosocial necesitas implementar o en qué aspecto necesitas apoyo..."
              value={form.need}
              onChange={(e) => handleChange('need', e.target.value)}
              error={errors.need}
              rows={4}
            />

            <div className="pt-1">
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Enviar solicitud
              </Button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Tus datos son confidenciales y no serán compartidos con terceros.
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
