'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base',
            'focus:ring-2 focus:ring-pequena-secundaria focus:border-transparent',
            'transition-colors duration-200 bg-pequena-background',
            'appearance-none bg-no-repeat bg-right',
            'bg-[url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3e%3c/svg%3e")] bg-[length:1.5em_1.5em] pr-10',
            error ? 'border-red-300 focus:ring-red-200' : '',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select' 