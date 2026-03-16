import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/api/auth']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Permitir acceso a rutas públicas y archivos estáticos
  if (
    isPublicRoute || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/api/health') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Verificar token de autenticación
  const authToken = request.cookies.get('auth-token')?.value
  
  // Si no hay token y está intentando acceder a rutas protegidas
  if (!authToken && pathname.startsWith('/app')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Si hay token pero está accediendo a login, redirigir al dashboard
  if (authToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }
  
  // Continuar con la request
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