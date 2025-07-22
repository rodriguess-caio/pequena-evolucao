import Image from 'next/image'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-pequena-background">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Image
              src="/logo_pequena_evolucao_conceito.webp"
              alt="Pequena Evolução"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 text-sm">{subtitle}</p>
            )}
          </div>

          {/* Card do formulário */}
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-8">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© 2024 Pequena Evolução. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 