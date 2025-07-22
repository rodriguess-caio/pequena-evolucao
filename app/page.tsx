'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { InputField } from '@/components/ui/InputField'
import { Button } from '@/components/ui/Button'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setFormError('')
    
    try {
      await login(data)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao fazer login')
    }
  }

  return (
    <AuthLayout 
      title="Bem-vindo de volta!" 
      subtitle="Faça login para acessar sua conta"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{formError}</p>
          </div>
        )}

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
          placeholder="Sua senha"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-pequena-secundaria border-gray-300 rounded focus:ring-pequena-secundaria bg-pequena-background"
            />
            <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
          </label>
          
          <Link 
            href="/auth/forgot-password"
            className="text-sm text-pequena-secundaria hover:text-pequena-secundaria/80 transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button 
          type="submit" 
          loading={loading}
          className="w-full"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link 
              href="/auth/register"
              className="text-pequena-secundaria hover:text-pequena-secundaria/80 font-medium transition-colors"
            >
              Registre-se
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
} 