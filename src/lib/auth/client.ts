'use client'

import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as authSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { User, Company } from '@/types'

/**
 * Iniciar sesión con email y contraseña
 */
export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

/**
 * Iniciar sesión con Google
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  
  const result = await signInWithPopup(auth, provider)
  return result.user
}

/**
 * Cerrar sesión
 */
export const signOut = async (): Promise<void> => {
  await authSignOut(auth)
}

/**
 * Obtener los datos del usuario desde Firestore
 * Si no existe, crea un documento básico para el usuario
 */
export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const data = userSnap.data()
      return {
        id: userSnap.id,
        uid,
        email: data.email,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        role: data.role,
        isActive: data.isActive ?? true,
        lastLogin: data.lastLogin?.toDate(),
        tenantId: data.tenantId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    } else {
      // Usuario no existe: crear documento básico
      // Necesitaremos configurar el tenantId y role después
      const firebaseUser = auth.currentUser
      if (!firebaseUser) return null
      
      const newUserData = {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL || null,
        role: 'employee', // Rol por defecto - debería configurarse después
        isActive: true,
        tenantId: 'demo', // Tenant por defecto - debería configurarse después
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      }
      
      // Crear el documento 
      await setDoc(userRef, newUserData)
      
      // Retornar los datos del usuario creado
      return {
        id: uid,
        uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL || null,
        role: 'employee',
        isActive: true,
        lastLogin: new Date(),
        tenantId: 'demo',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

/**
 * Obtener los datos de la compañía
 * Para tenantId 'demo', crea automáticamente una empresa demo si no existe
 */
export const getCompanyData = async (tenantId: string): Promise<Company | null> => {
  try {
    const companyRef = doc(db, 'companies', tenantId)
    const companySnap = await getDoc(companyRef)
    
    if (companySnap.exists()) {
      const data = companySnap.data()
      return {
        id: companySnap.id,
        tenantId,
        name: data.name,
        address: data.address,
        phone: data.phone,  
        email: data.email,
        taxId: data.taxId,
        logo: data.logo,
        settings: data.settings || {
          currency: 'EUR',
          timezone: 'Europe/Madrid',
          language: 'es',
          dateFormat: 'DD/MM/YYYY',
          fiscalYearStart: 1,
        },
        ownerId: data.ownerId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    } else if (tenantId === 'demo') {
      // Para el tenant demo, crear automáticamente una empresa demo
      const currentUser = auth.currentUser
      if (!currentUser) return null
      
      const demoCompanyData = {
        name: 'Empresa Demo',
        address: 'Calle Principal 123, Madrid, España',
        phone: '+34 912 345 678',
        email: 'contacto@empresademo.com',
        taxId: 'B12345678',
        logo: '',
        settings: {
          currency: 'EUR',
          timezone: 'Europe/Madrid',
          language: 'es',
          dateFormat: 'DD/MM/YYYY',
          fiscalYearStart: 1,
        },
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      
      // Crear el documento de la empresa demo
      await setDoc(companyRef, demoCompanyData)
      
      return {
        id: tenantId,
        tenantId,
        name: 'Empresa Demo',
        address: 'Calle Principal 123, Madrid, España',
        phone: '+34 912 345 678',
        email: 'contacto@empresademo.com',
        taxId: 'B12345678',
        logo: '',
        settings: {
          currency: 'EUR',
          timezone: 'Europe/Madrid',
          language: 'es',
          dateFormat: 'DD/MM/YYYY',
          fiscalYearStart: 1,
        },
        ownerId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting company data:', error)
    return null
  }
}

/**
 * Escuchar cambios en el estado de autenticación
 */
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

/**
 * Verificar si el usuario tiene acceso a un tenant específico
 */
export const hasAccessToTenant = (user: User | null, tenantId: string): boolean => {
  if (!user) return false
  return user.tenantId === tenantId
}

/**
 * Verificar si el usuario tiene un rol específico o superior
 */
export const hasRole = (user: User | null, requiredRole: string): boolean => {
  if (!user) return false
  
  const roleHierarchy = {
    employee: 1,
    manager: 2, 
    admin: 3,
    owner: 4,
  }
  
  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}