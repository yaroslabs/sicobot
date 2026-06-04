import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Brain, Lock, Eye, EyeOff, Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const configDoc = await getDoc(doc(db, COLLECTIONS.CONFIG, 'admin'))

      if (!configDoc.exists()) {
        // Fallback default password before seed
        if (password === 'admin2024') {
          login('admin')
          navigate('/admin/dashboard')
          return
        }
        setError('Contraseña incorrecta')
        return
      }

      const { adminPassword } = configDoc.data() as { adminPassword: string }

      if (password !== adminPassword) {
        setError('Contraseña incorrecta')
        return
      }

      login('admin')
      navigate('/admin/dashboard')
    } catch {
      setError('Error de conexión. Verifica la configuración de Firebase.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Shield size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Administrador</h1>
            <p className="text-sm text-slate-500 mt-1">Panel de control SicoBot</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={14} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              required
              autoFocus
            />

            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5 text-xs text-rose-600">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Ingresar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-300 mt-4">
          Acceso restringido — solo personal autorizado
        </p>
      </div>
    </div>
  )
}
