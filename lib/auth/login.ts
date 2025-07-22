import type { LoginFormData } from '@/lib/validations/auth'

export async function loginUser(data: LoginFormData) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao fazer login')
    }

    return result
  } catch (error) {
    console.error('Erro no login:', error)
    throw error
  }
}

export async function logoutUser() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao fazer logout')
    }

    return result
  } catch (error) {
    console.error('Erro no logout:', error)
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    return result.user
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error)
    return null
  }
} 