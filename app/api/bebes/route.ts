import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { bebeSchema } from '@/lib/validations/bebe'

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

    // Get user's bebês directly from table
    const { data: bebes, error: bebesError } = await supabase
      .from('bebe')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (bebesError) {
      console.error('Erro ao buscar bebês:', bebesError)
      return NextResponse.json(
        { error: 'Erro ao buscar bebês' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      bebes: bebes || []
    })

  } catch (error) {
    console.error('Erro ao buscar bebês:', error)
    
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
    const validatedData = bebeSchema.parse(body)
    
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Create bebê directly in table
    const { data: bebe, error: createError } = await supabase
      .from('bebe')
      .insert({
        user_id: user.id,
        nome: validatedData.nome,
        data_nascimento: validatedData.data_nascimento,
        tipo_sanguineo: validatedData.tipo_sanguineo,
        local_nascimento: validatedData.local_nascimento,
        nome_pai: validatedData.nome_pai,
        nome_mae: validatedData.nome_mae,
        nome_avo_paterno: validatedData.nome_avo_paterno || null,
        nome_avo_materno: validatedData.nome_avo_materno || null
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar bebê:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar bebê' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Bebê criado com sucesso',
      bebe: bebe
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar bebê:', error)
    
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