import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Verificar variables de entorno requeridas
const requiredEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
}

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

// Configuración del Admin SDK
const adminConfig = {
  credential: cert({
    projectId: requiredEnvVars.FIREBASE_PROJECT_ID,
    privateKey: requiredEnvVars.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: requiredEnvVars.FIREBASE_CLIENT_EMAIL,
  }),
  projectId: requiredEnvVars.FIREBASE_PROJECT_ID,
}

// Inicializar app solo si no existe
const app = getApps().length === 0 ? initializeApp(adminConfig) : getApps()[0]

// Export services
export const adminAuth = getAuth(app)
export const adminDb = getFirestore(app)

export default app