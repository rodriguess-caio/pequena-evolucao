import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { VaccinationScheduleWithDetails, VaccinationStats } from '@/types/vaccination';

export class VaccinationService {
  private supabase = createClientComponentClient();

  /**
   * Verifica se já existe um cronograma para uma criança
   */
  async hasVaccinationSchedule(childId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('child_vaccination_schedule')
        .select('id')
        .eq('child_id', childId)
        .limit(1);

      if (error) {
        console.error('Erro ao verificar cronograma:', error);
        throw new Error('Erro ao verificar cronograma de vacinação');
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar cronograma:', error);
      throw error;
    }
  }

  /**
   * Busca o cronograma de vacinação de uma criança
   */
  async getVaccinationSchedule(childId: string): Promise<VaccinationScheduleWithDetails[]> {
    try {
      // Buscar cronograma da criança
      const { data: schedule, error: scheduleError } = await this.supabase
        .from('child_vaccination_schedule')
        .select('*')
        .eq('child_id', childId)
        .order('scheduled_date', { ascending: true });

      if (scheduleError) {
        console.error('Erro ao buscar cronograma:', scheduleError);
        throw new Error('Erro ao buscar cronograma de vacinação');
      }

      if (!schedule || schedule.length === 0) {
        return [];
      }

      // Buscar dados do calendário de vacinação
      const calendarIds = schedule.map((item: any) => item.vaccination_calendar_id);
      const { data: calendar, error: calendarError } = await this.supabase
        .from('vaccination_calendar')
        .select('*')
        .in('id', calendarIds);

      if (calendarError) {
        console.error('Erro ao buscar calendário:', calendarError);
        throw new Error('Erro ao buscar calendário de vacinação');
      }

      // Buscar dados do bebê
      const { data: bebe, error: bebeError } = await this.supabase
        .from('bebe')
        .select('id, nome, data_nascimento')
        .eq('id', childId)
        .single();

      if (bebeError) {
        console.error('Erro ao buscar bebê:', bebeError);
        throw new Error('Erro ao buscar dados do bebê');
      }

      // Processar e calcular campos adicionais
      const processedSchedule = schedule.map((item: any) => {
        const scheduledDate = new Date(item.scheduled_date);
        const today = new Date();
        const diffTime = scheduledDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const vaccineInfo = calendar?.find((c: any) => c.id === item.vaccination_calendar_id);

        return {
          ...item,
          daysUntilDue: item.status === 'pending' ? diffDays : null,
          isOverdue: item.status === 'pending' && scheduledDate < today,
          isDueSoon: item.status === 'pending' && diffDays >= 0 && diffDays <= 7,
          vaccination_calendar: vaccineInfo,
          child: bebe
        };
      });

      return processedSchedule;
    } catch (error) {
      console.error('Erro no serviço de vacinação:', error);
      throw error;
    }
  }

  /**
   * Gera cronograma de vacinação para uma criança
   */
  async generateVaccinationSchedule(childId: string): Promise<void> {
    try {
      // Verificar se já existe um cronograma
      const hasSchedule = await this.hasVaccinationSchedule(childId);
      if (hasSchedule) {
        throw new Error('Já existe um cronograma de vacinação para este bebê');
      }

      // Buscar dados do bebê
      const { data: bebe, error: bebeError } = await this.supabase
        .from('bebe')
        .select('data_nascimento')
        .eq('id', childId)
        .single();

      if (bebeError || !bebe) {
        throw new Error('Bebê não encontrado');
      }

      // Buscar calendário nacional de vacinação
      const { data: calendar, error: calendarError } = await this.supabase
        .from('vaccination_calendar')
        .select('*')
        .eq('is_active', true)
        .order('age_months', { ascending: true });

      if (calendarError) {
        console.error('Erro ao buscar calendário:', calendarError);
        throw new Error('Erro ao buscar calendário de vacinação');
      }

      // Calcular datas e inserir cronograma
      const birthDate = new Date(bebe.data_nascimento);
      const scheduleData = calendar?.map((vaccine: any) => {
        const scheduledDate = new Date(birthDate);
        scheduledDate.setMonth(scheduledDate.getMonth() + vaccine.age_months);

        return {
          child_id: childId,
          vaccination_calendar_id: vaccine.id,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          status: 'pending'
        };
      }) || [];

      // Inserir cronograma
      const { error: insertError } = await this.supabase
        .from('child_vaccination_schedule')
        .insert(scheduleData);

      if (insertError) {
        console.error('Erro ao inserir cronograma:', insertError);
        throw new Error('Erro ao criar cronograma de vacinação');
      }
    } catch (error) {
      console.error('Erro ao gerar cronograma:', error);
      throw error;
    }
  }

  /**
   * Marca uma vacina como aplicada
   */
  async markVaccineAsApplied(
    vaccineId: string, 
    completedDate: string, 
    location: string, 
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('child_vaccination_schedule')
        .update({
          status: 'completed',
          completed_date: completedDate,
          location,
          notes
        })
        .eq('id', vaccineId);

      if (error) {
        console.error('Erro ao marcar vacina como aplicada:', error);
        throw new Error('Erro ao atualizar status da vacina');
      }
    } catch (error) {
      console.error('Erro ao marcar vacina como aplicada:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas de vacinação
   */
  async getVaccinationStats(childId: string): Promise<VaccinationStats> {
    try {
      const schedule = await this.getVaccinationSchedule(childId);
      
      const total = schedule.length;
      const completed = schedule.filter(v => v.status === 'completed').length;
      const pending = schedule.filter(v => v.status === 'pending').length;
      const overdue = schedule.filter(v => v.isOverdue).length;
      const dueSoon = schedule.filter(v => v.isDueSoon).length;

      return {
        total,
        completed,
        pending,
        overdue,
        dueThisMonth: dueSoon,
        dueNextMonth: 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Busca calendário nacional de vacinação
   */
  async getVaccinationCalendar() {
    try {
      const { data, error } = await this.supabase
        .from('vaccination_calendar')
        .select('*')
        .eq('is_active', true)
        .order('age_months', { ascending: true });

      if (error) {
        console.error('Erro ao buscar calendário:', error);
        throw new Error('Erro ao buscar calendário de vacinação');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      throw error;
    }
  }
}

// Instância singleton
export const vaccinationService = new VaccinationService(); 