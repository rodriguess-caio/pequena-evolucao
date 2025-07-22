import { supabase } from '@/lib/supabase/client'

export async function requestPasswordReset(email: string) {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao solicitar reset de senha')
    }

    return result
  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error)
    throw error
  }
}

export async function updatePassword(newPassword: string, token?: string) {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        password: newPassword,
        token: token || 'authenticated'
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao atualizar senha')
    }

    return result
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    throw error
  }
}

export async function verifyResetToken(token: string) {
  try {
    // For token verification, we still need to use Supabase directly
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    throw error
  }
} 