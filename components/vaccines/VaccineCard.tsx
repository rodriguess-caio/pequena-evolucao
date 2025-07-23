import { useState } from 'react'
import { VaccineStatusBadge } from './VaccineStatusBadge'
import { Button } from '@/components/ui/Button'
import { VaccinationScheduleWithDetails } from '@/types/vaccination'

interface VaccineCardProps {
  vaccine: VaccinationScheduleWithDetails
  onMarkAsApplied: (vaccineId: string) => void
  onViewDetails: (vaccine: VaccinationScheduleWithDetails) => void
}

export function VaccineCard({ vaccine, onMarkAsApplied, onViewDetails }: VaccineCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDaysUntilDue = () => {
    const today = new Date()
    const scheduledDate = new Date(vaccine.scheduled_date)
    const diffTime = scheduledDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDue = getDaysUntilDue()
  const isOverdue = daysUntilDue < 0
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0

  const handleMarkAsApplied = async () => {
    setIsLoading(true)
    try {
      await onMarkAsApplied(vaccine.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-pequena-background rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {vaccine.vaccination_calendar.vaccine_name}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {vaccine.vaccination_calendar.description}
          </p>
        </div>
        <VaccineStatusBadge status={vaccine.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Data Prevista:</span>
          <span className="font-medium text-gray-900">
            {formatDate(vaccine.scheduled_date)}
          </span>
        </div>

        {vaccine.completed_date && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Data Aplicada:</span>
            <span className="font-medium text-green-700">
              {formatDate(vaccine.completed_date)}
            </span>
          </div>
        )}

        {vaccine.location && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Local:</span>
            <span className="font-medium text-gray-900 truncate ml-2">
              {vaccine.location}
            </span>
          </div>
        )}

        {!vaccine.completed_date && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Dias:</span>
            <span className={isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-900'}>
              {isOverdue ? `${Math.abs(daysUntilDue)} dias em atraso` : `${daysUntilDue} dias`}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {vaccine.status === 'pending' && (
          <Button
            size="sm"
            onClick={handleMarkAsApplied}
            loading={isLoading}
            className="flex-1 bg-pequena-secondary text-white hover:bg-opacity-90"
          >
            Marcar como Aplicada
          </Button>
        )}
      </div>
    </div>
  )
} 