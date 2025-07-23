'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  error?: string
  className?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error, className = '', placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-pequena-secundaria focus:border-transparent
          transition-colors duration-200 bg-pequena-background
          ${error ? 'border-red-300 focus:ring-red-200' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)

Select.displayName = 'Select' 