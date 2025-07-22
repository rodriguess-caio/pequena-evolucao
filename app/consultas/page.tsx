'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

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
  const router = useRouter()

  useEffect(() => {
    fetchConsultas()
  }, [])

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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta consulta? Esta ação é irreversível.')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/consultas/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConsultas(consultas.filter(consulta => consulta.id !== id))
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
    <div className="min-h-screen bg-pequena-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Minhas Consultas
              </h1>
              <p className="text-gray-600">
                Gerencie o histórico de consultas médicas
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Voltar ao Dashboard
              </Button>

              <Button
                onClick={() => router.push('/consultas/nova')}
              >
                Agendar Consulta
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Consultas List */}
        {consultas.length === 0 ? (
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-12 text-center">
            <div className="w-16 h-16 bg-pequena-azul/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pequena-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhuma consulta agendada
            </h3>
            <p className="text-gray-600 mb-6">
              Comece agendando consultas médicas para seus bebês.
            </p>
            
            <Button
              onClick={() => router.push('/consultas/nova')}
            >
              Agendar Primeira Consulta
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {consultas.map((consulta) => (
              <div key={consulta.id} className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pequena-azul/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-pequena-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Consulta com Dr. {consulta.medico_nome}
                      </h3>
                      <p className="text-gray-600">
                        {consulta.medico_especialidade}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/consultas/${consulta.id}`)}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      loading={deletingId === consulta.id}
                      onClick={() => handleDelete(consulta.id)}
                    >
                      {deletingId === consulta.id ? 'Deletando...' : 'Deletar'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Bebê:</div>
                    <div className="font-medium text-gray-800">
                      {consulta.bebe_nome}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Data:</div>
                    <div className="font-medium text-gray-800">
                      {new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Horário:</div>
                    <div className="font-medium text-gray-800">
                      {consulta.hora_consulta}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status:</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(consulta.status)}`}>
                      {getStatusText(consulta.status)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Local:</div>
                  <div className="font-medium text-gray-800">
                    {consulta.local}
                  </div>
                </div>

                {consulta.anotacoes && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Anotações:</div>
                    <div className="text-gray-800 bg-gray-50 rounded-lg p-3">
                      {consulta.anotacoes}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Agendada em: {new Date(consulta.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {consulta.medico_telefone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 