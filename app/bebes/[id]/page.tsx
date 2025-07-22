'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputField } from '@/components/ui/InputField'
import { Button } from '@/components/ui/Button'
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

    if (bebeId) {
      fetchBebe()
    }
  }, [bebeId, reset])

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
        setBebe(result.bebe)
        setSuccess('Bebê atualizado com sucesso!')
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push('/bebes')
        }, 2000)
      } else {
        setError(result.error || 'Erro ao atualizar bebê')
      }
    } catch (err) {
      setError('Erro ao atualizar bebê')
    } finally {
      setSaving(false)
    }
  }

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

  if (!bebe) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Bebê não encontrado</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/bebes')}>
            Voltar aos Bebês
          </Button>
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
                Editar Bebê
              </h1>
              <p className="text-gray-600">
                Atualize as informações de {bebe.nome}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/bebes')}
            >
              Voltar aos Bebês
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6">
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Nome do Bebê"
                    placeholder="Nome completo"
                    error={errors.nome?.message}
                    {...register('nome')}
                  />

                  <InputField
                    label="Data de Nascimento"
                    type="date"
                    error={errors.data_nascimento?.message}
                    {...register('data_nascimento')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Sanguíneo
                    </label>
                    <select
                      {...register('tipo_sanguineo')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pequena-secundaria/50 focus:border-pequena-secundaria"
                    >
                      <option value="">Selecione o tipo sanguíneo</option>
                      {tiposSanguineos.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                    {errors.tipo_sanguineo && (
                      <p className="text-sm text-red-600 mt-1">{errors.tipo_sanguineo.message}</p>
                    )}
                  </div>

                  <InputField
                    label="Local de Nascimento"
                    placeholder="Cidade, Estado"
                    error={errors.local_nascimento?.message}
                    {...register('local_nascimento')}
                  />
                </div>
              </div>

              {/* Informações dos Pais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Informações dos Pais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Nome do Pai"
                    placeholder="Nome completo do pai"
                    error={errors.nome_pai?.message}
                    {...register('nome_pai')}
                  />

                  <InputField
                    label="Nome da Mãe"
                    placeholder="Nome completo da mãe"
                    error={errors.nome_mae?.message}
                    {...register('nome_mae')}
                  />
                </div>
              </div>

              {/* Informações dos Avós (Opcional) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Informações dos Avós (Opcional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Nome do Avô Paterno"
                    placeholder="Nome do avô paterno"
                    error={errors.nome_avo_paterno?.message}
                    {...register('nome_avo_paterno')}
                  />

                  <InputField
                    label="Nome da Avó Materna"
                    placeholder="Nome da avó materna"
                    error={errors.nome_avo_materno?.message}
                    {...register('nome_avo_materno')}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  loading={saving}
                  className="flex-1"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>

                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/bebes')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 