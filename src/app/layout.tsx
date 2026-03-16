import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth/context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestify - Gestión empresarial para PyMEs',
  description: 'Plataforma SaaS multi-tenant para gestión integral de pequeñas empresas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}