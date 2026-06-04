import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db, COLLECTIONS } from '../lib/firebase'
import type { Category, Subtopic } from '../types'

interface DataContextValue {
  // All items — for admin panels
  allCategories: Category[]
  allSubtopics: Subtopic[]
  // Active-only — for chat classification and display
  categories: Category[]
  subtopics: Subtopic[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allSubtopics, setAllSubtopics] = useState<Subtopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [catSnap, subSnap] = await Promise.all([
        getDocs(query(collection(db, COLLECTIONS.CATEGORIES), orderBy('order', 'asc'))),
        getDocs(query(collection(db, COLLECTIONS.SUBTOPICS), orderBy('order', 'asc'))),
      ])

      setAllCategories(catSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)))
      setAllSubtopics(subSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Subtopic)))
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error al cargar los datos. Verifica la conexión a Firebase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Active-only views for the chat/classifier
  const categories = allCategories.filter((c) => c.active !== false)
  const subtopics = allSubtopics.filter((s) => s.active !== false)

  return (
    <DataContext.Provider
      value={{ allCategories, allSubtopics, categories, subtopics, loading, error, refresh: fetchData }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
