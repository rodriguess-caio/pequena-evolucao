'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface User {
  name?: string
  email: string
}

interface HeaderProps {
  user: User
  title?: string
  subtitle?: string
  onMenuClick?: () => void
}

export function Header({ user, title = 'Dashboard', subtitle, onMenuClick }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    {
      label: 'Perfil',
      href: '/profile',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      label: 'Bebês',
      href: '/bebes',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      label: 'Médicos',
      href: '/medicos',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  return (
    <header className="bg-pequena-background border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Menu button and page title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title and subtitle */}
          <div className="min-w-0 flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{title}</h2>
            {subtitle && (
              <p className="text-xs lg:text-sm text-gray-600 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 rounded-lg hover:bg-white/50 transition-colors duration-200"
          >
            {/* User avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-pequena-azul to-pequena-secundaria rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>

            {/* User info - hidden on mobile */}
            <div className="hidden lg:block text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'carregando...'}</p>
            </div>

            {/* Dropdown arrow - hidden on mobile */}
            <svg
              className={cn(
                'hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0',
                isDropdownOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* Menu items */}
              {menuItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    setIsDropdownOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-pequena-background transition-colors duration-200"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 