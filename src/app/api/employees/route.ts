import { NextRequest, NextResponse } from 'next/server'
import { EmployeeRepository } from '@/lib/repositories'
import { createEmployeeSchema } from '@/lib/validations'
import { getServerUser } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (!user.tenantId) {
      return NextResponse.json(
        { error: 'Usuario sin tenant asociado' },
        { status: 403 }
      )
    }

    const employeeRepo = new EmployeeRepository()
    
    // Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get('active')
    const department = searchParams.get('department')
    const limit = searchParams.get('limit')

    const queryOptions: any = {
      limit: limit ? parseInt(limit) : undefined
    }
    
    const filters = []
    
    if (isActive !== null) {
      filters.push({ field: 'isActive', operator: '==', value: isActive === 'true' })
    }
    
    if (department) {
      filters.push({ field: 'department', operator: '==', value: department })
    }

    if (filters.length > 0) {
      queryOptions.where = filters
    }

    const result = await employeeRepo.find(user.tenantId, queryOptions)
    const employees = result.data

    return NextResponse.json({ employees })
  } catch (error) {
    console.error('Error obteniendo empleados:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (!user.tenantId) {
      return NextResponse.json(
        { error: 'Usuario sin tenant asociado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos
    const validatedData = createEmployeeSchema.parse(body)
    
    const employeeRepo = new EmployeeRepository()
    
    // Crear empleado (tenantId se pasa como parámetro separado)
    const employee = await employeeRepo.create({
      ...validatedData,
      isActive: true,
      workSchedule: validatedData.workSchedule || {},
      tenantId: user.tenantId  // Agregar tenantId explícitamente
    }, user.tenantId)

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error: any) {
    console.error('Error creando empleado:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}