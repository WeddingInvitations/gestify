import { DocumentSnapshot } from 'firebase/firestore'
import { BaseRepository } from './base'
import { Invoice, InvoiceStatus } from '@/types'

export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor() {
    super('invoices', true) // Es subcollection de companies
  }

  protected fromFirestore(doc: DocumentSnapshot): Invoice | null {
    if (!doc.exists()) return null

    const data = doc.data()
    return {
      id: doc.id,
      tenantId: data.tenantId,
      invoiceNumber: data.invoiceNumber,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientAddress: data.clientAddress,
      clientTaxId: data.clientTaxId,
      items: data.items || [],
      subtotal: data.subtotal || 0,
      taxRate: data.taxRate || 0,
      taxAmount: data.taxAmount || 0,
      total: data.total || 0,
      status: data.status || 'draft',
      issueDate: data.issueDate?.toDate(),
      dueDate: data.dueDate?.toDate(),
      paidDate: data.paidDate?.toDate(),
      notes: data.notes,
      terms: data.terms,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    }
  }

  protected toFirestore(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): any {
    return {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      clientTaxId: invoice.clientTaxId,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      notes: invoice.notes,
      terms: invoice.terms,
    }
  }

  /**
   * Buscar facturas por estado
   */
  async findByStatus(tenantId: string, status: InvoiceStatus) {
    return this.find(tenantId, {
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'issueDate', direction: 'desc' }],
    })
  }

  /**
   * Buscar facturas vencidas
   */
  async findOverdue(tenantId: string) {
    const today = new Date()
    return this.find(tenantId, {
      where: [
        { field: 'status', operator: 'in', value: ['sent'] },
        { field: 'dueDate', operator: '<', value: today },
      ],
      orderBy: [{ field: 'dueDate', direction: 'asc' }],
    })
  }

  /**
   * Buscar facturas por cliente
   */
  async findByClient(tenantId: string, clientName: string) {
    return this.find(tenantId, {
      where: [{ field: 'clientName', operator: '==', value: clientName }],
      orderBy: [{ field: 'issueDate', direction: 'desc' }],
    })
  }

  /**
   * Obtener próximo número de factura
   */
  async getNextInvoiceNumber(tenantId: string): Promise<string> {
    try {
      const result = await this.find(tenantId, {
        orderBy: [{ field: 'invoiceNumber', direction: 'desc' }],
        limit: 1,
      })

      if (result.data.length === 0) {
        const currentYear = new Date().getFullYear()
        return `F${currentYear}-001`
      }

      const lastInvoice = result.data[0]
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1])
      const currentYear = new Date().getFullYear()
      const newNumber = (lastNumber + 1).toString().padStart(3, '0')
      
      return `F${currentYear}-${newNumber}`
    } catch (error) {
      console.error('Error generating invoice number:', error)
      const currentYear = new Date().getFullYear()
      return `F${currentYear}-001`
    }
  }

  /**
   * Marcar factura como pagada
   */
  async markAsPaid(id: string, tenantId: string, paidDate = new Date()): Promise<Invoice> {
    return this.update(id, {
      status: 'paid',
      paidDate,
    }, tenantId)
  }

  /**
   * Actualizar estado a vencida
   */
  async markAsOverdue(id: string, tenantId: string): Promise<Invoice> {
    return this.update(id, {
      status: 'overdue',
    }, tenantId)
  }

  /**
   * Obtener resumen de facturas
   */
  async getSummary(tenantId: string): Promise<{
    total: number
    draft: number
    sent: number
    paid: number
    overdue: number
    totalAmount: number
    paidAmount: number
    pendingAmount: number
  }> {
    try {
      const allInvoices = await this.find(tenantId, { limit: 1000 })
      const invoices = allInvoices.data

      const summary = {
        total: invoices.length,
        draft: 0,
        sent: 0,
        paid: 0,
        overdue: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      }

      invoices.forEach(invoice => {
        summary[invoice.status as keyof typeof summary]++
        summary.totalAmount += invoice.total
        
        if (invoice.status === 'paid') {
          summary.paidAmount += invoice.total
        } else if (invoice.status === 'sent' || invoice.status === 'overdue') {
          summary.pendingAmount += invoice.total
        }
      })

      return summary
    } catch (error) {
      console.error('Error getting invoices summary:', error)
      return {
        total: 0,
        draft: 0,
        sent: 0, 
        paid: 0,
        overdue: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      }
    }
  }
}

// Export singleton instance
export const invoiceRepository = new InvoiceRepository()