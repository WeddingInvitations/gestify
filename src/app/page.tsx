'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirigir a login por defecto del lado del cliente
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}