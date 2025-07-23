'use client'

import { ReactNode } from 'react'
import { Button } from './Button'

interface FormCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  onSubmit?: () => void
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  icon?: ReactNode
  iconBgColor?: string
  iconColor?: string
}

export function FormCard({
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  loading = false,
  icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600'
}: FormCardProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Header */}
        {title && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {icon && (
                <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
                  <div className={`w-6 h-6 ${iconColor}`}>
                    {icon}
                  </div>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.()
        }}>
          <div className="space-y-6">
            {children}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-200">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
            )}
            {onSubmit && (
              <Button
                type="submit"
                loading={loading}
              >
                {submitLabel}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

interface FormFieldProps {
  label: string
  children: ReactNode
  error?: string
  required?: boolean
  className?: string
}

export function FormField({ label, children, error, required = false, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

interface FormRowProps {
  children: ReactNode
  className?: string
}

export function FormRow({ children, className = '' }: FormRowProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  )
} 