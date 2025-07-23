'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base',
            'bg-pequena-background',
            'focus:ring-2 focus:ring-pequena-secundaria focus:border-transparent',
            'transition-colors duration-200 resize-none',
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

Textarea.displayName = 'Textarea' 