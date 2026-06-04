import { initializeApp } from 'firebase/app'
import { getFirestore, getDoc, doc } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

// ─── Collection names ─────────────────────────────────────────────────────────
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  SUBTOPICS: 'subtopics',
  ANSWERS: 'answers',
  DOCUMENTS: 'documents',
  LEADS: 'leads',
  ADVISORS: 'advisors',
  CONFIG: '_config',
  STATS: '_stats',
} as const

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function validateAdvisorPassword(password: string): Promise<boolean> {
  try {
    const configRef = doc(db, 'config', 'advisor-secret')
    const configSnap = await getDoc(configRef)

    if (!configSnap.exists()) {
      console.error('Advisor secret not configured')
      return false
    }

    const storedPassword = configSnap.data().password

    return password === storedPassword
  } catch (error) {
    console.error('Error validating advisor password:', error)
    return false
  }
}
