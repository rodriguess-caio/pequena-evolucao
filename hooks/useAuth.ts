import { useState, useEffect } from 'react'
import { loginUser, logoutUser, getCurrentUser } from '@/lib/auth/login'
import { registerUser } from '@/lib/auth/register'
import { requestPasswordReset } from '@/lib/auth/reset-password'
import type { LoginFormData, RegisterFormData, ResetPasswordFormData } from '@/lib/validations/auth'

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Não verificar usuário automaticamente
    // Isso evita problemas de redirecionamento e loading infinito
    setLoading(false)
  }, [])

  const login = async (data: LoginFormData) => {
    try {
      setLoading(true)
      const result = await loginUser(data)
      setUser(result.user)
      
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterFormData) => {
    try {
      setLoading(true)
      await registerUser(data)
      // Don't set user here as email confirmation is required
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await logoutUser()
      setUser(null)
      
      // Redirect to login page after logout
      window.location.href = '/'
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true)
      await requestPasswordReset(data.email)
    } catch (error) {
      console.error('Erro no reset de senha:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    refreshUser,
  }
} 