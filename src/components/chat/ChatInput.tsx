import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Send, RefreshCw } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string) => void
  onReset?: () => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  onSend,
  onReset,
  disabled,
  placeholder = 'Escriba su mensaje aquí',
}: ChatInputProps) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <div className="border-t border-slate-100 bg-white/90 backdrop-blur-sm px-4 py-3">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-end gap-2">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="Nueva consulta"
            className="flex-shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all mb-0.5"
          >
            <RefreshCw size={16} />
          </button>
        )}

        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:bg-white
                       transition-all duration-150 max-h-[120px] overflow-y-auto
                       disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ lineHeight: '1.5' }}
            onInput={(e) => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 120) + 'px'
            }}
          />
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            className="absolute right-2.5 bottom-2.5 w-8 h-8 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95"
          >
            <Send size={14} />
          </button>
        </div>
      </form>

      <p className="text-center text-[10px] text-slate-300 mt-1.5">
        Las respuestas se basan exclusivamente en el Protocolo de Vigilancia de Riesgos Psicosociales
      </p>
    </div>
  )
}
