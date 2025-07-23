'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'

interface Consulta {
  id: string
  bebe_id: string
  medico_id: string
  data_consulta: string
  hora_consulta: string
  local: string
  anotacoes?: string
  status: 'agendada' | 'realizada' | 'cancelada' | 'remarcada'
  created_at: string
  updated_at: string
  bebe_nome: string
  medico_nome: string
  medico_especialidade: string
  medico_telefone: string
}

export default function ConsultasPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/profile')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        router.push('/')
      }
    }

    checkUser()
  }, [router])

  useEffect(() => {
    if (user) {
      fetchConsultas()
    }
  }, [user])

  const fetchConsultas = async () => {
    try {
      const response = await fetch('/api/consultas')
      if (response.ok) {
        const data = await response.json()
        setConsultas(data.consultas)
      } else {
        setError('Erro ao carregar consultas')
      }
    } catch (error) {
      console.error('Erro ao buscar consultas:', error)
      setError('Erro ao carregar consultas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (consulta: Consulta) => {
    if (!confirm('Tem certeza que deseja deletar esta consulta? Esta ação é irreversível.')) {
      return
    }

    setDeletingId(consulta.id)
    try {
      const response = await fetch(`/api/consultas/${consulta.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConsultas(consultas.filter(c => c.id !== consulta.id))
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao deletar consulta')
      }
    } catch (error) {
      console.error('Erro ao deletar consulta:', error)
      setError('Erro ao deletar consulta')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (consulta: Consulta) => {
    router.push(`/consultas/${consulta.id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800'
      case 'realizada':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      case 'remarcada':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'Agendada'
      case 'realizada':
        return 'Realizada'
      case 'cancelada':
        return 'Cancelada'
      case 'remarcada':
        return 'Remarcada'
      default:
        return status
    }
  }

  const tableColumns = [
    {
      key: 'medico_nome',
      label: 'Médico',
      render: (value: string, item: Consulta) => (
        <div>
          <div className="font-medium text-gray-900">Dr. {value}</div>
          <div className="text-sm text-gray-500">{item.medico_especialidade}</div>
        </div>
      )
    },
    {
      key: 'bebe_nome',
      label: 'Bebê',
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'data_consulta',
      label: 'Data',
      render: (value: string, item: Consulta) => (
        <div>
          <div className="font-medium text-gray-900">
            {new Date(value).toLocaleDateString('pt-BR')}
          </div>
          <div className="text-sm text-gray-500">{item.hora_consulta}</div>
        </div>
      )
    },
    {
      key: 'local',
      label: 'Local',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      )
    }
  ]

  const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando consultas...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      user={user} 
      title="Minhas Consultas"
      subtitle="Gerencie o histórico de consultas médicas"
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => router.push('/consultas/nova')}
            className="bg-pequena-secundaria text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <CalendarIcon />
            Agendar Consulta
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Content */}
        <DataTable
          columns={tableColumns}
          data={consultas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          emptyMessage="Nenhuma consulta agendada"
          emptyIcon={<CalendarIcon />}
          emptyAction={{
            label: 'Agendar Primeira Consulta',
            onClick: () => router.push('/consultas/nova')
          }}
        />
      </div>
    </DashboardLayout>
  )
} 