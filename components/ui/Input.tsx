'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base',
            'bg-pequena-background',
            'focus:ring-2 focus:ring-pequena-secundaria focus:border-transparent',
            'transition-colors duration-200',
            'placeholder:text-gray-400',
            error ? 'border-red-300 focus:ring-red-200' : '',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input' 