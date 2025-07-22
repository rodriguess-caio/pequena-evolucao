import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { bebeUpdateSchema } from '@/lib/validations/bebe'

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

    // Get specific bebê directly from table
    const { data: bebe, error: bebeError } = await supabase
      .from('bebe')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (bebeError) {
      console.error('Erro ao buscar bebê:', bebeError)
      return NextResponse.json(
        { error: 'Erro ao buscar bebê' },
        { status: 500 }
      )
    }

    if (!bebe) {
      return NextResponse.json(
        { error: 'Bebê não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      bebe: bebe
    })

  } catch (error) {
    console.error('Erro ao buscar bebê:', error)
    
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
    const validatedData = bebeUpdateSchema.parse({
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

    // Update bebê directly in table
    const { data: bebe, error: updateError } = await supabase
      .from('bebe')
      .update({
        nome: validatedData.nome,
        data_nascimento: validatedData.data_nascimento,
        tipo_sanguineo: validatedData.tipo_sanguineo,
        local_nascimento: validatedData.local_nascimento,
        nome_pai: validatedData.nome_pai,
        nome_mae: validatedData.nome_mae,
        nome_avo_paterno: validatedData.nome_avo_paterno || null,
        nome_avo_materno: validatedData.nome_avo_materno || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar bebê:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar bebê' },
        { status: 400 }
      )
    }

    if (!bebe) {
      return NextResponse.json(
        { error: 'Bebê não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Bebê atualizado com sucesso',
      bebe: bebe
    })

  } catch (error) {
    console.error('Erro ao atualizar bebê:', error)
    
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

    // Delete bebê directly from table
    const { error: deleteError } = await supabase
      .from('bebe')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao deletar bebê:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar bebê' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Bebê deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar bebê:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 