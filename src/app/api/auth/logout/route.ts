import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Eliminar la cookie de sesión
    const cookieStore = cookies()
    cookieStore.delete('session')
    
    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    })
  } catch (error) {
    console.error('Error en logout:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}