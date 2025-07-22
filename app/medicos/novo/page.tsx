'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { medicoSchema, type MedicoFormData } from '@/lib/validations/medico'

export default function NovoMedicoPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicoFormData>({
    resolver: zodResolver(medicoSchema),
  })

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

  return (
    <div className="min-h-screen bg-pequena-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Cadastrar Médico
              </h1>
              <p className="text-gray-600">
                Adicione as informações do profissional de saúde
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
                  loading={loading}
                  className="flex-1"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Médico'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 