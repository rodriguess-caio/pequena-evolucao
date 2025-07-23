'use client'

import { ReactNode } from 'react'
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} title={title} subtitle={subtitle} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 