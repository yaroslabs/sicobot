import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, COLLECTIONS } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { Brain, Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import type { Advisor } from '../types'

export default function AdvisorLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const q = query(
        collection(db, COLLECTIONS.ADVISORS),
        where('email', '==', email.trim().toLowerCase()),
        where('active', '==', true)
      )
      const snap = await getDocs(q)

      if (snap.empty) {
        setError('Credenciales incorrectas')
        return
      }

      const advisor = { id: snap.docs[0].id, ...snap.docs[0].data() } as Advisor

      if (advisor.password !== password) {
        setError('Credenciales incorrectas')
        return
      }

      login('advisor', advisor.id, advisor.name)
      navigate('/asesor/documentos')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <Header />

      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            {/* Logo */}
            <div className="text-center mb-7">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-ia rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <Brain size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Área de Asesores</h1>
              <p className="text-sm text-slate-500 mt-1">
                Ingresa tus credenciales para acceder a los documentos exclusivos
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="asesor@empresa.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={14} />}
                required
                autoComplete="email"
              />
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

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft size={13} />
                Volver al inicio
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            ¿No tienes acceso? Contacta a tu administrador.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
