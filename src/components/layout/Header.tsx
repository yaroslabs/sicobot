import { Link, useLocation } from 'react-router-dom'
import { Brain, FileText, Mail, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/documentos', label: 'Documentos' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const { pathname } = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">
            Sico<span className="text-ia">Bot</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                pathname === link.to
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Advisor access */}
        <Link
          to="/asesor"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors"
        >
          <span>Área Asesores</span>
          <ChevronRight size={14} />
        </Link>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-1">
          {NAV_LINKS.map((link) => {
            const icons = { '/': null, '/documentos': <FileText size={18} />, '/contacto': <Mail size={18} /> }
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'p-2 rounded-xl transition-all duration-150',
                  pathname === link.to
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                )}
                title={link.label}
              >
                {icons[link.to as keyof typeof icons] ?? <Brain size={18} />}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}
