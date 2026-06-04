import { useEffect, useRef, useState, useCallback } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db, COLLECTIONS } from '../../lib/firebase'
import { classifyQuery, getSubtopicsForCategory } from '../../lib/classifier'
import { useData } from '../../context/DataContext'
import type { ChatMessage, Category, Subtopic, Answer } from '../../types'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ChatInput from './ChatInput'
import Spinner from '../ui/Spinner'
import { generateId } from '../../lib/utils'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatWindowProps {
  selectedOption?: 'question' | 'document' | 'advisor'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function trackQuery(categoryId?: string, subtopicId?: string) {
  try {
    const statsRef = doc(db, COLLECTIONS.STATS, 'queries')
    const updates: Record<string, unknown> = {
      total: increment(1),
      lastUpdated: serverTimestamp(),
    }
    if (categoryId) updates[`byCategory.${categoryId}`] = increment(1)
    if (subtopicId) updates[`bySubtopic.${subtopicId}`] = increment(1)
    await updateDoc(statsRef, updates)
  } catch {
    // Non-critical
  }
}

async function incrementConsultCount(answerId: string) {
  try {
    await updateDoc(doc(db, COLLECTIONS.ANSWERS, answerId), {
      consultCount: increment(1),
    })
  } catch {
    // Non-critical
  }
}

export default function ChatWindow({ selectedOption }: ChatWindowProps = {}) {
  // TODO Fase 2 — usar selectedOption para inicializar flujos alternativos:
  //   'document' → mostrar categorías de documentos directamente
  //   'advisor'  → abrir modal de contraseña de asesor
  //   'question' | undefined → comportamiento normal (actual)
  void selectedOption

  // `categories` and `subtopics` from context are already filtered to active === true
  const { categories, subtopics, loading: dataLoading } = useData()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const full: ChatMessage = { ...msg, id: generateId(), timestamp: new Date() }
    setMessages((prev) => [...prev, full])
    return full
  }

  async function fetchAnswer(subtopicId: string): Promise<Answer | null> {
    // Only return active answers
    const q = query(
      collection(db, COLLECTIONS.ANSWERS),
      where('subtopicId', '==', subtopicId),
      where('active', '==', true)
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Answer
  }

  const handleSelectSubtopic = useCallback(
    async (subtopic: Subtopic) => {
      addMessage({ role: 'user', content: subtopic.name })
      setTyping(true)

      try {
        const answer = await fetchAnswer(subtopic.id)
        await trackQuery(subtopic.categoryId, subtopic.id)

        setTyping(false)

        if (!answer) {
          addMessage({
            role: 'bot',
            variant: 'info',
            content: `Aún no hay respuesta configurada para **"${subtopic.name}"**. Consulta directamente con un asesor o intenta con otra pregunta.`,
          })
          return
        }

        // Track consultation
        incrementConsultCount(answer.id)

        addMessage({
          role: 'bot',
          variant: 'answer',
          answer,
          subtopicName: subtopic.name,
          categoryName: subtopic.categoryName,
        })

        addMessage({
          role: 'bot',
          variant: 'info',
          content: '¿Tienes otra consulta? Escríbela en el campo de abajo.',
        })
      } catch {
        setTyping(false)
        addMessage({
          role: 'bot',
          variant: 'error',
          content: 'Ocurrió un error al obtener la respuesta. Inténtalo nuevamente.',
        })
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleSelectCategory = useCallback(
    (category: Category) => {
      addMessage({ role: 'user', content: category.name })

      // Only show active subtopics for this category
      const subs = getSubtopicsForCategory(category.id, subtopics)
      trackQuery(category.id)

      if (subs.length === 0) {
        addMessage({
          role: 'bot',
          variant: 'info',
          content: `No hay subtemas activos configurados para **"${category.name}"** aún.`,
        })
        return
      }

      addMessage({
        role: 'bot',
        variant: 'classification-subtopics',
        content: 'Selecciona el subtema que mejor se relaciona con tu consulta:',
        subtopics: subs,
        categoryName: category.name,
      })
    },
    [subtopics]
  )

  async function handleSend(text: string) {
    addMessage({ role: 'user', content: text })
    setTyping(true)

    await new Promise((r) => setTimeout(r, 600))

    // Classifier uses only active categories and subtopics
    const result = classifyQuery(text, categories, subtopics)
    setTyping(false)

    if (result.confident && result.topCategory && result.suggestedSubtopics) {
      const subs = result.suggestedSubtopics.length > 0
        ? result.suggestedSubtopics
        : getSubtopicsForCategory(result.topCategory.id, subtopics)

      if (subs.length === 0) {
        addMessage({
          role: 'bot',
          variant: 'info',
          content: `Encontré que tu consulta es sobre **"${result.topCategory.name}"**, pero aún no hay subtemas activos configurados en esa categoría.`,
        })
        return
      }

      addMessage({
        role: 'bot',
        variant: 'classification-subtopics',
        content: 'Encontré temas relacionados con tu consulta. ¿Cuál se acerca más a lo que necesitas?',
        subtopics: subs,
        categoryName: result.topCategory.name,
      })
    } else if (!result.confident && result.suggestedCategories && result.suggestedCategories.length > 0) {
      addMessage({
        role: 'bot',
        variant: 'classification-categories',
        content: 'No logré clasificar tu consulta con certeza. ¿A cuál de estas categorías se refiere tu pregunta?',
        categories: result.suggestedCategories,
      })
    } else {
      addMessage({
        role: 'bot',
        variant: 'classification-categories',
        content: 'No encontré información específica sobre tu consulta. Selecciona una categoría para explorar los temas disponibles:',
        categories,
      })
    }
  }

  function handleReset() {
    setMessages([])
  }

  if (dataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="md" label="Cargando base de conocimiento..." />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              <p className="text-sm text-slate-400 w-full mb-1">Temas frecuentes:</p>
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-600 hover:text-brand-700 text-xs font-medium rounded-xl transition-all duration-150 shadow-sm"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSelectCategory={handleSelectCategory}
            onSelectSubtopic={handleSelectSubtopic}
          />
        ))}

        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={handleSend}
        onReset={messages.length > 0 ? handleReset : undefined}
        disabled={typing}
      />
    </div>
  )
}
