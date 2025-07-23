export interface VaccinationCalendar {
  id: string
  vaccine_name: string
  age_months: number
  dose_number: number
  minimum_interval_days: number | null
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChildVaccinationSchedule {
  id: string
  child_id: string
  vaccination_calendar_id: string
  scheduled_date: string
  status: 'pending' | 'completed' | 'overdue'
  completed_date: string | null
  location: string | null
  notes: string | null
  certificate_url: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  vaccination_calendar?: VaccinationCalendar
  child?: {
    id: string
    nome: string
    data_nascimento: string
  }
}

export interface VaccinationAlert {
  id: string
  child_vaccination_schedule_id: string
  user_id: string
  alert_type: '7_days' | '3_days' | 'same_day'
  sent_at: string
  delivery_status: 'sent' | 'delivered' | 'failed'
}

export interface VaccinationScheduleWithDetails extends ChildVaccinationSchedule {
  vaccination_calendar: VaccinationCalendar
  child: {
    id: string
    nome: string
    data_nascimento: string
  }
  daysUntilDue: number
  isOverdue: boolean
  isDueSoon: boolean
}

export interface VaccinationStats {
  total: number
  pending: number
  completed: number
  overdue: number
  dueThisMonth: number
  dueNextMonth: number
}

export interface VaccinationFormData {
  completed_date: string
  location: string
  notes?: string
  certificate?: File
} 