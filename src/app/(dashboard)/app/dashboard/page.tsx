'use client'

import { useAuth } from '@/lib/auth/context'
import { useState, useEffect } from 'react'

interface DashboardMetrics {
  employees: number
  invoices: {
    total: number
    pending: number
    overdue: number
  }
  revenue: number
  expenses: number
}

export default function DashboardPage() {
  const { user, company, loading } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    employees: 0,
    invoices: { total: 0, pending: 0, overdue: 0 },
    revenue: 0,
    expenses: 0
  })

  // Mock data para desarrollo
  useEffect(() => {
    if (!loading && user) {
      // Simular carga de datos
      setTimeout(() => {
        setMetrics({
          employees: 12,
          invoices: { total: 45, pending: 8, overdue: 2 },
          revenue: 15650.00,
          expenses: 4320.50
        })
      }, 500)
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, {user?.displayName || user?.email}
          {company && ` - ${company.name}`}
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{metrics.employees}</p>
              <p className="text-gray-600">Empleados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">€{metrics.revenue.toLocaleString()}</p>
              <p className="text-gray-600">Ingresos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">€{metrics.expenses.toLocaleString()}</p>
              <p className="text-gray-600">Gastos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{metrics.invoices.total}</p>
              <p className="text-gray-600">Facturas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Facturas Pendientes</h3>
          <div className="space-y-3">
            {metrics.invoices.pending > 0 ? (
              <>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-gray-900">{metrics.invoices.pending} facturas pendientes de pago</span>
                  <span className="text-sm font-medium text-yellow-600">Pendiente</span>
                </div>
                {metrics.invoices.overdue > 0 && (
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-gray-900">{metrics.invoices.overdue} facturas vencidas</span>
                    <span className="text-sm font-medium text-red-600">Vencido</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">No hay facturas pendientes</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-2">
            <a
              href="/app/employees"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              → Ver empleados
            </a>
            <a
              href="/app/invoices"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              → Gestionar facturas
            </a>
            <a
              href="/app/expenses"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              → Registrar gastos
            </a>
            <a
              href="/app/attendances"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              → Control de fichajes
            </a>
          </div>
        </div>
      </div>

      {/* Gráfico placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen Mensual</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráficos próximamente</p>
        </div>
      </div>
    </div>
  )
}