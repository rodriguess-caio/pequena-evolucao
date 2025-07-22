import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const resendSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = resendSchema.parse(body)
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Resend confirmation email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: validatedData.email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'E-mail de confirmação reenviado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao reenviar confirmação:', error)
    
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