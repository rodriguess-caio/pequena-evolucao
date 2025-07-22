import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { medicoSchema } from '@/lib/validations/medico'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Get user's médicos directly from table
    const { data: medicos, error: medicosError } = await supabase
      .from('medico')
      .select('*')
      .eq('user_id', user.id)
      .order('nome', { ascending: true })

    if (medicosError) {
      console.error('Erro ao buscar médicos:', medicosError)
      return NextResponse.json(
        { error: 'Erro ao buscar médicos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      medicos: medicos || []
    })

  } catch (error) {
    console.error('Erro ao buscar médicos:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = medicoSchema.parse(body)
    
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Create médico directly in table
    const { data: medico, error: createError } = await supabase
      .from('medico')
      .insert({
        user_id: user.id,
        nome: validatedData.nome,
        especialidade: validatedData.especialidade,
        crm: validatedData.crm || null,
        telefone: validatedData.telefone,
        email: validatedData.email || null,
        endereco: validatedData.endereco || null
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar médico:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar médico' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Médico criado com sucesso',
      medico: medico
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar médico:', error)
    
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