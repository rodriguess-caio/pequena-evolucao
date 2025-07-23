import { cn } from '@/lib/utils'

interface VaccineStatusBadgeProps {
  status: 'pending' | 'completed' | 'overdue'
  className?: string
}

export function VaccineStatusBadge({ status, className }: VaccineStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          label: 'Aplicada',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )
        }
      case 'overdue':
        return {
          label: 'Em Atraso',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        }
      case 'pending':
      default:
        return {
          label: 'Pendente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )
        }
    }
  }

  const config = getStatusConfig()

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border',
      config.className,
      className
    )}>
      {config.icon}
      {config.label}
    </span>
  )
} 