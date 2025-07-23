'use client'

import { ReactNode } from 'react'
import { Button } from './Button'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  children?: ReactNode
}

export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 text-lg">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <Button
            onClick={action.onClick}
            className="flex items-center gap-2"
          >
            {action.icon && action.icon}
            {action.label}
          </Button>
        )}
      </div>
      
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  )
} 