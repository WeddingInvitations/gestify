'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Attendance {
  id: string
  employeeId: string
  employeeName: string
  date: Date
  clockIn?: Date
  clockOut?: Date
  breakStart?: Date
  breakEnd?: Date
  totalHours?: number
  overtime?: number
  status: 'present' | 'absent' | 'late' | 'partial'
  notes?: string
}

// Mock data para desarrollo
const mockAttendances: Attendance[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Juan Pérez',
    date: new Date('2024-01-29'),
    clockIn: new Date('2024-01-29T09:00:00'),
    clockOut: new Date('2024-01-29T17:30:00'),
    breakStart: new Date('2024-01-29T12:00:00'),
    breakEnd: new Date('2024-01-29T13:00:00'),
    totalHours: 7.5,
    status: 'present'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'María García',
    date: new Date('2024-01-29'),
    clockIn: new Date('2024-01-29T09:15:00'),
    clockOut: new Date('2024-01-29T17:00:00'),
    breakStart: new Date('2024-01-29T12:30:00'),
    breakEnd: new Date('2024-01-29T13:00:00'),
    totalHours: 7.25,
    status: 'late',
    notes: 'Llegó 15 minutos tarde'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Carlos López',
    date: new Date('2024-01-29'),
    status: 'absent',
    notes: 'Enfermedad reportada'
  },
  {
    id: '4',
    employeeId: '1',
    employeeName: 'Juan Pérez',
    date: new Date('2024-01-28'),
    clockIn: new Date('2024-01-28T08:45:00'),
    clockOut: new Date('2024-01-28T18:15:00'),
    breakStart: new Date('2024-01-28T12:00:00'),
    breakEnd: new Date('2024-01-28T13:00:00'),
    totalHours: 8.5,
    overtime: 0.5,
    status: 'present'
  },
  {
    id: '5',
    employeeId: '2',
    employeeName: 'María García',
    date: new Date('2024-01-28'),
    clockIn: new Date('2024-01-28T09:00:00'),
    clockOut: new Date('2024-01-28T14:00:00'),
    totalHours: 4.5,
    status: 'partial',
    notes: 'Salida temprana por cita médica'
  }
]

export default function AttendancesPage() {
  const { user } = useAuth()
  const [attendances] = useState<Attendance[]>(mockAttendances)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('')
  const [showClockIn, setShowClockIn] = useState(false)

  const filteredAttendances = attendances.filter(attendance => {
    const matchesDate = attendance.date.toISOString().split('T')[0] === selectedDate
    const matchesStatus = statusFilter === '' || attendance.status === statusFilter
    return matchesDate && matchesStatus
  })

  const getStatusColor = (status: Attendance['status']) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      case 'partial': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Attendance['status']) => {
    switch (status) {
      case 'present': return 'Presente'
      case 'absent': return 'Ausente'
      case 'late': return 'Tardanza'
      case 'partial': return 'Parcial'
      default: return 'Desconocido'
    }
  }

  const formatTime = (date?: Date) => {
    if (!date) return '-'
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatHours = (hours?: number) => {
    if (!hours) return '-'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const todayAttendances = attendances.filter(a => 
    a.date.toDateString() === new Date().toDateString()
  )
  const presentToday = todayAttendances.filter(a => a.status === 'present' || a.status === 'late').length
  const absentToday = todayAttendances.filter(a => a.status === 'absent').length
  const lateToday = todayAttendances.filter(a => a.status === 'late').length

  const totalHoursToday = todayAttendances.reduce((sum, a) => sum + (a.totalHours || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Asistencias</h1>
          <p className="text-gray-600">Monitorea la asistencia y puntualidad del equipo</p>
        </div>
        <button
          onClick={() => setShowClockIn(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ⏰ Registrar Entrada
        </button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Presentes Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {presentToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ausentes Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {absentToday}
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
              <p className="text-sm font-medium text-gray-600">Tardanzas Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {lateToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Horas Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatHours(totalHoursToday)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="present">Presente</option>
              <option value="absent">Ausente</option>
              <option value="late">Tardanza</option>
              <option value="partial">Parcial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de asistencias */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Asistencias para {new Date(selectedDate).toLocaleDateString()} ({filteredAttendances.length})
          </h3>
        </div>
        
        {filteredAttendances.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay registros de asistencia para esta fecha
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
                    Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descanso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Totales
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
                {filteredAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {attendance.employeeName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{attendance.employeeName}</div>
                          {attendance.notes && (
                            <div className="text-sm text-gray-500">{attendance.notes}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(attendance.clockIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(attendance.clockOut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.breakStart && attendance.breakEnd ? 
                        `${formatTime(attendance.breakStart)} - ${formatTime(attendance.breakEnd)}` 
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatHours(attendance.totalHours)}
                      {attendance.overtime && attendance.overtime > 0 && (
                        <span className="ml-1 text-xs text-blue-600">
                          (+{formatHours(attendance.overtime)} extra)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
                        {getStatusText(attendance.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Editar
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Reporte
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal registro de entrada */}
      {showClockIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Registrar Asistencia</h3>
              <button
                onClick={() => setShowClockIn(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {new Date().toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <form className="space-y-4">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar empleado</option>
                <option value="1">Juan Pérez</option>
                <option value="2">María García</option>
                <option value="3">Carlos López</option>
              </select>

              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="clockin">Registrar Entrada</option>
                <option value="clockout">Registrar Salida</option>
                <option value="breakstart">Inicio de Descanso</option>
                <option value="breakend">Fin de Descanso</option>
              </select>

              <textarea
                placeholder="Notas (opcional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowClockIn(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}