'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
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

export default function EditarMedicoPage({ params }: { params: { id: string } }) {
  const [medico, setMedico] = useState<Medico | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MedicoUpdateFormData>({
    resolver: zodResolver(medicoUpdateSchema),
  })

  useEffect(() => {
    fetchMedico()
  }, [params.id])

  const fetchMedico = async () => {
    try {
      const response = await fetch(`/api/medicos/${params.id}`)
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

  const onSubmit = async (data: MedicoUpdateFormData) => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/medicos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/medicos')
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

  if (error && !medico) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/medicos')}>
            Voltar aos Médicos
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
                Editar Médico
              </h1>
              <p className="text-gray-600">
                Atualize as informações do profissional de saúde
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/medicos')}
            >
              Voltar aos Médicos
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

              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Ex: Dr. João Silva"
                  {...register('nome')}
                  error={errors.nome?.message}
                />
              </div>

              {/* Especialidade */}
              <div>
                <label htmlFor="especialidade" className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidade *
                </label>
                <Input
                  id="especialidade"
                  type="text"
                  placeholder="Ex: Pediatria, Cardiologia, etc."
                  {...register('especialidade')}
                  error={errors.especialidade?.message}
                />
              </div>

              {/* CRM */}
              <div>
                <label htmlFor="crm" className="block text-sm font-medium text-gray-700 mb-2">
                  CRM (opcional)
                </label>
                <Input
                  id="crm"
                  type="text"
                  placeholder="Ex: 12345-SP"
                  {...register('crm')}
                  error={errors.crm?.message}
                />
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="Ex: (11) 99999-9999"
                  {...register('telefone')}
                  error={errors.telefone?.message}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail (opcional)
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex: joao.silva@email.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>

              {/* Endereço */}
              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço (opcional)
                </label>
                <Textarea
                  id="endereco"
                  placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
                  {...register('endereco')}
                  error={errors.endereco?.message}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/medicos')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 