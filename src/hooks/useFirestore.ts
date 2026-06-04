import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  type OrderByDirection,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useCollection<T extends { id: string }>(
  collectionName: string,
  orderByField?: string,
  direction: OrderByDirection = 'asc',
  extraConstraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const constraints: QueryConstraint[] = [...extraConstraints]
      if (orderByField) {
        constraints.unshift(orderBy(orderByField, direction))
      }
      const q = constraints.length
        ? query(collection(db, collectionName), ...constraints)
        : collection(db, collectionName)
      const snap = await getDocs(q)
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)))
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err)
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [collectionName, orderByField, direction])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function add(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, collectionName), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await fetchData()
    return docRef.id
  }

  async function update(id: string, updates: Partial<T>) {
    await updateDoc(doc(db, collectionName, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    await fetchData()
  }

  async function remove(id: string) {
    await deleteDoc(doc(db, collectionName, id))
    await fetchData()
  }

  return { data, loading, error, refetch: fetchData, add, update, remove }
}
