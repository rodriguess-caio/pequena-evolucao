import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { VaccinationService } from '@/lib/services/vaccinationService';

const vaccinationService = new VaccinationService();

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { vaccineId, completed_date, location, notes } = await request.json();

    if (!vaccineId) {
      return NextResponse.json({ error: 'ID da vacina é obrigatório' }, { status: 400 });
    }

    // Verificar se a vacina pertence a um bebê do usuário
    const { data: vaccine, error: vaccineError } = await supabase
      .from('child_vaccination_schedule')
      .select(`
        *,
        child: child_id (
          user_id
        )
      `)
      .eq('id', vaccineId)
      .single();

    if (vaccineError || !vaccine) {
      return NextResponse.json({ error: 'Vacina não encontrada' }, { status: 404 });
    }

    if (vaccine.child.user_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Marcar vacina como aplicada usando o serviço
    await vaccinationService.markVaccineAsApplied(
      vaccineId,
      completed_date,
      location,
      notes
    );

    return NextResponse.json({ 
      message: 'Vacina marcada como aplicada com sucesso' 
    });

  } catch (error) {
    console.error('Erro na API de aplicar vacina:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 