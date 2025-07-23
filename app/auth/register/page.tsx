'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { InputField } from '@/components/ui/InputField'
import { Button } from '@/components/ui/Button'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { registerUser } from '@/lib/auth/register'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      await registerUser(data)
      setSuccess(true)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout 
        title="Conta criada com sucesso!" 
        subtitle="Verifique seu e-mail para confirmar sua conta"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-pequena-verde" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              E-mail de confirmação enviado!
            </h3>
            <p className="text-gray-600 text-sm">
              Clique no link enviado para seu e-mail para ativar sua conta.
            </p>
          </div>

          <div className="space-y-3">
            <Link 
              href="/"
              className="block w-full bg-pequena-secundaria text-white py-3 px-4 rounded-lg font-medium hover:bg-pequena-secundaria/90 transition-colors"
            >
              Ir para o login
            </Link>
            
            <button
              onClick={() => setSuccess(false)}
              className="block w-full text-pequena-secundaria py-2 px-4 rounded-lg font-medium hover:bg-pequena-secundaria/10 transition-colors"
            >
              Criar outra conta
            </button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout 
      title="Crie sua conta" 
      subtitle="Comece sua jornada com a Pequena Evolução"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <InputField
          label="Nome completo"
          placeholder="Seu nome completo"
          error={errors.name?.message}
          {...register('name')}
        />

        <InputField
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <InputField
          label="Senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          error={errors.password?.message}
          helperText="A senha deve ter pelo menos 6 caracteres"
          {...register('password')}
        />

        <InputField
          label="Confirmar senha"
          type="password"
          placeholder="Confirme sua senha"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button 
          type="submit" 
          loading={loading}
          className="w-full"
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link 
              href="/"
              className="text-pequena-secundaria hover:text-pequena-secundaria/80 font-medium transition-colors"
            >
              Faça login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
} 