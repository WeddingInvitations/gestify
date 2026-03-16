'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Vacation {
  id: string
  employeeId: string
  employeeName: string
  startDate: Date
  endDate: Date
  days: number
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'bereavement'
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  approvedBy?: string
  requestDate: Date
}

// Mock data para desarrollo
const mockVacations: Vacation[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Juan Pérez',
    startDate: new Date('2024-02-10'),
    endDate: new Date('2024-02-17'),
    days: 6,
    type: 'vacation',
    status: 'approved',
    reason: 'Vacaciones familiares',
    approvedBy: 'Manager',
    requestDate: new Date('2024-01-15')
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'María García',
    startDate: new Date('2024-02-05'),
    endDate: new Date('2024-02-07'),
    days: 3,
    type: 'sick',
    status: 'approved',
    reason: 'Gripe',
    approvedBy: 'HR',
    requestDate: new Date('2024-02-04')
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Carlos López',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-22'),
    days: 6,
    type: 'vacation',
    status: 'pending',
    reason: 'Viaje de placer',
    requestDate: new Date('2024-01-20')
  },
  {
    id: '4',
    employeeId: '1',
    employeeName: 'Juan Pérez',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-20'),
    days: 1,
    type: 'personal',
    status: 'rejected',
    reason: 'Asuntos personales',
    requestDate: new Date('2024-01-18')
  }
]

export default function VacationsPage() {
  const { user } = useAuth()
  const [vacations] = useState<Vacation[]>(mockVacations)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filteredVacations = vacations.filter(vacation => {
    const matchesStatus = statusFilter === '' || vacation.status === statusFilter
    const matchesType = typeFilter === '' || vacation.type === typeFilter
    return matchesStatus && matchesType
  })

  const getStatusColor = (status: Vacation['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Vacation['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'approved': return 'Aprobada'
      case 'rejected': return 'Rechazada'
      default: return 'Desconocido'
    }
  }

  const getTypeColor = (type: Vacation['type']) => {
    switch (type) {
      case 'vacation': return 'bg-blue-100 text-blue-800'
      case 'sick': return 'bg-red-100 text-red-800'
      case 'personal': return 'bg-purple-100 text-purple-800'
      case 'maternity': return 'bg-pink-100 text-pink-800'
      case 'bereavement': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: Vacation['type']) => {
    switch (type) {
      case 'vacation': return 'Vacaciones'
      case 'sick': return 'Enfermedad'
      case 'personal': return 'Personal'
      case 'maternity': return 'Maternidad'
      case 'bereavement': return 'Duelo'
      default: return 'Otro'
    }
  }

  const totalDaysUsed = vacations.filter(v => v.status === 'approved').reduce((sum, v) => sum + v.days, 0)
  const pendingRequests = vacations.filter(v => v.status === 'pending').length
  const thisMonthVacations = vacations.filter(v => {
    const now = new Date()
    return v.startDate.getMonth() === now.getMonth() && v.startDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vacaciones y Permisos</h1>
          <p className="text-gray-600">Gestiona las solicitudes de tiempo libre del equipo</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nueva Solicitud
        </button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Días Utilizados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalDaysUsed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {pendingRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Este Mes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {thisMonthVacations}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.max(0, 30 - totalDaysUsed)} {/* Asumiendo 30 días al año */}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="vacation">Vacaciones</option>
            <option value="sick">Enfermedad</option>
            <option value="personal">Personal</option>
            <option value="maternity">Maternidad</option>
            <option value="bereavement">Duelo</option>
          </select>
        </div>
      </div>

      {/* Lista de vacaciones */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Solicitudes de Vacaciones ({filteredVacations.length})
          </h3>
        </div>
        
        {filteredVacations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No se encontraron solicitudes
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVacations.map((vacation) => (
                  <tr key={vacation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {vacation.employeeName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{vacation.employeeName}</div>
                          {vacation.reason && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">{vacation.reason}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(vacation.type)}`}>
                        {getTypeText(vacation.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vacation.startDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vacation.endDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vacation.days}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vacation.status)}`}>
                        {getStatusText(vacation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Ver
                      </button>
                      {vacation.status === 'pending' && (
                        <>
                          <button className="text-green-600 hover:text-green-900 mr-3">
                            Aprobar
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Rechazar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal nueva solicitud */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Nueva Solicitud</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar empleado</option>
                <option value="1">Juan Pérez</option>
                <option value="2">María García</option>
                <option value="3">Carlos López</option>
              </select>
              
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tipo de permiso</option>
                <option value="vacation">Vacaciones</option>
                <option value="sick">Enfermedad</option>
                <option value="personal">Personal</option>
                <option value="maternity">Maternidad</option>
                <option value="bereavement">Duelo</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <textarea
                placeholder="Motivo de la solicitud"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}