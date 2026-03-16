'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { 
  signInWithEmail, 
  signOut as authSignOut, 
  onAuthChange, 
  getUserData, 
  getCompanyData 
} from '@/lib/auth/client'
import { User, Company, AuthContextType } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Obtener datos completos del usuario
          const userData = await getUserData(firebaseUser.uid)
          
          if (userData) {
            setUser(userData)
            
            // Obtener datos de la empresa
            const companyData = await getCompanyData(userData.tenantId)
            setCompany(companyData)
            
            // Guardar token en cookie para middleware
            const token = await firebaseUser.getIdToken()
            document.cookie = `auth-token=${token}; path=/; max-age=3600; secure; samesite=strict`
          } else {
            setUser(null)
            setCompany(null)
          }
        } catch (error) {
          console.error('Error loading user data:', error)
          setUser(null)
          setCompany(null)
        }
      } else {
        setUser(null)
        setCompany(null)
        // Limpiar cookie
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      await signInWithEmail(email, password)
      // El listener de onAuthChange se encargará de actualizar el estado
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authSignOut()
      // El listener de onAuthChange se encargará de limpiar el estado
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    if (user) {
      const userData = await getUserData(user.uid)
      if (userData) {
        setUser(userData)
        
        const companyData = await getCompanyData(userData.tenantId)
        setCompany(companyData)
      }
    }
  }

  const value: AuthContextType = {
    user,
    company, 
    loading,
    signIn,
    signOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}