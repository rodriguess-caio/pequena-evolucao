import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { consultaUpdateSchema } from '@/lib/validations/consulta'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get specific consulta with joined data
    const { data: consulta, error: consultaError } = await supabase
      .from('consultas_detalhadas')
      .select('*')
      .eq('id', params.id)
      .single()

    if (consultaError) {
      console.error('Erro ao buscar consulta:', consultaError)
      return NextResponse.json(
        { error: 'Erro ao buscar consulta' },
        { status: 500 }
      )
    }

    if (!consulta) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      consulta: consulta
    })

  } catch (error) {
    console.error('Erro ao buscar consulta:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = consultaUpdateSchema.parse({
      ...body,
      id: params.id
    })
    
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

    // Update consulta directly in table
    const { data: consulta, error: updateError } = await supabase
      .from('consulta')
      .update({
        bebe_id: validatedData.bebe_id,
        medico_id: validatedData.medico_id,
        data_consulta: validatedData.data_consulta,
        hora_consulta: validatedData.hora_consulta,
        local: validatedData.local,
        anotacoes: validatedData.anotacoes || null,
        status: validatedData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar consulta:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar consulta' },
        { status: 400 }
      )
    }

    if (!consulta) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Consulta atualizada com sucesso',
      consulta: consulta
    })

  } catch (error) {
    console.error('Erro ao atualizar consulta:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete consulta directly from table
    const { error: deleteError } = await supabase
      .from('consulta')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao deletar consulta:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar consulta' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Consulta deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar consulta:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 