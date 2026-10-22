import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const env = import.meta.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyCZic3hylaJrDdPzzfBigJfK0bRy3484gg',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'yoklamaaa',
  appId: env.VITE_FIREBASE_APP_ID || '1:507638842448:web:22bef6980e7fd5bec9fd55',
}

export const isConfigured = Object.values(config).every(Boolean)
const app = isConfigured ? initializeApp(config) : null
export const db = app ? getDatabase(app) : null

/** Tüm verinin durduğu tek kayıt. database.rules.json içindeki ile aynı olmalı. */
export const DATA_DOC_ID = 'd-w5pHUVGADkCtGpfKK4FoeNFE'
