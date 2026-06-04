import { Brain } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../lib/utils'
import type { ChatMessage, Category, Subtopic } from '../../types'

interface MessageBubbleProps {
  message: ChatMessage
  onSelectCategory?: (category: Category) => void
  onSelectSubtopic?: (subtopic: Subtopic) => void
}

export default function MessageBubble({
  message,
  onSelectCategory,
  onSelectSubtopic,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end px-4 mb-3">
        <div className="max-w-[75%] bg-brand-500 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 px-4 mb-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-brand-400 to-ia rounded-full flex items-center justify-center shadow-sm mt-0.5">
        <Brain size={14} className="text-white" />
      </div>

      <div className="flex-1 max-w-[80%]">
        {/* Info / Error */}
        {(message.variant === 'info' || message.variant === 'error') && (
          <div
            className={cn(
              'rounded-2xl rounded-tl-md px-4 py-3 text-sm shadow-sm',
              message.variant === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                : 'bg-white border border-slate-100 text-slate-600 shadow-card'
            )}
          >
            {message.content}
          </div>
        )}

        {/* Category suggestions */}
        {message.variant === 'classification-categories' && (
          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-card border border-slate-100">
            <p className="text-sm text-slate-700 mb-3 leading-relaxed">{message.content}</p>
            <div className="flex flex-wrap gap-2">
              {message.categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory?.(cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-700 text-xs font-medium rounded-xl transition-all duration-150 active:scale-[0.97]"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subtopic suggestions */}
        {message.variant === 'classification-subtopics' && (
          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-card border border-slate-100">
            <p className="text-sm text-slate-700 mb-1 leading-relaxed">{message.content}</p>
            {message.categoryName && (
              <p className="text-xs text-brand-600 font-medium mb-3">
                📂 {message.categoryName}
              </p>
            )}
            <div className="space-y-1.5">
              {message.subtopics?.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubtopic?.(sub)}
                  className="w-full text-left flex items-start gap-2 px-3 py-2.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-700 text-xs font-medium rounded-xl transition-all duration-150 active:scale-[0.99]"
                >
                  <span className="text-brand-400 mt-0.5 flex-shrink-0">›</span>
                  <span>{sub.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Final answer */}
        {message.variant === 'answer' && message.answer && (
          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-card border border-slate-100">
            {message.subtopicName && (
              <p className="text-xs font-semibold text-brand-600 mb-2 pb-2 border-b border-slate-100">
                {message.subtopicName}
              </p>
            )}
            <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.answer.content}
              </ReactMarkdown>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">
                Información del protocolo psicosocial
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
