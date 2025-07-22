'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { InputField } from '@/components/ui/InputField'
import { Button } from '@/components/ui/Button'
import { updatePassword } from '@/lib/auth/reset-password'
import Link from 'next/link'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

const resetPasswordSchema = {
  password: (value: string) => {
    if (!value) return 'Senha é obrigatória'
    if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres'
    return null
  },
  confirmPassword: (value: string, formData: ResetPasswordFormData) => {
    if (!value) return 'Confirmação de senha é obrigatória'
    if (value !== formData.password) return 'Senhas não coincidem'
    return null
  }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>()

  const watchedPassword = (watch('password') ?? '') as string

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/verify-session')
        if (response.ok) {
          // Usuário está autenticado, pode prosseguir
          setToken('authenticated')
        } else {
          // Usuário não está autenticado, redirecionar para login
          router.push('/')
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        router.push('/')
      }
    }

    checkSession()
  }, [router])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token de redefinição não encontrado')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await updatePassword(data.password, token)
      setSuccess(true)
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout 
        title="Senha redefinida!" 
        subtitle="Sua senha foi atualizada com sucesso"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-pequena-verde/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-pequena-verde" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Sucesso!
            </h3>
            <p className="text-gray-600 text-sm">
              Sua senha foi redefinida com sucesso. Você será redirecionado para o login em alguns segundos.
            </p>
          </div>

          <Link 
            href="/auth/login"
            className="block w-full bg-pequena-secundaria text-white py-3 px-4 rounded-lg font-medium hover:bg-pequena-secundaria/90 transition-colors"
          >
            Ir para o login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (!token) {
    return (
      <AuthLayout 
        title="Token inválido" 
        subtitle="Link de redefinição não encontrado"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Link inválido
            </h3>
            <p className="text-gray-600 text-sm">
              O link de redefinição de senha é inválido ou expirou. Solicite um novo link.
            </p>
          </div>

          <Link 
            href="/auth/forgot-password"
            className="block w-full bg-pequena-secundaria text-white py-3 px-4 rounded-lg font-medium hover:bg-pequena-secundaria/90 transition-colors"
          >
            Solicitar novo link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout 
      title="Redefinir senha" 
      subtitle="Digite sua nova senha"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <InputField
          label="Nova senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          error={resetPasswordSchema.password(watchedPassword) ?? undefined}
          helperText="A senha deve ter pelo menos 6 caracteres"
          {...register('password')}
        />

        <InputField
          label="Confirmar nova senha"
          type="password"
          placeholder="Confirme sua nova senha"
          error={resetPasswordSchema.confirmPassword((watch('confirmPassword') ?? '') as string, { password: watchedPassword, confirmPassword: (watch('confirmPassword') ?? '') as string }) ?? undefined}
          {...register('confirmPassword')}
        />

        <Button 
          type="submit" 
          loading={loading}
          className="w-full"
        >
          {loading ? 'Redefinindo...' : 'Redefinir senha'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Lembrou sua senha?{' '}
            <a 
              href="/"
              className="text-pequena-secundaria hover:text-pequena-secundaria/80 font-medium transition-colors"
            >
              Faça login
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
} 