import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBJHpAYb-P832eAQPvJL8xp3p4pHZsIEAo",
  authDomain: "gestify-490112.firebaseapp.com",
  projectId: "gestify-490112",
  storageBucket: "gestify-490112.firebasestorage.app",
  messagingSenderId: "925707353742",
  appId: "1:925707353742:web:c1ba6236393f29a1d793df",
  measurementId: "G-19DT9BH3EW"
}

// Verificar que todas las variables requeridas estén presentes
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Export app instance
export default app