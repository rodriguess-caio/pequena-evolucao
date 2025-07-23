'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormCard, FormField, FormRow } from '@/components/ui/FormCard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { desenvolvimentoSchema, type DesenvolvimentoFormData } from '@/lib/validations/desenvolvimento'

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

interface Bebe {
  id: string
  nome: string
  data_nascimento: string
}

export default function NovoDesenvolvimentoPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bebes, setBebes] = useState<Bebe[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<DesenvolvimentoFormData>({
    resolver: zodResolver(desenvolvimentoSchema),
    defaultValues: {
      data_medicao: new Date().toISOString().split('T')[0]
    }
  })

  const selectedBebeId = watch('bebe_id')
  const selectedBebe = bebes.find(b => b.id === selectedBebeId)

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
      } finally {
        setLoading(false)
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
        setBebes(data.bebes || [])
        
        // Verificar se há um bebe_id na URL
        const bebeIdFromUrl = searchParams.get('bebe_id')
        if (bebeIdFromUrl && data.bebes) {
          const bebeExists = data.bebes.find((b: Bebe) => b.id === bebeIdFromUrl)
          if (bebeExists) {
            setValue('bebe_id', bebeIdFromUrl)
          }
        } else if (data.bebes && data.bebes.length > 0) {
          // Auto-select first bebê if available
          setValue('bebe_id', data.bebes[0].id)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar bebês:', error)
    }
  }

  const onSubmit = async (data: DesenvolvimentoFormData) => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/desenvolvimento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar dados de desenvolvimento')
      }
    } catch (error) {
      console.error('Erro ao salvar dados de desenvolvimento:', error)
      setError('Erro interno do servidor')
    } finally {
      setSubmitting(false)
    }
  }

  const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout 
      user={user}
      title="Adicionar Medida"
      subtitle="Registre uma nova medida de desenvolvimento"
    >
      <div className="p-6">
        <FormCard
          icon={<ChartIcon />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          onSubmit={handleSubmit(onSubmit)}
          onCancel={() => router.push('/dashboard')}
          submitLabel={submitting ? 'Salvando...' : 'Salvar Dados'}
          cancelLabel="Cancelar"
          loading={submitting}
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Seleção do Bebê */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Selecionar Bebê
            </h3>
            
            {bebes.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Nenhum bebê cadastrado. Cadastre um bebê primeiro.
                </p>
                <button
                  onClick={() => router.push('/bebes/novo')}
                  className="mt-2 bg-pequena-secundaria text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Cadastrar Bebê
                </button>
              </div>
            ) : (
              <FormField label="Bebê" required error={errors.bebe_id?.message}>
                <select
                  {...register('bebe_id')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-pequena-background focus:ring-2 focus:ring-pequena-secundaria focus:border-transparent transition-colors duration-200"
                >
                  <option value="">Selecione um bebê</option>
                  {bebes.map((bebe) => (
                    <option key={bebe.id} value={bebe.id}>
                      {bebe.nome} - Nascido em {new Date(bebe.data_nascimento).toLocaleDateString('pt-BR')}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
          </div>

          {/* Data da Medição */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Data da Medição
            </h3>
            
            <FormField label="Data da Medição" required error={errors.data_medicao?.message}>
              <Input
                type="date"
                {...register('data_medicao')}
              />
            </FormField>
          </div>

          {/* Medidas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Medidas
            </h3>
            
            <FormRow>
              <FormField 
                label="Peso (kg)" 
                required 
                error={errors.peso_kg?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="50.0"
                  placeholder="Ex: 3.2 (peso em kg)"
                  {...register('peso_kg', { valueAsNumber: true })}
                />
              </FormField>

              <FormField 
                label="Comprimento (cm)" 
                required 
                error={errors.comprimento_cm?.message}
              >
                <Input
                  type="number"
                  step="0.1"
                  min="30"
                  max="200"
                  placeholder="Ex: 50.5 (comprimento em cm)"
                  {...register('comprimento_cm', { valueAsNumber: true })}
                />
              </FormField>
            </FormRow>
          </div>

          {/* Observações */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Observações (Opcional)
            </h3>
            
            <FormField label="Observações" error={errors.observacoes?.message}>
              <Textarea
                placeholder="Observações sobre a medição..."
                {...register('observacoes')}
              />
            </FormField>
          </div>

          {/* Informações de Referência */}
          {selectedBebe && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                📊 Informações de Referência
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Bebê:</strong> {selectedBebe.nome}</p>
                <p><strong>Data de Nascimento:</strong> {new Date(selectedBebe.data_nascimento).toLocaleDateString('pt-BR')}</p>
                <p><strong>Idade Atual:</strong> {(() => {
                  const birthDate = new Date(selectedBebe.data_nascimento)
                  const today = new Date()
                  const ageInMonths = ((today.getFullYear() - birthDate.getFullYear()) * 12) +
                                     (today.getMonth() - birthDate.getMonth()) +
                                     (today.getDate() - birthDate.getDate()) / 30
                  return `${Math.floor(ageInMonths)} meses e ${Math.round((ageInMonths % 1) * 30)} dias`
                })()}</p>
              </div>
            </div>
          )}
        </FormCard>
      </div>
    </DashboardLayout>
  )
} 