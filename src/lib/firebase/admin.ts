import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

let adminAuth: any = null
let adminDb: any = null

function initializeAdminApp() {
  if (adminAuth && adminDb) {
    return { adminAuth, adminDb }
  }

  // Verificar variables de entorno requeridas solo en runtime
  const requiredEnvVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  }

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.warn(`Missing Firebase Admin environment variable: ${key}`)
      // En desarrollo o build, crear un mock
      if (process.env.NODE_ENV !== 'production') {
        return {
          adminAuth: {
            verifyIdToken: () => Promise.reject(new Error('Firebase Admin not configured'))
          },
          adminDb: {
            doc: () => ({
              get: () => Promise.resolve({ exists: false })
            })
          }
        }
      }
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

  adminAuth = getAuth(app)
  adminDb = getFirestore(app)

  return { adminAuth, adminDb }
}

// Getters que inicializan lazy
export const getAdminAuth = () => {
  const { adminAuth } = initializeAdminApp()
  return adminAuth
}

export const getAdminDb = () => {
  const { adminDb } = initializeAdminApp()
  return adminDb
}