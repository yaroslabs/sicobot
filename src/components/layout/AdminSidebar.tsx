import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Tag,
  MessageSquare,
  FileText,
  Users,
  UserCog,
  LogOut,
  Brain,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/categorias', icon: FolderOpen, label: 'Categorías' },
  { to: '/admin/subtemas', icon: Tag, label: 'Subtemas' },
  { to: '/admin/respuestas', icon: MessageSquare, label: 'Respuestas' },
  { to: '/admin/documentos', icon: FileText, label: 'Documentos' },
  { to: '/admin/leads', icon: Users, label: 'Leads CRM' },
  { to: '/admin/asesores', icon: UserCog, label: 'Asesores' },
]

export default function AdminSidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
          <Brain size={18} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-slate-800 text-sm tracking-tight">
            Sico<span className="text-ia">Bot</span>
          </span>
          <p className="text-[10px] text-slate-400 -mt-0.5">Administrador</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
