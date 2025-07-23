import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bebeId = searchParams.get('bebe_id')
    const minAge = searchParams.get('min_age')
    const maxAge = searchParams.get('max_age')
    const includeReference = searchParams.get('include_reference') === 'true'

    if (!bebeId) {
      return NextResponse.json({ error: 'ID do bebê é obrigatório' }, { status: 400 })
    }

    // Verify that the bebê belongs to the authenticated user
    const { data: bebe, error: bebeError } = await supabase
      .from('bebe')
      .select('id, nome')
      .eq('id', bebeId)
      .eq('user_id', user.id)
      .single()

    if (bebeError || !bebe) {
      return NextResponse.json({ error: 'Bebê não encontrado' }, { status: 404 })
    }

    let query = supabase
      .from('desenvolvimento')
      .select('*')
      .eq('bebe_id', bebeId)
      .order('data_medicao', { ascending: false }) // Most recent first

    // Filter out reference data unless explicitly requested
    if (!includeReference) {
      query = query.neq('observacoes', 'Dados de referência - OMS')
    }

    // Apply age range filter if provided
    if (minAge && maxAge) {
      query = query
        .gte('idade_meses', parseFloat(minAge))
        .lte('idade_meses', parseFloat(maxAge))
    }

    const { data: desenvolvimento, error } = await query

    if (error) {
      console.error('Erro ao buscar dados de desenvolvimento:', error)
      return NextResponse.json({ error: 'Erro ao buscar dados de desenvolvimento' }, { status: 500 })
    }

    return NextResponse.json({ 
      desenvolvimento,
      bebe_nome: bebe.nome 
    })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { bebe_id, data_medicao, peso_kg, comprimento_cm, observacoes } = body

    if (!bebe_id || !data_medicao) {
      return NextResponse.json({ error: 'Bebê e data de medição são obrigatórios' }, { status: 400 })
    }

    // Verify that the bebê belongs to the authenticated user
    const { data: bebe, error: bebeError } = await supabase
      .from('bebe')
      .select('id, data_nascimento')
      .eq('id', bebe_id)
      .eq('user_id', user.id)
      .single()

    if (bebeError || !bebe) {
      return NextResponse.json({ error: 'Bebê não encontrado' }, { status: 404 })
    }

    // Calculate age in months
    const birthDate = new Date(bebe.data_nascimento)
    const measurementDate = new Date(data_medicao)
    const ageInMonths = ((measurementDate.getFullYear() - birthDate.getFullYear()) * 12) + 
                       (measurementDate.getMonth() - birthDate.getMonth()) +
                       (measurementDate.getDate() - birthDate.getDate()) / 30

    const { data: desenvolvimento, error } = await supabase
      .from('desenvolvimento')
      .insert({
        bebe_id,
        data_medicao,
        idade_meses: Math.round(ageInMonths * 100) / 100, // Round to 2 decimal places
        peso_kg,
        comprimento_cm,
        observacoes
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar dados de desenvolvimento:', error)
      return NextResponse.json({ error: 'Erro ao criar dados de desenvolvimento' }, { status: 500 })
    }

    return NextResponse.json({ desenvolvimento })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 