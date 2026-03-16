import { NextRequest, NextResponse } from 'next/server'
import { InvoiceRepository } from '@/lib/repositories'
import { createInvoiceSchema } from '@/lib/validations'
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

    const invoiceRepo = new InvoiceRepository()
    
    // Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const clientEmail = searchParams.get('clientEmail')
    const limit = searchParams.get('limit')

    const queryOptions: any = {
      limit: limit ? parseInt(limit) : undefined
    }
    
    const filters = []
    
    if (status) {
      filters.push({ field: 'status', operator: '==', value: status })
    }
    
    if (clientEmail) {
      filters.push({ field: 'clientEmail', operator: '==', value: clientEmail })
    }

    if (filters.length > 0) {
      queryOptions.where = filters
    }

    const result = await invoiceRepo.find(user.tenantId, queryOptions)
    const invoices = result.data

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
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
    const validatedData = createInvoiceSchema.parse(body)
    
    const invoiceRepo = new InvoiceRepository()
    
    // Calcular totales y generar IDs para items
    const itemsWithIds = validatedData.items.map(item => ({
      ...item,
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
    
    const subtotal = itemsWithIds.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = subtotal * validatedData.taxRate
    const total = subtotal + taxAmount
    
    // Generar número de factura (esto podría ser más sofisticado)
    const invoiceNumber = `INV-${Date.now()}`
    
    // Crear factura (tenantId se pasa como parámetro separado)
    const invoice = await invoiceRepo.create({
      ...validatedData,
      items: itemsWithIds,
      invoiceNumber,
      subtotal,
      taxAmount,
      total,
      status: 'draft' as const,
      tenantId: user.tenantId  // Agregar tenantId explícitamente
    }, user.tenantId)

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error: any) {
    console.error('Error creando factura:', error)
    
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