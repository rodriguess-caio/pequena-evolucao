'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Medico {
  id: string
  nome: string
  especialidade: string
  crm?: string
  telefone: string
  email?: string
  endereco?: string
  created_at: string
  updated_at: string
}

export default function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchMedicos()
  }, [])

  const fetchMedicos = async () => {
    try {
      const response = await fetch('/api/medicos')
      if (response.ok) {
        const data = await response.json()
        setMedicos(data.medicos)
      } else {
        setError('Erro ao carregar médicos')
      }
    } catch (error) {
      console.error('Erro ao buscar médicos:', error)
      setError('Erro ao carregar médicos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este médico? Esta ação é irreversível.')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/medicos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMedicos(medicos.filter(medico => medico.id !== id))
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao deletar médico')
      }
    } catch (error) {
      console.error('Erro ao deletar médico:', error)
      setError('Erro ao deletar médico')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando médicos...</p>
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
                Meus Médicos
              </h1>
              <p className="text-gray-600">
                Gerencie as informações dos profissionais de saúde
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
                onClick={() => router.push('/medicos/novo')}
              >
                Adicionar Médico
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

        {/* Médicos List */}
        {medicos.length === 0 ? (
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-12 text-center">
            <div className="w-16 h-16 bg-pequena-azul/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pequena-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum médico cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece cadastrando os profissionais de saúde que atendem seus bebês.
            </p>
            
            <Button
              onClick={() => router.push('/medicos/novo')}
            >
              Cadastrar Primeiro Médico
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicos.map((medico) => (
              <div key={medico.id} className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-pequena-azul/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-pequena-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/medicos/${medico.id}`)}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      loading={deletingId === medico.id}
                      onClick={() => handleDelete(medico.id)}
                    >
                      {deletingId === medico.id ? 'Deletando...' : 'Deletar'}
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Dr. {medico.nome}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Especialidade:</span>
                    <span className="font-medium text-gray-800">
                      {medico.especialidade}
                    </span>
                  </div>
                  
                  {medico.crm && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">CRM:</span>
                      <span className="font-medium text-gray-800">
                        {medico.crm}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Telefone:</span>
                    <span className="font-medium text-gray-800">
                      {medico.telefone}
                    </span>
                  </div>
                  
                  {medico.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">E-mail:</span>
                      <span className="font-medium text-gray-800">
                        {medico.email}
                      </span>
                    </div>
                  )}
                </div>

                {medico.endereco && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Endereço:</div>
                    <div className="text-sm text-gray-800">
                      {medico.endereco}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Cadastrado em: {new Date(medico.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 