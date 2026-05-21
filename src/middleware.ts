import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/api/auth', '/api/health']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Permitir acceso a rutas públicas y archivos estáticos
  if (
    isPublicRoute || 
    pathname.startsWith('/_next/') || 
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Obtener token de autenticación de la cookie
  const authToken = request.cookies.get('auth-token')?.value
  
  // Si está intentando acceder a rutas protegidas sin token
  if (!authToken && pathname.startsWith('/app')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Si hay token pero está accediendo a login, redirigir al dashboard
  // Nota: Sin token, Facebook Auth se encargará de restaurar la sesión en el cliente
  if (authToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }
  
  // Continuar con la request
  // El cliente usará Firebase Auth para restaurar la sesión persistida
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files) 
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}