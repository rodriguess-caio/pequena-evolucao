import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${request.nextUrl.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'E-mail de recuperação enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro na recuperação de senha:', error)
    
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