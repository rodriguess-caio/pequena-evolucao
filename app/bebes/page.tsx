'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Bebe {
  id: string
  nome: string
  data_nascimento: string
  tipo_sanguineo: string
  local_nascimento: string
  nome_pai: string
  nome_mae: string
  nome_avo_paterno?: string
  nome_avo_materno?: string
  created_at: string
  updated_at: string
}

export default function BebesPage() {
  const [bebes, setBebes] = useState<Bebe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchBebes()
  }, [])

  const fetchBebes = async () => {
    try {
      const response = await fetch('/api/bebes')
      if (response.ok) {
        const data = await response.json()
        setBebes(data.bebes)
      } else {
        setError('Erro ao carregar bebês')
      }
    } catch (error) {
      console.error('Erro ao buscar bebês:', error)
      setError('Erro ao carregar bebês')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este bebê? Esta ação é irreversível.')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/bebes/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBebes(bebes.filter(bebe => bebe.id !== id))
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao deletar bebê')
      }
    } catch (error) {
      console.error('Erro ao deletar bebê:', error)
      setError('Erro ao deletar bebê')
    } finally {
      setDeletingId(null)
    }
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMs = today.getTime() - birth.getTime()
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24))
    
    if (ageInDays < 30) {
      return `${ageInDays} dias`
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30)
      return `${months} ${months === 1 ? 'mês' : 'meses'}`
    } else {
      const years = Math.floor(ageInDays / 365)
      return `${years} ${years === 1 ? 'ano' : 'anos'}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando bebês...</p>
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
                Meus Bebês
              </h1>
              <p className="text-gray-600">
                Gerencie as informações dos seus bebês
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
                onClick={() => router.push('/bebes/novo')}
              >
                Adicionar Bebê
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

        {/* Bebês List */}
        {bebes.length === 0 ? (
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-12 text-center">
            <div className="w-16 h-16 bg-pequena-amarelo/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pequena-amarelo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum bebê cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece cadastrando as informações do seu bebê para acompanhar seu desenvolvimento.
            </p>
            
            <Button
              onClick={() => router.push('/bebes/novo')}
            >
              Cadastrar Primeiro Bebê
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bebes.map((bebe) => (
              <div key={bebe.id} className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-pequena-amarelo/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-pequena-amarelo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/bebes/${bebe.id}`)}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      loading={deletingId === bebe.id}
                      onClick={() => handleDelete(bebe.id)}
                    >
                      {deletingId === bebe.id ? 'Deletando...' : 'Deletar'}
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {bebe.nome}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Idade:</span>
                    <span className="font-medium text-gray-800">
                      {calculateAge(bebe.data_nascimento)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nascimento:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(bebe.data_nascimento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo Sanguíneo:</span>
                    <span className="font-medium text-gray-800">
                      {bebe.tipo_sanguineo}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Local:</span>
                    <span className="font-medium text-gray-800">
                      {bebe.local_nascimento}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Pais:</div>
                  <div className="text-sm text-gray-800">
                    <div>Pai: {bebe.nome_pai}</div>
                    <div>Mãe: {bebe.nome_mae}</div>
                  </div>
                </div>

                {(bebe.nome_avo_paterno || bebe.nome_avo_materno) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Avós:</div>
                    <div className="text-sm text-gray-800">
                      {bebe.nome_avo_paterno && <div>Avô Paterno: {bebe.nome_avo_paterno}</div>}
                      {bebe.nome_avo_materno && <div>Avó Materna: {bebe.nome_avo_materno}</div>}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Cadastrado em: {new Date(bebe.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 