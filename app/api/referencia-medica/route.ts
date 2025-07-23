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
    const tipo = searchParams.get('tipo') // 'peso', 'comprimento', 'imc'
    const minAge = searchParams.get('min_age')
    const maxAge = searchParams.get('max_age')

    if (!tipo || !minAge || !maxAge) {
      return NextResponse.json({ error: 'Tipo e faixa etária são obrigatórios' }, { status: 400 })
    }

    // Validate tipo
    if (!['peso', 'comprimento', 'imc'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    // Get reference data using the function
    const { data: referencia, error } = await supabase
      .rpc('get_reference_data', {
        tipo_param: tipo,
        min_age_months: parseFloat(minAge),
        max_age_months: parseFloat(maxAge)
      })

    if (error) {
      console.error('Erro ao buscar dados de referência:', error)
      return NextResponse.json({ error: 'Erro ao buscar dados de referência' }, { status: 500 })
    }

    return NextResponse.json({ referencia })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 