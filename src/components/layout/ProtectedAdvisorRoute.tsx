import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedAdvisorRoute({ children }: { children: ReactNode }) {
  const { isAdvisor } = useAuth()
  if (!isAdvisor) return <Navigate to="/asesor" replace />
  return <>{children}</>
}
