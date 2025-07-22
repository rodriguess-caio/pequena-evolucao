import type { RegisterFormData } from '@/lib/validations/auth'

export async function registerUser(data: RegisterFormData) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao registrar usuário')
    }

    return result
  } catch (error) {
    console.error('Erro no registro:', error)
    throw error
  }
}

export async function resendConfirmationEmail(email: string) {
  try {
    const response = await fetch('/api/auth/resend-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao reenviar e-mail')
    }

    return result
  } catch (error) {
    console.error('Erro ao reenviar e-mail:', error)
    throw error
  }
} 