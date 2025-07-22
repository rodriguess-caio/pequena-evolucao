import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    const supabase = createRouteHandlerClient({ cookies })
    
    console.log('Tentando login com:', email)
    
    // Try to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Erro de autenticação:', authError)
      return NextResponse.json({
        error: 'Auth Error',
        message: authError.message,
        details: authError
      }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({
        error: 'No User',
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    console.log('Usuário autenticado:', authData.user.id)

    // Try to access profiles table directly
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      console.log('Teste de acesso à tabela profiles:', { data: profiles, error: profilesError })
    } catch (err) {
      console.error('Erro ao acessar tabela profiles:', err)
    }

    // Try to get user's own profile
    try {
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      console.log('Perfil do usuário:', { data: userProfile, error: userProfileError })
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err)
    }

    // Sign out
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      email: authData.user.email,
      message: 'Teste concluído - verifique os logs do servidor'
    })

  } catch (error) {
    console.error('Erro geral no teste:', error)
    
    return NextResponse.json({
      error: 'Test Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
} 