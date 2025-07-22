'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { consultaSchema, type ConsultaFormData } from '@/lib/validations/consulta'

interface Bebe {
  id: string
  nome: string
}

interface Medico {
  id: string
  nome: string
  especialidade: string
}

export default function NovaConsultaPage() {
  const [bebes, setBebes] = useState<Bebe[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultaFormData>({
    resolver: zodResolver(consultaSchema),
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch bebês
      const bebesResponse = await fetch('/api/bebes')
      const bebesData = await bebesResponse.json()

      // Fetch médicos
      const medicosResponse = await fetch('/api/medicos')
      const medicosData = await medicosResponse.json()

      if (bebesResponse.ok && medicosResponse.ok) {
        setBebes(bebesData.bebes)
        setMedicos(medicosData.medicos)
      } else {
        setError('Erro ao carregar dados necessários')
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setError('Erro ao carregar dados necessários')
    } finally {
      setLoadingData(false)
    }
  }

  const onSubmit = async (data: ConsultaFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/consultas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/consultas')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao agendar consulta')
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error)
      setError('Erro ao agendar consulta')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (bebes.length === 0) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-pequena-azul/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-pequena-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nenhum bebê cadastrado
          </h3>
          <p className="text-gray-600 mb-6">
            Você precisa cadastrar um bebê antes de agendar consultas.
          </p>
          <Button onClick={() => router.push('/bebes/novo')}>
            Cadastrar Bebê
          </Button>
        </div>
      </div>
    )
  }

  if (medicos.length === 0) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-pequena-azul/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-pequena-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nenhum médico cadastrado
          </h3>
          <p className="text-gray-600 mb-6">
            Você precisa cadastrar um médico antes de agendar consultas.
          </p>
          <Button onClick={() => router.push('/medicos/novo')}>
            Cadastrar Médico
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
                Agendar Consulta
              </h1>
              <p className="text-gray-600">
                Agende uma nova consulta médica para seu bebê
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/consultas')}
            >
              Voltar às Consultas
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Bebê */}
              <div>
                <label htmlFor="bebe_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Bebê *
                </label>
                <select
                  id="bebe_id"
                  {...register('bebe_id')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pequena-azul focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione um bebê</option>
                  {bebes.map((bebe) => (
                    <option key={bebe.id} value={bebe.id}>
                      {bebe.nome}
                    </option>
                  ))}
                </select>
                {errors.bebe_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.bebe_id.message}</p>
                )}
              </div>

              {/* Médico */}
              <div>
                <label htmlFor="medico_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Médico *
                </label>
                <select
                  id="medico_id"
                  {...register('medico_id')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pequena-azul focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione um médico</option>
                  {medicos.map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      Dr. {medico.nome} - {medico.especialidade}
                    </option>
                  ))}
                </select>
                {errors.medico_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.medico_id.message}</p>
                )}
              </div>

              {/* Data */}
              <div>
                <label htmlFor="data_consulta" className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Consulta *
                </label>
                <Input
                  id="data_consulta"
                  type="date"
                  {...register('data_consulta')}
                  error={errors.data_consulta?.message}
                />
              </div>

              {/* Hora */}
              <div>
                <label htmlFor="hora_consulta" className="block text-sm font-medium text-gray-700 mb-2">
                  Horário da Consulta *
                </label>
                <Input
                  id="hora_consulta"
                  type="time"
                  {...register('hora_consulta')}
                  error={errors.hora_consulta?.message}
                />
              </div>

              {/* Local */}
              <div>
                <label htmlFor="local" className="block text-sm font-medium text-gray-700 mb-2">
                  Local da Consulta *
                </label>
                <Input
                  id="local"
                  type="text"
                  placeholder="Ex: Consultório Dr. João Silva, Hospital ABC, etc."
                  {...register('local')}
                  error={errors.local?.message}
                />
              </div>

              {/* Anotações */}
              <div>
                <label htmlFor="anotacoes" className="block text-sm font-medium text-gray-700 mb-2">
                  Anotações (opcional)
                </label>
                <Textarea
                  id="anotacoes"
                  placeholder="Ex: Sintomas, observações importantes, etc."
                  {...register('anotacoes')}
                  error={errors.anotacoes?.message}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/consultas')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  {loading ? 'Agendando...' : 'Agendar Consulta'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 