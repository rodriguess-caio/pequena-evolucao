'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'

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
      fetchBebes()
    }
  }, [user])

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

  const handleDelete = async (bebe: Bebe) => {
    if (!confirm('Tem certeza que deseja deletar este bebê? Esta ação é irreversível.')) {
      return
    }

    setDeletingId(bebe.id)
    try {
      const response = await fetch(`/api/bebes/${bebe.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBebes(bebes.filter(b => b.id !== bebe.id))
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

  const handleEdit = (bebe: Bebe) => {
    router.push(`/bebes/${bebe.id}`)
  }

  const handleCadastrarEvolucao = (bebe: Bebe) => {
    router.push(`/desenvolvimento/novo?bebe_id=${bebe.id}`)
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

  const tableColumns = [
    {
      key: 'nome',
      label: 'Nome',
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'data_nascimento',
      label: 'Idade',
      render: (value: string, item: Bebe) => (
        <div>
          <div className="font-medium text-gray-900">{calculateAge(value)}</div>
          <div className="text-sm text-gray-500">
            {new Date(value).toLocaleDateString('pt-BR')}
          </div>
        </div>
      )
    },
    {
      key: 'tipo_sanguineo',
      label: 'Tipo Sanguíneo',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      )
    },
    {
      key: 'local_nascimento',
      label: 'Local de Nascimento',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      )
    },
    {
      key: 'nome_pai',
      label: 'Pais',
      render: (value: string, item: Bebe) => (
        <div>
          <div className="text-sm text-gray-900">Pai: {value}</div>
          <div className="text-sm text-gray-900">Mãe: {item.nome_mae}</div>
        </div>
      )
    }
  ]

  const actions = [
    {
      label: 'Cadastrar Evolução',
      onClick: handleCadastrarEvolucao,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  const BabyIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )

  const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )

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
    <DashboardLayout 
      user={user}
      title="Meus Bebês"
      subtitle="Gerencie as informações dos seus bebês"
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => router.push('/bebes/novo')}
            className="bg-pequena-secundaria text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            Adicionar Bebê
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
          data={bebes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actions={actions}
          loading={loading}
          emptyMessage="Nenhum bebê cadastrado"
          emptyIcon={<BabyIcon />}
          emptyAction={{
            label: 'Cadastrar Primeiro Bebê',
            onClick: () => router.push('/bebes/novo')
          }}
        />
      </div>
    </DashboardLayout>
  )
} 