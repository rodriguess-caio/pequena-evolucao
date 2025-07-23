'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VaccineCard } from '@/components/vaccines/VaccineCard';
import { useVaccinationSchedule } from '@/hooks/useVaccinationSchedule';

interface Bebe {
  id: string;
  nome: string;
  data_nascimento: string;
}

export default function VacinasPage() {
  const [user, setUser] = useState<any>(null);
  const [bebes, setBebes] = useState<Bebe[]>([]);
  const [selectedBebe, setSelectedBebe] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  // Usar o hook de vacinação
  const {
    schedule: vaccines,
    stats,
    loading: scheduleLoading,
    error: scheduleError,
    hasSchedule,
    markAsApplied,
    createSchedule
  } = useVaccinationSchedule({ childId: selectedBebe });

  const fetchUserAndBebes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: bebes, error } = await supabase
          .from('bebe')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao buscar bebês:', error);
        } else {
          setBebes(bebes || []);
          if (bebes && bebes.length > 0) {
            setSelectedBebe(bebes[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar usuário e bebês:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndBebes();
  }, []);

  const handleMarkAsApplied = async (vaccineId: string) => {
    try {
      await markAsApplied(
        vaccineId,
        new Date().toISOString().split('T')[0],
        'Posto de Saúde',
        'Aplicada conforme cronograma'
      );
    } catch (error) {
      console.error('Erro ao marcar vacina como aplicada:', error);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      await createSchedule();
    } catch (error) {
      console.error('Erro ao criar cronograma:', error);
    }
  };

  const filteredVaccines = vaccines.filter(vaccine => {
    switch (filter) {
      case 'pending':
        return vaccine.status === 'pending';
      case 'completed':
        return vaccine.status === 'completed';
      case 'overdue':
        return vaccine.isOverdue;
      default:
        return true;
    }
  });

  if (loading || !user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pequena-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendário de Vacinação</h1>
            <p className="text-gray-600">Acompanhe e gerencie as vacinas dos seus bebês</p>
          </div>
          
          {bebes.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedBebe || ''}
                onChange={(e) => setSelectedBebe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pequena-primary focus:border-transparent"
              >
                {bebes.map((bebe) => (
                  <option key={bebe.id} value={bebe.id}>
                    {bebe.nome}
                  </option>
                ))}
              </select>
              
              {!hasSchedule && (
                <button
                  onClick={handleCreateSchedule}
                  disabled={scheduleLoading}
                  className="px-4 py-2 bg-pequena-secondary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                  {scheduleLoading ? 'Criando...' : 'Criar Cronograma'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-pequena-background p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-pequena-background p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Aplicadas</div>
            </div>
            <div className="bg-pequena-background p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="bg-pequena-background p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">Atrasadas</div>
            </div>
          </div>
        )}

        {/* Filters */}
        {hasSchedule && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all'
                  ? 'bg-pequena-secondary text-white'
                  : 'bg-gray-200 text-pequena-secondary hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'pending'
                  ? 'bg-pequena-secondary text-white'
                  : 'bg-gray-200 text-pequena-secondary hover:bg-gray-300'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'completed'
                  ? 'bg-pequena-secondary text-white'
                  : 'bg-gray-200 text-pequena-secondary hover:bg-gray-300'
              }`}
            >
              Aplicadas
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'overdue'
                  ? 'bg-pequena-secondary text-white'
                  : 'bg-gray-200 text-pequena-secondary hover:bg-gray-300'
              }`}
            >
              Atrasadas
            </button>
          </div>
        )}

        {/* Error */}
        {scheduleError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{scheduleError}</p>
          </div>
        )}

        {/* Content */}
        {!selectedBebe ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Selecione um bebê para ver o cronograma de vacinação</p>
          </div>
        ) : scheduleLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pequena-primary"></div>
          </div>
        ) : !hasSchedule ? (
          <div className="text-center py-12">
            <div className="bg-pequena-background rounded-lg p-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum cronograma encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Clique no botão "Criar Cronograma" para gerar o calendário de vacinação baseado na data de nascimento do bebê.
              </p>
              <button
                onClick={handleCreateSchedule}
                disabled={scheduleLoading}
                className="px-6 py-3 bg-pequena-secondary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 font-medium"
              >
                {scheduleLoading ? 'Criando...' : 'Criar Cronograma'}
              </button>
            </div>
          </div>
        ) : vaccines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhuma vacina encontrada no cronograma</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVaccines.map((vaccine) => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
                onMarkAsApplied={handleMarkAsApplied}
                onViewDetails={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 