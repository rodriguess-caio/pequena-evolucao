'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormCard, FormField, FormRow } from '@/components/ui/FormCard'
import { bebeSchema, type BebeFormData } from '@/lib/validations/bebe'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

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

export default function NovoBebePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BebeFormData>({
    resolver: zodResolver(bebeSchema),
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

  const onSubmit = async (data: BebeFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bebes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        // Redirecionar para a lista de bebês
        router.push('/bebes')
      } else {
        setError(result.error || 'Erro ao criar bebê')
      }
    } catch (err) {
      setError('Erro ao criar bebê')
    } finally {
      setLoading(false)
    }
  }

  const BabyIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
      title="Cadastrar Bebê"
      subtitle="Adicione as informações do seu bebê"
    >
      <div className="p-4 sm:p-6">
        <FormCard
          title="Cadastrar Novo Bebê"
          subtitle="Preencha as informações básicas do seu bebê"
          icon={<BabyIcon />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          onSubmit={handleSubmit(onSubmit)}
          onCancel={() => router.push('/bebes')}
          submitLabel={loading ? 'Cadastrando...' : 'Cadastrar Bebê'}
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
                  placeholder="Selecione o tipo sanguíneo"
                  {...register('tipo_sanguineo')}
                >
                  <option value="">Selecione o tipo sanguíneo</option>
                  {tiposSanguineos.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </Select>
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

          {/* Medidas Iniciais de Desenvolvimento */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Medidas Iniciais de Desenvolvimento
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Estas medidas ajudarão a acompanhar o desenvolvimento do seu bebê ao longo do tempo.
            </p>
            
            <FormRow>
              <FormField label="Peso ao Nascer (kg)" error={errors.peso_nascimento?.message}>
                <Input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="6.0"
                  placeholder="Ex: 3.2"
                  {...register('peso_nascimento')}
                />
              </FormField>

              <FormField label="Comprimento ao Nascer (cm)" error={errors.comprimento_nascimento?.message}>
                <Input
                  type="number"
                  step="0.1"
                  min="30"
                  max="60"
                  placeholder="Ex: 50.5"
                  {...register('comprimento_nascimento')}
                />
              </FormField>
            </FormRow>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                📊 Padrões Médicos de Referência
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Peso ao nascer:</strong> 2.5 - 4.5 kg (média: 3.2 kg)</p>
                <p><strong>Comprimento ao nascer:</strong> 45 - 55 cm (média: 50 cm)</p>
                <p><strong>IMC:</strong> Será calculado automaticamente</p>
              </div>
            </div>
          </div>
        </FormCard>
      </div>
    </DashboardLayout>
  )
} 