import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 border rounded-lg transition-colors duration-200",
            "bg-pequena-background",
            "focus:outline-none focus:ring-2 focus:ring-pequena-secundaria/50 focus:border-pequena-secundaria",
            "placeholder:text-gray-400",
            error 
              ? "border-red-300 focus:ring-red-200 focus:border-red-500" 
              : "border-gray-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

InputField.displayName = 'InputField' 