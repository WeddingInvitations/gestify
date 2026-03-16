import { NextRequest, NextResponse } from 'next/server'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { loginSchema } from '@/lib/validations'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar los datos de entrada
    const validatedData = loginSchema.parse(body)
    
    // Intentar autenticar al usuario
    const userCredential = await signInWithEmailAndPassword(
      auth,
      validatedData.email,
      validatedData.password
    )
    
    const user = userCredential.user
    
    // Obtener el token ID del usuario
    const idToken = await user.getIdToken()
    
    // Configurar la cookie con el token
    const cookieStore = cookies()
    cookieStore.set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })
    
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    })
  } catch (error: any) {
    console.error('Error en login:', error)
    
    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'No existe una cuenta con este email' },
        { status: 401 }
      )
    }
    
    if (error.code === 'auth/wrong-password') {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }
    
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }
    
    if (error.code === 'auth/user-disabled') {
      return NextResponse.json(
        { error: 'Esta cuenta ha sido deshabilitada' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}