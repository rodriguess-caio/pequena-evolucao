'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormCard, FormField, FormRow } from '@/components/ui/FormCard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
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
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultaFormData>({
    resolver: zodResolver(consultaSchema),
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
    if (user) {
      fetchData()
    }
  }, [user])

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

  const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )

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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-pequena-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nenhum bebê cadastrado
          </h3>
          <p className="text-gray-600 mb-6">
            Você precisa cadastrar um bebê antes de agendar consultas.
          </p>
          <button
            onClick={() => router.push('/bebes/novo')}
            className="bg-pequena-secundaria text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Cadastrar Bebê
          </button>
        </div>
      </div>
    )
  }

  if (medicos.length === 0) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
          <button
            onClick={() => router.push('/medicos/novo')}
            className="bg-pequena-secundaria text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Cadastrar Médico
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      user={user}
      title="Agendar Consulta"
      subtitle="Agende uma nova consulta médica"
    >
      <div className="p-6">
        <FormCard
          icon={<CalendarIcon />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          onSubmit={handleSubmit(onSubmit)}
          onCancel={() => router.push('/consultas')}
          submitLabel={loading ? 'Agendando...' : 'Agendar Consulta'}
          cancelLabel="Cancelar"
          loading={loading}
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Seleção de Bebê e Médico */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Seleção de Participantes
            </h3>
            
            <FormRow>
              <FormField label="Bebê" required error={errors.bebe_id?.message}>
                <select
                  {...register('bebe_id')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-pequena-background focus:ring-2 focus:ring-pequena-secundaria focus:border-transparent transition-colors duration-200"
                >
                  <option value="">Selecione um bebê</option>
                  {bebes.map((bebe) => (
                    <option key={bebe.id} value={bebe.id}>
                      {bebe.nome}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Médico" required error={errors.medico_id?.message}>
                <select
                  {...register('medico_id')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-pequena-background focus:ring-2 focus:ring-pequena-secundaria focus:border-transparent transition-colors duration-200"
                >
                  <option value="">Selecione um médico</option>
                  {medicos.map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      Dr. {medico.nome} - {medico.especialidade}
                    </option>
                  ))}
                </select>
              </FormField>
            </FormRow>
          </div>

          {/* Data e Hora */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Data e Horário
            </h3>
            
            <FormRow>
              <FormField label="Data da Consulta" required error={errors.data_consulta?.message}>
                <Input
                  type="date"
                  {...register('data_consulta')}
                />
              </FormField>

              <FormField label="Horário da Consulta" required error={errors.hora_consulta?.message}>
                <Input
                  type="time"
                  {...register('hora_consulta')}
                />
              </FormField>
            </FormRow>
          </div>

          {/* Local */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Local da Consulta
            </h3>
            
            <FormField label="Local" required error={errors.local?.message}>
              <Input
                placeholder="Ex: Consultório Dr. João Silva, Hospital ABC, etc."
                {...register('local')}
              />
            </FormField>
          </div>

          {/* Anotações */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Observações
            </h3>
            
            <FormField label="Anotações (opcional)" error={errors.anotacoes?.message}>
              <Textarea
                placeholder="Ex: Sintomas, observações importantes, etc."
                {...register('anotacoes')}
              />
            </FormField>
          </div>
        </FormCard>
      </div>
    </DashboardLayout>
  )
} 