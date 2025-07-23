'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormCard, FormField, FormRow } from '@/components/ui/FormCard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { bebeUpdateSchema, type BebeUpdateFormData } from '@/lib/validations/bebe'

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

const tiposSanguineos = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

export default function EditarBebePage() {
  const [bebe, setBebe] = useState<Bebe | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const bebeId = params.id as string

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BebeUpdateFormData>({
    resolver: zodResolver(bebeUpdateSchema),
  })

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
    const fetchBebe = async () => {
      try {
        const response = await fetch(`/api/bebes/${bebeId}`)
        if (response.ok) {
          const data = await response.json()
          setBebe(data.bebe)
          reset({
            id: data.bebe.id,
            nome: data.bebe.nome,
            data_nascimento: data.bebe.data_nascimento,
            tipo_sanguineo: data.bebe.tipo_sanguineo,
            local_nascimento: data.bebe.local_nascimento,
            nome_pai: data.bebe.nome_pai,
            nome_mae: data.bebe.nome_mae,
            nome_avo_paterno: data.bebe.nome_avo_paterno || '',
            nome_avo_materno: data.bebe.nome_avo_materno || '',
          })
        } else {
          setError('Bebê não encontrado')
        }
      } catch (error) {
        console.error('Erro ao buscar bebê:', error)
        setError('Erro ao carregar bebê')
      } finally {
        setLoading(false)
      }
    }

    if (user && bebeId) {
      fetchBebe()
    }
  }, [user, bebeId, reset])

  const onSubmit = async (data: BebeUpdateFormData) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/bebes/${bebeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Bebê atualizado com sucesso!')
        setBebe(result.bebe)
        setTimeout(() => {
          router.push('/bebes')
        }, 1500)
      } else {
        setError(result.error || 'Erro ao atualizar bebê')
      }
    } catch (err) {
      setError('Erro ao atualizar bebê')
    } finally {
      setSaving(false)
    }
  }

  const BabyIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando bebê...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error && !bebe) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Erro ao carregar bebê
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/bebes')}
                className="bg-pequena-secundaria text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Voltar aos Bebês
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      user={user}
      title={`Editar ${bebe?.nome}`}
      subtitle="Atualize as informações do bebê"
    >
      <div className="p-6">
        <FormCard
          title={`Editar ${bebe?.nome}`}
          subtitle="Atualize as informações do bebê"
          icon={<BabyIcon />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          onSubmit={handleSubmit(onSubmit)}
          onCancel={() => router.push('/bebes')}
          submitLabel={saving ? 'Salvando...' : 'Salvar Alterações'}
          cancelLabel="Cancelar"
          loading={saving}
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Informações Básicas
            </h3>
            
            <FormRow>
              <FormField label="Nome do Bebê" required error={errors.nome?.message}>
                <Input
                  placeholder="Nome completo"
                  {...register('nome')}
                />
              </FormField>

              <FormField label="Data de Nascimento" required error={errors.data_nascimento?.message}>
                <Input
                  type="date"
                  {...register('data_nascimento')}
                />
              </FormField>

              <FormField label="Tipo Sanguíneo" required error={errors.tipo_sanguineo?.message}>
                <Select
                  options={tiposSanguineos}
                  placeholder="Selecione o tipo sanguíneo"
                  {...register('tipo_sanguineo')}
                />
              </FormField>

              <FormField label="Local de Nascimento" required error={errors.local_nascimento?.message}>
                <Input
                  placeholder="Cidade, Estado"
                  {...register('local_nascimento')}
                />
              </FormField>
            </FormRow>
          </div>

          {/* Informações dos Pais */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Informações dos Pais
            </h3>
            
            <FormRow>
              <FormField label="Nome do Pai" required error={errors.nome_pai?.message}>
                <Input
                  placeholder="Nome completo do pai"
                  {...register('nome_pai')}
                />
              </FormField>

              <FormField label="Nome da Mãe" required error={errors.nome_mae?.message}>
                <Input
                  placeholder="Nome completo da mãe"
                  {...register('nome_mae')}
                />
              </FormField>

              <FormField label="Nome do Avô Paterno" error={errors.nome_avo_paterno?.message}>
                <Input
                  placeholder="Nome do avô paterno"
                  {...register('nome_avo_paterno')}
                />
              </FormField>

              <FormField label="Nome da Avó Materna" error={errors.nome_avo_materno?.message}>
                <Input
                  placeholder="Nome da avó materna"
                  {...register('nome_avo_materno')}
                />
              </FormField>
            </FormRow>
          </div>
        </FormCard>
      </div>
    </DashboardLayout>
  )
} 