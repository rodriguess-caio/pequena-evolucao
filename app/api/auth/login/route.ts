import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Check if email is confirmed
    if (!authData.user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Por favor, confirme seu e-mail antes de fazer login' },
        { status: 403 }
      )
    }

    // Get user profile data - simplified approach without functions
    let profile = null
    
    try {
      // Try to get the profile directly
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError)
        
        // If profile doesn't exist, create it manually
        if (profileError.code === 'PGRST116') {
          console.log('Criando perfil para usuário:', authData.user.id)
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              name: authData.user.user_metadata?.name || 'Usuário',
              email: authData.user.email || ''
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Erro ao criar perfil:', createError)
            // Don't fail the login, just continue without profile
          } else {
            profile = newProfile
            console.log('Perfil criado com sucesso')
          }
        }
      } else {
        profile = profileData
        console.log('Perfil encontrado')
      }
    } catch (err) {
      console.error('Erro geral ao buscar/criar perfil:', err)
      // Don't fail the login, just continue without profile
    }

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile?.name || authData.user.user_metadata?.name,
        avatar_url: profile?.avatar_url,
      },
      session: authData.session
    })

  } catch (error) {
    console.error('Erro no login:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 