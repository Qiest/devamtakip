import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const env = import.meta.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
}

export const isConfigured = Object.values(config).every(Boolean)
const app = isConfigured ? initializeApp(config) : null
export const db = app ? getDatabase(app) : null

/** Tüm verinin durduğu tek kayıt. database.rules.json içindeki ile aynı olmalı. */
export const DATA_DOC_ID = 'd-w5pHUVGADkCtGpfKK4FoeNFE'
