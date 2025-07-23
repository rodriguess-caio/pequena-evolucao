'use client'

import { ReactNode } from 'react'
import { Button } from './Button'

interface DataCardProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  iconBgColor?: string
  iconColor?: string
  children: ReactNode
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  loading?: boolean
  className?: string
}

export function DataCard({
  title,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  children,
  onEdit,
  onDelete,
  onView,
  loading = false,
  className = ''
}: DataCardProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg`}></div>
          <div className="flex gap-2">
            <div className="w-16 h-8 bg-gray-200 rounded"></div>
            <div className="w-16 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <div className={`w-6 h-6 ${iconColor}`}>
              {icon}
            </div>
          </div>
        )}
        
        {(onEdit || onDelete || onView) && (
          <div className="flex gap-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={onView}
              >
                Ver
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
              >
                Deletar
              </Button>
            )}
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-1">
        {title}
      </h3>
      
      {subtitle && (
        <p className="text-gray-600 text-sm mb-4">
          {subtitle}
        </p>
      )}

      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

interface DataCardItemProps {
  label: string
  value: ReactNode
  className?: string
}

export function DataCardItem({ label, value, className = '' }: DataCardItemProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  )
}

interface DataCardSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function DataCardSection({ title, children, className = '' }: DataCardSectionProps) {
  return (
    <div className={`pt-4 border-t border-gray-200 ${className}`}>
      <div className="text-sm text-gray-500 mb-2">{title}:</div>
      <div className="text-sm text-gray-800 space-y-1">
        {children}
      </div>
    </div>
  )
} 