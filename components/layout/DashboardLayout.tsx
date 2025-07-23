'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface User {
  name?: string
  email: string
}

interface DashboardLayoutProps {
  children: ReactNode
  user: User
  title?: string
  subtitle?: string
}

export function DashboardLayout({ children, user, title, subtitle }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Se não há usuário, mostrar loading
  if (!user) {
    return (
      <div className="h-screen flex bg-pequena-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-pequena-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header 
          user={user} 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 