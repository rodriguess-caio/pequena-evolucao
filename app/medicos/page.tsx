'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataTable } from '@/components/ui/DataTable'

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
      fetchMedicos()
    }
  }, [user])

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

  const handleDelete = async (medico: Medico) => {
    if (!confirm('Tem certeza que deseja deletar este médico? Esta ação é irreversível.')) {
      return
    }

    setDeletingId(medico.id)
    try {
      const response = await fetch(`/api/medicos/${medico.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMedicos(medicos.filter(m => m.id !== medico.id))
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

  const handleEdit = (medico: Medico) => {
    router.push(`/medicos/${medico.id}`)
  }

  const tableColumns = [
    {
      key: 'nome',
      label: 'Médico',
      render: (value: string, item: Medico) => (
        <div>
          <div className="font-medium text-gray-900">Dr. {value}</div>
          {item.crm && (
            <div className="text-sm text-gray-500">CRM: {item.crm}</div>
          )}
        </div>
      )
    },
    {
      key: 'especialidade',
      label: 'Especialidade',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      )
    },
    {
      key: 'telefone',
      label: 'Contato',
      render: (value: string, item: Medico) => (
        <div>
          <div className="text-gray-900">{value}</div>
          {item.email && (
            <div className="text-sm text-gray-500">{item.email}</div>
          )}
        </div>
      )
    },
    {
      key: 'endereco',
      label: 'Endereço',
      render: (value: string) => (
        <span className="text-gray-900">{value || 'Não informado'}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Cadastrado em',
      render: (value: string) => (
        <span className="text-gray-900">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      )
    }
  ]

  const DoctorIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
          <p className="text-gray-600">Carregando médicos...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      user={user}
      title="Meus Médicos"
      subtitle="Gerencie as informações dos profissionais de saúde"
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => router.push('/medicos/novo')}
            className="bg-pequena-secundaria text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <PlusIcon />
            Adicionar Médico
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
          data={medicos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          emptyMessage="Nenhum médico cadastrado"
          emptyIcon={<DoctorIcon />}
          emptyAction={{
            label: 'Cadastrar Primeiro Médico',
            onClick: () => router.push('/medicos/novo')
          }}
        />
      </div>
    </DashboardLayout>
  )
} 