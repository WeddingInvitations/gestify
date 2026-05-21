'use client'

import { useAuth } from '@/lib/auth/context'
import { useState, useEffect } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface DashboardMetrics {
  employees: number
  invoices: {
    total: number
    pending: number
    overdue: number
  }
  revenue: number
  expenses: number
  balance: number
}

export default function DashboardPage() {
  const { user, company, loading } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    employees: 0,
    invoices: { total: 0, pending: 0, overdue: 0 },
    revenue: 0,
    expenses: 0,
    balance: 0
  })

  // Mock data para desarrollo
  useEffect(() => {
    if (!loading && user) {
      // Simular carga de datos
      setTimeout(() => {
        const revenue = 15650.00
        const expenses = 4320.50
        setMetrics({
          employees: 12,
          invoices: { total: 45, pending: 8, overdue: 2 },
          revenue: revenue,
          expenses: expenses,
          balance: revenue - expenses
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Balance Económico - Destacado */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Balance Económico</p>
              <p className="text-4xl font-bold mt-2">€{metrics.balance.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
              <p className="text-blue-100 text-xs mt-3">
                {metrics.balance > 0 ? '📈 Ganancia' : '📉 Pérdida'}
              </p>
            </div>
            <div className="text-6xl opacity-20">
              💰
            </div>
          </div>
        </div>

        {/* Empleados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{metrics.employees}</p>
              <p className="text-gray-600 text-sm">Empleados</p>
            </div>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">€{metrics.revenue.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
              <p className="text-gray-600 text-sm">Ingresos</p>
            </div>
          </div>
        </div>

        {/* Gastos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">€{metrics.expenses.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
              <p className="text-gray-600 text-sm">Gastos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingresos vs Gastos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Flujo económico</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Ingresos</span>
                <span className="text-sm font-bold text-green-600">€{metrics.revenue.toLocaleString('es-ES', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Gastos</span>
                <span className="text-sm font-bold text-red-600">€{metrics.expenses.toLocaleString('es-ES', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: `${(metrics.expenses / metrics.revenue) * 100}%`}}></div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Margen neto</span>
              <span className={`text-sm font-bold ${metrics.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {((metrics.balance / metrics.revenue) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Facturas Pendientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de facturas</h3>
          <div className="space-y-3">
            {metrics.invoices.pending > 0 ? (
              <>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metrics.invoices.pending} pendientes</p>
                    <p className="text-xs text-gray-500">Esperando pago</p>
                  </div>
                  <span className="text-2xl">⏳</span>
                </div>
                {metrics.invoices.overdue > 0 && (
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{metrics.invoices.overdue} vencidas</p>
                      <p className="text-xs text-gray-500">Requière acción</p>
                    </div>
                    <span className="text-2xl">⚠️</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <div>
                  <p className="text-sm font-medium text-gray-900">Todo pagado</p>
                  <p className="text-xs text-gray-500">¡Excelente estado!</p>
                </div>
                <span className="text-2xl">✅</span>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-2">
              Total: {metrics.invoices.total} facturas
            </p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones rápidas</h3>
          <div className="space-y-2">
            <a
              href="/app/employees"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-blue-500"
            >
              👥 Gestionar empleados
            </a>
            <a
              href="/app/invoices"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-green-500"
            >
              📄 Facturas y pagos
            </a>
            <a
              href="/app/expenses"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-red-500"
            >
              💳 Registrar gastos
            </a>
            <a
              href="/app/attendances"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors border-l-2 border-transparent hover:border-purple-500"
            >
              ⏰ Fichajes empleados
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}