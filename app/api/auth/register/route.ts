import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
        },
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // The trigger will automatically create the profile and usuario records
    // No need to manually insert here

    return NextResponse.json({
      message: 'Usuário registrado com sucesso. Verifique seu e-mail para confirmar a conta.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: validatedData.name,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro no registro:', error)
    
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