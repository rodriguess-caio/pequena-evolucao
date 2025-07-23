'use client'

import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, children, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  )
} 