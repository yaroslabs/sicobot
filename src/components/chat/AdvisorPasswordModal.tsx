import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { validateAdvisorPassword } from '../../lib/firebase'
import { Lock } from 'lucide-react'

interface AdvisorPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AdvisorPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: AdvisorPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [granted, setGranted] = useState(false)

  async function handleVerify() {
    if (!password.trim()) {
      setError('Ingresa la palabra secreta')
      return
    }

    setLoading(true)
    setError('')

    const valid = await validateAdvisorPassword(password)

    if (valid) {
      setGranted(true)
      sessionStorage.setItem('advisorAccess', 'true')
      setTimeout(() => {
        setGranted(false)
        setPassword('')
        onSuccess()
      }, 1000)
    } else {
      setError('Contraseña incorrecta. Intenta de nuevo.')
      setPassword('')
    }

    setLoading(false)
  }

  function handleClose() {
    setPassword('')
    setError('')
    setGranted(false)
    onClose()
  }

  return (
    <Modal open={isOpen} onClose={handleClose} size="sm">
      <div className="text-center mb-5">
        <div className="w-11 h-11 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Lock size={20} className="text-violet-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Acceso de Asesores</h2>
        <p className="text-sm text-slate-500 mt-1">
          Ingresa la palabra secreta para acceder a contenido exclusivo
        </p>
      </div>

      {granted ? (
        <div className="text-center py-4">
          <p className="text-emerald-600 font-medium text-sm">✅ Acceso concedido</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Palabra secreta"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVerify() }}
            error={error}
            leftIcon={<Lock size={14} />}
            autoFocus
          />

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleVerify}
              loading={loading}
            >
              Verificar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
