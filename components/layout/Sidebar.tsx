'use client'

import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
  disabled?: boolean
}

interface SidebarProps {
  onClose?: () => void
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    )
  },
  {
    label: 'Consultas',
    href: '/consultas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    label: 'Vacinas',
    href: '/vacinas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  {
    label: 'Exames',
    href: '/exames',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    disabled: true
  }
]

export function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (href: string) => {
    router.push(href)
    // Fechar sidebar em dispositivos móveis após navegação
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="w-64 bg-pequena-background border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pequena-azul to-pequena-secundaria rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Pequena Evolução</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            const isDisabled = item.disabled

            return (
              <button
                key={item.href}
                onClick={() => !isDisabled && handleNavigation(item.href)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-pequena-azul text-white shadow-sm'
                    : isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                )}
              >
                {item.icon}
                {item.label}
                {isDisabled && (
                  <span className="ml-auto text-xs bg-white/70 text-gray-500 px-2 py-0.5 rounded-full">
                    Em breve
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>© 2024 Pequena Evolução</p>
          <p className="mt-1">Cuidando do futuro</p>
        </div>
      </div>
    </div>
  )
} 