'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg 
          bg-pequena-background
          focus:ring-2 focus:ring-pequena-secundaria focus:border-transparent
          transition-colors duration-200
          ${error ? 'border-red-300 focus:ring-red-200' : ''}
          ${className}
        `}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input' 