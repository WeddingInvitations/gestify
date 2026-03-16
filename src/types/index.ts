// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
  id: string
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export type UserRole = 'owner' | 'admin' | 'manager' | 'employee'

export interface User extends BaseEntity {
  uid: string // Firebase Auth UID
  email: string
  displayName: string | null
  photoURL: string | null
  role: UserRole
  isActive: boolean
  lastLogin?: Date
}

export interface Company extends BaseEntity {
  name: string
  address?: string
  phone?: string
  email?: string
  taxId?: string
  logo?: string
  settings: CompanySettings
  ownerId: string
}

export interface CompanySettings {
  currency: string
  timezone: string
  language: string
  dateFormat: string
  fiscalYearStart: number // month (1-12)
}

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export interface Employee extends BaseEntity {
  userId?: string // Link to User if they have access
  firstName: string
  lastName: string
  email?: string
  phone?: string
  position: string
  department?: string
  salary?: number
  hireDate: Date
  terminationDate?: Date
  isActive: boolean
  workSchedule: WorkSchedule
}

export interface WorkSchedule {
  monday?: ScheduleDay
  tuesday?: ScheduleDay
  wednesday?: ScheduleDay
  thursday?: ScheduleDay
  friday?: ScheduleDay
  saturday?: ScheduleDay
  sunday?: ScheduleDay
}

export interface ScheduleDay {
  start: string // Format: "09:00"
  end: string   // Format: "17:00"
  breakStart?: string
  breakEnd?: string
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice extends BaseEntity {
  invoiceNumber: string
  clientName: string
  clientEmail?: string
  clientAddress?: string
  clientTaxId?: string
  
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  
  notes?: string
  terms?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

// ============================================================================
// EXPENSE TYPES
// ============================================================================

export interface Expense extends BaseEntity {
  description: string
  amount: number
  category: string
  date: Date
  receipt?: string // URL to receipt image
  notes?: string
  employeeId?: string
  isReimbursable: boolean
  isReimbursed?: boolean
  reimbursedDate?: Date
}

// ============================================================================
// SHIFT TYPES
// ============================================================================

export interface Shift extends BaseEntity {
  employeeId: string
  date: Date
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
  notes?: string
  isApproved: boolean
  approvedBy?: string
  approvedAt?: Date
}

// ============================================================================
// VACATION TYPES
// ============================================================================

export type VacationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type VacationType = 'vacation' | 'sick' | 'personal' | 'maternity' | 'other'

export interface Vacation extends BaseEntity {
  employeeId: string
  type: VacationType
  startDate: Date
  endDate: Date
  days: number
  status: VacationStatus
  reason?: string
  notes?: string
  
  requestedAt: Date
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
}

// ============================================================================
// ATTENDANCE TYPES
// ============================================================================

export interface Attendance extends BaseEntity {
  employeeId: string
  date: Date
  checkIn?: Date
  checkOut?: Date
  breakStart?: Date
  breakEnd?: Date
  totalHours?: number
  overtime?: number
  notes?: string
}

// ============================================================================
// SUMMARY/DASHBOARD TYPES
// ============================================================================

export interface DashboardSummary extends BaseEntity {
  period: 'daily' | 'weekly' | 'monthly'
  date: Date
  
  // Financial metrics
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  outstandingInvoices: number
  
  // Employee metrics
  totalEmployees: number
  presentEmployees: number
  absentEmployees: number
  onVacationEmployees: number
  
  // Workload metrics
  totalHours: number
  overtimeHours: number
  upcomingShifts: number
  
  // Other metrics
  pendingVacationRequests: number
  overdueInvoices: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateEmployeeData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  position: string
  department?: string
  salary?: number
  hireDate: Date
  workSchedule?: WorkSchedule
}

export interface CreateInvoiceData {
  clientName: string
  clientEmail?: string
  clientAddress?: string
  clientTaxId?: string
  items: Omit<InvoiceItem, 'id'>[]
  taxRate: number
  issueDate: Date
  dueDate: Date
  notes?: string
  terms?: string
}

export interface CreateExpenseData {
  description: string
  amount: number
  category: string
  date: Date
  notes?: string
  employeeId?: string
  isReimbursable: boolean
}

export interface CreateVacationData {
  employeeId: string
  type: VacationType
  startDate: Date
  endDate: Date
  reason?: string
  notes?: string
}

export interface CreateShiftData {
  employeeId: string
  date: Date
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
  notes?: string
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface AuthContextType {
  user: User | null
  company: Company | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WithoutId<T> = Omit<T, 'id'>
export type WithoutTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>
export type CreateData<T extends BaseEntity> = WithoutId<WithoutTimestamps<T>>
export type UpdateData<T> = Partial<T> & { id: string }