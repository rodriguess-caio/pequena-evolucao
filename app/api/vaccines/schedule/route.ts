import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { VaccinationService } from '@/lib/services/vaccinationService';

const vaccinationService = new VaccinationService();

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    // Buscar bebês do usuário
    const { data: bebes, error: bebesError } = await supabase
      .from('bebe')
      .select('*')
      .eq('user_id', user.id);

    if (bebesError) {
      console.error('Erro ao buscar bebês:', bebesError);
      return NextResponse.json({ error: 'Erro ao buscar bebês' }, { status: 500 });
    }

    if (!bebes || bebes.length === 0) {
      return NextResponse.json({ error: 'Nenhum bebê encontrado' }, { status: 404 });
    }

    const targetChildId = childId || bebes[0].id;
    const targetBebe = bebes.find((b: any) => b.id === targetChildId);

    if (!targetBebe) {
      return NextResponse.json({ error: 'Bebê não encontrado' }, { status: 404 });
    }

    try {
      // Verificar se já existe um cronograma
      const hasSchedule = await vaccinationService.hasVaccinationSchedule(targetChildId);
      
      if (hasSchedule) {
        // Buscar cronograma existente
        const [schedule, stats] = await Promise.all([
          vaccinationService.getVaccinationSchedule(targetChildId),
          vaccinationService.getVaccinationStats(targetChildId)
        ]);
        
        return NextResponse.json({
          schedule,
          stats,
          selectedChild: targetBebe,
          hasSchedule: true
        });
      } else {
        // Retornar dados vazios indicando que não há cronograma
        return NextResponse.json({
          schedule: [],
          stats: null,
          selectedChild: targetBebe,
          hasSchedule: false
        });
      }

    } catch (error) {
      console.error('Erro ao buscar cronograma:', error);
      return NextResponse.json({ error: 'Erro ao buscar cronograma de vacinação' }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro na API de cronograma de vacinação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { childId } = await request.json();

    if (!childId) {
      return NextResponse.json({ error: 'ID da criança é obrigatório' }, { status: 400 });
    }

    // Verificar se o bebê pertence ao usuário
    const { data: bebe, error: bebeError } = await supabase
      .from('bebe')
      .select('*')
      .eq('id', childId)
      .eq('user_id', user.id)
      .single();

    if (bebeError || !bebe) {
      return NextResponse.json({ error: 'Bebê não encontrado' }, { status: 404 });
    }

    // Verificar se já existe um cronograma
    const hasSchedule = await vaccinationService.hasVaccinationSchedule(childId);
    if (hasSchedule) {
      return NextResponse.json({ 
        error: 'Já existe um cronograma de vacinação para este bebê' 
      }, { status: 409 });
    }

    // Gerar cronograma usando o serviço
    await vaccinationService.generateVaccinationSchedule(childId);

    return NextResponse.json({ 
      message: 'Cronograma de vacinação criado com sucesso' 
    });

  } catch (error) {
    console.error('Erro na API de criação de cronograma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 