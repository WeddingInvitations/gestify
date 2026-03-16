import { DecodedIdToken } from 'firebase-admin/auth'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { User, UserRole } from '@/types'
import { cookies } from 'next/headers'

/**
 * Verificar token de Firebase Auth en el servidor
 */
export const verifyAuthToken = async (token: string): Promise<DecodedIdToken | null> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Error verifying auth token:', error)
    return null
  }
}

/**
 * Obtener token desde las cookies o headers
 */
export const getAuthTokenFromRequest = (): string | null => {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    return token || null
  } catch (error) {
    // Si no podemos acceder a cookies, intentar desde headers
    return null
  }
}

/**
 * Obtener usuario autenticado desde el servidor
 */
export const getServerUser = async (): Promise<User | null> => {
  try {
    const token = getAuthTokenFromRequest()
    if (!token) return null
    
    const decodedToken = await verifyAuthToken(token)
    if (!decodedToken) return null
    
    // Obtener datos del usuario desde Firestore
    const userDoc = await adminDb.doc(`users/${decodedToken.uid}`).get()
    
    if (!userDoc.exists) return null
    
    const userData = userDoc.data()
    return {
      id: userDoc.id,
      uid: decodedToken.uid,
      email: userData?.email || decodedToken.email || '',
      displayName: userData?.displayName || decodedToken.name || null,
      photoURL: userData?.photoURL || decodedToken.picture || null,
      role: userData?.role || 'employee',
      isActive: userData?.isActive ?? true,
      lastLogin: userData?.lastLogin?.toDate(),
      tenantId: userData?.tenantId,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      updatedAt: userData?.updatedAt?.toDate() || new Date(),
    }
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}

/**
 * Validar acceso a tenant en el servidor
 */
export const validateTenantAccess = async (tenantId: string): Promise<{ user: User; hasAccess: boolean }> => {
  const user = await getServerUser()
  
  if (!user) {
    return { user: user as any, hasAccess: false }
  }
  
  const hasAccess = user.tenantId === tenantId
  
  return { user, hasAccess }
}

/**
 * Validar rol mínimo requerido
 */
export const validateRole = (user: User, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    employee: 1,
    manager: 2,
    admin: 3, 
    owner: 4,
  }
  
  const userLevel = roleHierarchy[user.role] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0
  
  return userLevel >= requiredLevel
}

/**
 * Middleware helper para validar autenticación y acceso
 */
export const withAuth = async (
  tenantId?: string,
  requiredRole?: UserRole
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return { user: null, error: 'No autenticado' }
    }
    
    if (tenantId && user.tenantId !== tenantId) {
      return { user: null, error: 'Sin acceso a este tenant' }
    }
    
    if (requiredRole && !validateRole(user, requiredRole)) {
      return { user: null, error: 'Permisos insuficientes' }
    }
    
    return { user, error: null }
  } catch (error) {
    console.error('Auth validation error:', error)
    return { user: null, error: 'Error de autenticación' }
  }
}