'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'

/**
 * Hook que protege rutas requiriendo autenticación
 * Redirige automáticamente a login si el usuario no está autenticado
 * 
 * Uso:
 * ```tsx
 * export default function DashboardPage() {
 *   useRequireAuth()
 *   
 *   return <div>Contenido protegido</div>
 * }
 * ```
 */
export function useRequireAuth() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // No hacer nada mientras carga
    if (loading) return

    // Si no hay usuario después de cargar, redirigir a login
    if (!user) {
      router.push('/login')
    }
  }, [user, loading, router])

  return { isAuthenticated: !!user, loading }
}


