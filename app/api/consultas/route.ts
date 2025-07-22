import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { consultaSchema } from '@/lib/validations/consulta'

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

    // Get user's consultas with joined data from view
    const { data: consultas, error: consultasError } = await supabase
      .from('consultas_detalhadas')
      .select('*')
      .order('data_consulta', { ascending: false })
      .order('hora_consulta', { ascending: false })

    if (consultasError) {
      console.error('Erro ao buscar consultas:', consultasError)
      return NextResponse.json(
        { error: 'Erro ao buscar consultas' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      consultas: consultas || []
    })

  } catch (error) {
    console.error('Erro ao buscar consultas:', error)
    
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
    const validatedData = consultaSchema.parse(body)
    
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Verify if bebe belongs to user
    const { data: bebe, error: bebeError } = await supabase
      .from('bebe')
      .select('id')
      .eq('id', validatedData.bebe_id)
      .eq('user_id', user.id)
      .single()

    if (bebeError || !bebe) {
      return NextResponse.json(
        { error: 'Bebê não encontrado' },
        { status: 404 }
      )
    }

    // Verify if medico belongs to user
    const { data: medico, error: medicoError } = await supabase
      .from('medico')
      .select('id')
      .eq('id', validatedData.medico_id)
      .eq('user_id', user.id)
      .single()

    if (medicoError || !medico) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      )
    }

    // Create consulta directly in table
    const { data: consulta, error: createError } = await supabase
      .from('consulta')
      .insert({
        user_id: user.id,
        bebe_id: validatedData.bebe_id,
        medico_id: validatedData.medico_id,
        data_consulta: validatedData.data_consulta,
        hora_consulta: validatedData.hora_consulta,
        local: validatedData.local,
        anotacoes: validatedData.anotacoes || null,
        status: validatedData.status
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar consulta:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar consulta' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Consulta agendada com sucesso',
      consulta: consulta
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar consulta:', error)
    
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