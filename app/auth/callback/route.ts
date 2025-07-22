import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Trocar o código por uma sessão
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Erro ao trocar código por sessão:', error)
      // Se houver erro, redirecionar para login
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }
  }

  // URL para redirecionar após autenticação
  const redirectTo = requestUrl.searchParams.get('redirectTo') || next
  
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
} 