import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { VaccinationService } from '@/lib/services/vaccinationService';

const vaccinationService = new VaccinationService();

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar calendário usando o serviço
    const calendar = await vaccinationService.getVaccinationCalendar();

    return NextResponse.json({ calendar });

  } catch (error) {
    console.error('Erro na API do calendário de vacinação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 