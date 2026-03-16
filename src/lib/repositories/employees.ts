import { DocumentSnapshot } from 'firebase/firestore'
import { BaseRepository } from './base'
import { Employee } from '@/types'

export class EmployeeRepository extends BaseRepository<Employee> {
  constructor() {
    super('employees', true) // Es subcollection de companies
  }

  protected fromFirestore(doc: DocumentSnapshot): Employee | null {
    if (!doc.exists()) return null

    const data = doc.data()
    return {
      id: doc.id,
      tenantId: data.tenantId,
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      position: data.position,
      department: data.department,
      salary: data.salary,
      hireDate: data.hireDate?.toDate(),
      terminationDate: data.terminationDate?.toDate(),
      isActive: data.isActive ?? true,
      workSchedule: data.workSchedule || {},
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    }
  }

  protected toFirestore(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): any {
    return {
      userId: employee.userId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      salary: employee.salary,
      hireDate: employee.hireDate,
      terminationDate: employee.terminationDate,
      isActive: employee.isActive,
      workSchedule: employee.workSchedule,
    }
  }

  /**
   * Buscar empleados activos
   */
  async findActive(tenantId: string) {
    return this.find(tenantId, {
      where: [{ field: 'isActive', operator: '==', value: true }],
      orderBy: [{ field: 'lastName', direction: 'asc' }],
    })
  }

  /**
   * Buscar empleados por departamento
   */
  async findByDepartment(tenantId: string, department: string) {
    return this.find(tenantId, {
      where: [
        { field: 'department', operator: '==', value: department },
        { field: 'isActive', operator: '==', value: true }
      ],
      orderBy: [{ field: 'lastName', direction: 'asc' }],
    })
  }

  /**
   * Buscar empleado por userId
   */
  async findByUserId(tenantId: string, userId: string): Promise<Employee | null> {
    const result = await this.find(tenantId, {
      where: [{ field: 'userId', operator: '==', value: userId }],
      limit: 1,
    })

    return result.data[0] || null
  }

  /**
   * Desactivar empleado (baja lógica)
   */
  async deactivate(id: string, tenantId: string, terminationDate = new Date()): Promise<Employee> {
    return this.update(id, {
      isActive: false,
      terminationDate,
    }, tenantId)
  }

  /**
   * Reactivar empleado
   */
  async reactivate(id: string, tenantId: string): Promise<Employee> {
    return this.update(id, {
      isActive: true,
      terminationDate: undefined,
    }, tenantId)
  }
}

// Export singleton instance
export const employeeRepository = new EmployeeRepository()