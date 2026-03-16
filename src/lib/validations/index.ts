import { z } from 'zod'

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const baseEntitySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// ============================================================================
// EMPLOYEE SCHEMAS
// ============================================================================

export const workScheduleDaySchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)').optional(),
  breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)').optional(),
})

export const workScheduleSchema = z.object({
  monday: workScheduleDaySchema.optional(),
  tuesday: workScheduleDaySchema.optional(),
  wednesday: workScheduleDaySchema.optional(),
  thursday: workScheduleDaySchema.optional(),
  friday: workScheduleDaySchema.optional(),
  saturday: workScheduleDaySchema.optional(),
  sunday: workScheduleDaySchema.optional(),
})

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido').max(50, 'Máximo 50 caracteres'),
  lastName: z.string().min(1, 'Apellido requerido').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  position: z.string().min(1, 'Puesto requerido').max(100, 'Máximo 100 caracteres'),
  department: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  salary: z.number().positive('El salario debe ser positivo').optional(),
  hireDate: z.date(),
  workSchedule: workScheduleSchema.optional(),
})

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string(),
})

// ============================================================================
// INVOICE SCHEMAS
// ============================================================================

export const invoiceItemSchema = z.object({
  id: z.string().optional(), // Optional for creation, required for updates
  description: z.string().min(1, 'Descripción requerida').max(200, 'Máximo 200 caracteres'),
  quantity: z.number().positive('La cantidad debe ser positiva'),
  unitPrice: z.number().min(0, 'El precio debe ser positivo o cero'),
  total: z.number().min(0, 'El total debe ser positivo o cero'),
})

export const createInvoiceSchema = z.object({
  clientName: z.string().min(1, 'Nombre del cliente requerido').max(100, 'Máximo 100 caracteres'),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  clientAddress: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
  clientTaxId: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  items: z.array(invoiceItemSchema).min(1, 'Debe haber al menos un item'),
  taxRate: z.number().min(0, 'El IVA debe ser positivo o cero').max(1, 'El IVA no puede ser mayor al 100%'),
  issueDate: z.date(),
  dueDate: z.date(),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  terms: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
}).refine(data => data.dueDate >= data.issueDate, {
  message: 'La fecha de vencimiento debe ser posterior a la fecha de emisión',
  path: ['dueDate'],
})

export const updateInvoiceSchema = z.object({
  id: z.string(),
  clientName: z.string().min(1, 'Nombre de cliente requerido').max(100, 'Máximo 100 caracteres').optional(),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  clientAddress: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
  clientTaxId: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  items: z.array(invoiceItemSchema).min(1, 'Al menos un elemento requerido').optional(),
  taxRate: z.number().min(0, 'Tasa de impuesto no puede ser negativa').max(1, 'Tasa máxima 100%').optional(),
  issueDate: z.date().optional(),
  dueDate: z.date().optional(),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  terms: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
})

export const invoiceStatusSchema = z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])

// ============================================================================
// EXPENSE SCHEMAS
// ============================================================================

export const createExpenseSchema = z.object({
  description: z.string().min(1, 'Descripción requerida').max(200, 'Máximo 200 caracteres'),
  amount: z.number().positive('El importe debe ser positivo'),
  category: z.string().min(1, 'Categoría requerida').max(50, 'Máximo 50 caracteres'),
  date: z.date(),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  employeeId: z.string().optional(),
  isReimbursable: z.boolean().default(false),
})

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.string(),
})

// ============================================================================
// VACATION SCHEMAS
// ============================================================================

export const vacationTypeSchema = z.enum(['vacation', 'sick', 'personal', 'maternity', 'other'])
export const vacationStatusSchema = z.enum(['pending', 'approved', 'rejected', 'cancelled'])

export const createVacationSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  type: vacationTypeSchema,
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
}).refine(data => data.endDate >= data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
})

export const updateVacationSchema = z.object({
  id: z.string(),
  employeeId: z.string().min(1, 'Empleado requerido').optional(),
  type: vacationTypeSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  reason: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
})

// ============================================================================
// SHIFT SCHEMAS
// ============================================================================

export const createShiftSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)').optional().or(z.literal('')),
  breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)').optional().or(z.literal('')),
  notes: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
}).refine(data => data.endTime > data.startTime, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['endTime'],
})

export const updateShiftSchema = z.object({
  id: z.string(),
  employeeId: z.string().min(1, 'Empleado requerido').optional(),
  date: z.date().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional().or(z.literal('')),
  breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional().or(z.literal('')),
  notes: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
})

// ============================================================================
// ATTENDANCE SCHEMAS
// ============================================================================

export const checkInSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  checkIn: z.date(),
  date: z.date(),
})

export const checkOutSchema = z.object({
  id: z.string(),
  checkOut: z.date(),
})

export const breakStartSchema = z.object({
  id: z.string(),
  breakStart: z.date(),
})

export const breakEndSchema = z.object({
  id: z.string(),
  breakEnd: z.date(),
})

// ============================================================================
// USER & COMPANY SCHEMAS
// ============================================================================

export const userRoleSchema = z.enum(['owner', 'admin', 'manager', 'employee'])

export const companySettingsSchema = z.object({
  currency: z.string().default('EUR'),
  timezone: z.string().default('Europe/Madrid'),
  language: z.string().default('es'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  fiscalYearStart: z.number().min(1).max(12).default(1),
})

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  address: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  taxId: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  settings: companySettingsSchema.optional(),
})

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper para validar datos del cliente
 */
export function validateClientData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach(err => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Error de validación' } }
  }
}

/**
 * Helper para validar datos del servidor
 */
export function validateServerData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}