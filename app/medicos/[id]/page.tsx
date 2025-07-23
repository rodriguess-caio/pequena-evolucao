'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { FormCard, FormField, FormRow } from '@/components/ui/FormCard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { medicoUpdateSchema, type MedicoUpdateFormData } from '@/lib/validations/medico'

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

export default function EditarMedicoPage() {
  const [medico, setMedico] = useState<Medico | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const medicoId = params.id as string

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MedicoUpdateFormData>({
    resolver: zodResolver(medicoUpdateSchema),
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
    const fetchMedico = async () => {
      try {
        const response = await fetch(`/api/medicos/${medicoId}`)
        if (response.ok) {
          const data = await response.json()
          setMedico(data.medico)
          reset(data.medico)
        } else {
          setError('Médico não encontrado')
        }
      } catch (error) {
        console.error('Erro ao buscar médico:', error)
        setError('Erro ao carregar médico')
      } finally {
        setLoading(false)
      }
    }

    if (user && medicoId) {
      fetchMedico()
    }
  }, [user, medicoId, reset])

  const onSubmit = async (data: MedicoUpdateFormData) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/medicos/${medicoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSuccess('Médico atualizado com sucesso!')
        const result = await response.json()
        setMedico(result.medico)
        setTimeout(() => {
          router.push('/medicos')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao atualizar médico')
      }
    } catch (error) {
      console.error('Erro ao atualizar médico:', error)
      setError('Erro ao atualizar médico')
    } finally {
      setSaving(false)
    }
  }

  const DoctorIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando médico...</p>
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

  if (error && !medico) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Erro ao carregar médico
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/medicos')}
                className="bg-pequena-secundaria text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Voltar aos Médicos
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
      title={`Editar ${medico?.nome}`}
      subtitle="Atualize as informações do médico"
    >
      <div className="p-6">
        <FormCard
          title={`Editar ${medico?.nome}`}
          subtitle="Atualize as informações do médico"
          icon={<DoctorIcon />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          onSubmit={handleSubmit(onSubmit)}
          onCancel={() => router.push('/medicos')}
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
              <FormField label="Nome Completo" required error={errors.nome?.message}>
                <Input
                  placeholder="Ex: Dr. João Silva"
                  {...register('nome')}
                />
              </FormField>

              <FormField label="Especialidade" required error={errors.especialidade?.message}>
                <Input
                  placeholder="Ex: Pediatria, Cardiologia, etc."
                  {...register('especialidade')}
                />
              </FormField>

              <FormField label="CRM" error={errors.crm?.message}>
                <Input
                  placeholder="Ex: 12345-SP"
                  {...register('crm')}
                />
              </FormField>

              <FormField label="Telefone" required error={errors.telefone?.message}>
                <Input
                  type="tel"
                  placeholder="Ex: (11) 99999-9999"
                  {...register('telefone')}
                />
              </FormField>
            </FormRow>
          </div>

          {/* Informações de Contato */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Informações de Contato
            </h3>
            
            <FormRow>
              <FormField label="E-mail" error={errors.email?.message}>
                <Input
                  type="email"
                  placeholder="Ex: joao.silva@email.com"
                  {...register('email')}
                />
              </FormField>

              <FormField label="Endereço" error={errors.endereco?.message}>
                <Input
                  placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
                  {...register('endereco')}
                />
              </FormField>
            </FormRow>
          </div>
        </FormCard>
      </div>
    </DashboardLayout>
  )
} 