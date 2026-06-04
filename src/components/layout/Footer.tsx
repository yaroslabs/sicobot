import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'

const REQUIRED_CLICKS = 5
const CLICK_WINDOW_MS = 3000

export default function Footer() {
  const navigate = useNavigate()
  const [clicks, setClicks] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleVersionClick() {
    const newCount = clicks + 1
    setClicks(newCount)

    if (timerRef.current) clearTimeout(timerRef.current)

    if (newCount >= REQUIRED_CLICKS) {
      setClicks(0)
      navigate('/admin')
      return
    }

    timerRef.current = setTimeout(() => setClicks(0), CLICK_WINDOW_MS)
  }

  return (
    <footer className="border-t border-slate-100 bg-white/60 backdrop-blur-sm py-4 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Brain size={13} className="text-brand-400" />
          <span>SicoBot — Asistente de Protocolo Psicosocial</span>
        </div>

        <div className="flex items-center gap-3">
          <span>© {new Date().getFullYear()}</span>
          <span
            onClick={handleVersionClick}
            className="cursor-default select-none tabular-nums"
            title=""
          >
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  )
}
