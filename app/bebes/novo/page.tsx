'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputField } from '@/components/ui/InputField'
import { Button } from '@/components/ui/Button'
import { bebeSchema, type BebeFormData } from '@/lib/validations/bebe'

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
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BebeFormData>({
    resolver: zodResolver(bebeSchema),
  })

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

  return (
    <div className="min-h-screen bg-pequena-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Cadastrar Novo Bebê
              </h1>
              <p className="text-gray-600">
                Preencha as informações básicas do seu bebê
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
                  loading={loading}
                  className="flex-1"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Bebê'}
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