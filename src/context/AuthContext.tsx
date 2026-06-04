import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthState, UserRole } from '../types'

interface AuthContextValue {
  auth: AuthState
  login: (role: UserRole, advisorId?: string, advisorName?: string) => void
  logout: () => void
  isAdmin: boolean
  isAdvisor: boolean
}

const SESSION_KEY = 'sicobot_session'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) return JSON.parse(stored) as AuthState
    } catch {
      // ignore
    }
    return { role: 'public' }
  })

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(auth))
  }, [auth])

  function login(role: UserRole, advisorId?: string, advisorName?: string) {
    const newAuth: AuthState = { role, advisorId, advisorName }
    setAuth(newAuth)
  }

  function logout() {
    setAuth({ role: 'public' })
    sessionStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        isAdmin: auth.role === 'admin',
        isAdvisor: auth.role === 'advisor' || auth.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
