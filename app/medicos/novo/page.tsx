'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { FormCard, FormField, FormRow } from '@/components/ui/FormCard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { medicoSchema, type MedicoFormData } from '@/lib/validations/medico'

export default function NovoMedicoPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicoFormData>({
    resolver: zodResolver(medicoSchema),
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

  const onSubmit = async (data: MedicoFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/medicos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/medicos')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao cadastrar médico')
      }
    } catch (error) {
      console.error('Erro ao cadastrar médico:', error)
      setError('Erro ao cadastrar médico')
    } finally {
      setLoading(false)
    }
  }

  const DoctorIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

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

  return (
    <DashboardLayout 
      user={user}
      title="Cadastrar Médico"
      subtitle="Adicione as informações do profissional de saúde"
    >
      <div className="p-6">
        <FormCard
          title="Cadastrar Médico"
          subtitle="Adicione as informações do profissional de saúde"
          icon={<DoctorIcon />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          onSubmit={handleSubmit(onSubmit)}
          onCancel={() => router.push('/medicos')}
          submitLabel={loading ? 'Cadastrando...' : 'Cadastrar Médico'}
          cancelLabel="Cancelar"
          loading={loading}
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600">{error}</p>
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