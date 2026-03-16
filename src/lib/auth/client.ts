'use client'

import { 
  signInWithEmailAndPassword,
  signOut as authSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
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
 * Cerrar sesión
 */
export const signOut = async (): Promise<void> => {
  await authSignOut(auth)
}

/**
 * Obtener los datos del usuario desde Firestore
 */
export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    // Buscar en todas las compañías (necesario para multi-tenant)
    // En producción, este enfoque debería optimizarse
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
    }
    
    return null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

/**
 * Obtener los datos de la compañía
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