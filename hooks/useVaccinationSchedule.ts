import { useState, useEffect } from 'react';
import { vaccinationService } from '@/lib/services/vaccinationService';
import { VaccinationScheduleWithDetails, VaccinationStats } from '@/types/vaccination';

interface UseVaccinationScheduleProps {
  childId: string | null;
}

interface UseVaccinationScheduleReturn {
  schedule: VaccinationScheduleWithDetails[];
  stats: VaccinationStats | null;
  loading: boolean;
  error: string | null;
  hasSchedule: boolean;
  refreshSchedule: () => Promise<void>;
  markAsApplied: (vaccineId: string, completedDate: string, location: string, notes?: string) => Promise<void>;
  createSchedule: () => Promise<void>;
}

export function useVaccinationSchedule({ childId }: UseVaccinationScheduleProps): UseVaccinationScheduleReturn {
  const [schedule, setSchedule] = useState<VaccinationScheduleWithDetails[]>([]);
  const [stats, setStats] = useState<VaccinationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSchedule, setHasSchedule] = useState(false);

  const fetchSchedule = async () => {
    if (!childId) return;

    setLoading(true);
    setError(null);

    try {
      // Verificar se já existe um cronograma
      const scheduleExists = await vaccinationService.hasVaccinationSchedule(childId);
      setHasSchedule(scheduleExists);

      if (scheduleExists) {
        const [scheduleData, statsData] = await Promise.all([
          vaccinationService.getVaccinationSchedule(childId),
          vaccinationService.getVaccinationStats(childId)
        ]);

        setSchedule(scheduleData);
        setStats(statsData);
      } else {
        setSchedule([]);
        setStats(null);
      }
    } catch (err) {
      console.error('Erro ao buscar cronograma:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar cronograma');
    } finally {
      setLoading(false);
    }
  };

  const refreshSchedule = async () => {
    await fetchSchedule();
  };

  const markAsApplied = async (vaccineId: string, completedDate: string, location: string, notes?: string) => {
    try {
      await vaccinationService.markVaccineAsApplied(vaccineId, completedDate, location, notes);
      await fetchSchedule(); // Recarregar dados
    } catch (err) {
      console.error('Erro ao marcar vacina como aplicada:', err);
      throw err;
    }
  };

  const createSchedule = async () => {
    if (!childId) return;

    setLoading(true);
    setError(null);

    try {
      await vaccinationService.generateVaccinationSchedule(childId);
      await fetchSchedule(); // Recarregar dados
    } catch (err) {
      console.error('Erro ao criar cronograma:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar cronograma');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [childId]);

  return {
    schedule,
    stats,
    loading,
    error,
    hasSchedule,
    refreshSchedule,
    markAsApplied,
    createSchedule
  };
} 