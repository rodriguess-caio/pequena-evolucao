'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  className?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg 
          bg-pequena-background
          focus:ring-2 focus:ring-pequena-secundaria focus:border-transparent
          transition-colors duration-200 resize-none
          ${error ? 'border-red-300 focus:ring-red-200' : ''}
          ${className}
        `}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea' 