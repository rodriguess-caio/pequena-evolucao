'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { InputField } from '@/components/ui/InputField'
import { Button } from '@/components/ui/Button'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'
import { requestPasswordReset } from '@/lib/auth/reset-password'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      await requestPasswordReset(data.email)
      setSuccess(true)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar e-mail de recuperação')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout 
        title="E-mail enviado!" 
        subtitle="Verifique sua caixa de entrada"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-pequena-azul/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-pequena-secundaria" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Verifique seu e-mail
            </h3>
            <p className="text-gray-600 text-sm">
              Enviamos um link para redefinir sua senha. Clique no link para continuar.
            </p>
          </div>

          <div className="space-y-3">
            <Link 
              href="/"
              className="block w-full bg-pequena-secundaria text-white py-3 px-4 rounded-lg font-medium hover:bg-pequena-secundaria/90 transition-colors"
            >
              Voltar ao login
            </Link>
            
            <button
              onClick={() => setSuccess(false)}
              className="block w-full text-pequena-secundaria py-2 px-4 rounded-lg font-medium hover:bg-pequena-secundaria/10 transition-colors"
            >
              Enviar novamente
            </button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout 
      title="Esqueceu sua senha?" 
      subtitle="Digite seu e-mail para receber um link de recuperação"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <InputField
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          helperText="Enviaremos um link para redefinir sua senha"
          {...register('email')}
        />

        <Button 
          type="submit" 
          loading={loading}
          className="w-full"
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Lembrou sua senha?{' '}
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