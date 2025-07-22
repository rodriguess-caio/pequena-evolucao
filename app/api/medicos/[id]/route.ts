import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { medicoUpdateSchema } from '@/lib/validations/medico'

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

    // Get specific médico directly from table
    const { data: medico, error: medicoError } = await supabase
      .from('medico')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (medicoError) {
      console.error('Erro ao buscar médico:', medicoError)
      return NextResponse.json(
        { error: 'Erro ao buscar médico' },
        { status: 500 }
      )
    }

    if (!medico) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      medico: medico
    })

  } catch (error) {
    console.error('Erro ao buscar médico:', error)
    
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
    const validatedData = medicoUpdateSchema.parse({
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

    // Update médico directly in table
    const { data: medico, error: updateError } = await supabase
      .from('medico')
      .update({
        nome: validatedData.nome,
        especialidade: validatedData.especialidade,
        crm: validatedData.crm || null,
        telefone: validatedData.telefone,
        email: validatedData.email || null,
        endereco: validatedData.endereco || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar médico:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar médico' },
        { status: 400 }
      )
    }

    if (!medico) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Médico atualizado com sucesso',
      medico: medico
    })

  } catch (error) {
    console.error('Erro ao atualizar médico:', error)
    
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

    // Check if médico has associated consultas
    const { data: consultas, error: checkError } = await supabase
      .from('consulta')
      .select('id')
      .eq('medico_id', params.id)
      .eq('user_id', user.id)

    if (checkError) {
      console.error('Erro ao verificar consultas:', checkError)
      return NextResponse.json(
        { error: 'Erro ao verificar consultas associadas' },
        { status: 500 }
      )
    }

    if (consultas && consultas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar um médico que possui consultas agendadas' },
        { status: 400 }
      )
    }

    // Delete médico directly from table
    const { error: deleteError } = await supabase
      .from('medico')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao deletar médico:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar médico' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Médico deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar médico:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 