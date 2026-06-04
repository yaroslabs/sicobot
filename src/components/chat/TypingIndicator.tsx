import { Brain } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 mb-4">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-brand-400 to-ia rounded-full flex items-center justify-center shadow-sm">
        <Brain size={14} className="text-white" />
      </div>
      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3.5 shadow-card border border-slate-100 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
