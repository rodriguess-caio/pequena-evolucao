'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/profile')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Se não há usuário autenticado, limpar sessão e redirecionar para login
          try {
            await fetch('/api/auth/logout', { method: 'POST' })
          } catch (error) {
            console.error('Erro ao limpar sessão:', error)
          }
          router.push('/')
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-pequena-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Bem-vindo, {user.name || 'Usuário'}!
              </h1>
              <p className="text-gray-600">
                Dashboard da Pequena Evolução
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Logado como</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
              
              <Button
                variant="outline"
                loading={isLoggingOut}
                onClick={handleLogout}
              >
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Perfil */}
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6">
            <div className="w-12 h-12 bg-pequena-azul/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pequena-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Perfil</h3>
            <p className="text-gray-600 text-sm mb-4">
              Gerencie suas informações pessoais e configurações da conta.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => router.push('/profile')}
            >
              Ver perfil
            </Button>
          </div>

          {/* Card 2 - Bebês */}
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-amarelo/20 p-6">
            <div className="w-12 h-12 bg-pequena-amarelo/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pequena-amarelo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Bebês</h3>
            <p className="text-gray-600 text-sm mb-4">
              Cadastre e acompanhe o desenvolvimento dos seus bebês.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => router.push('/bebes')}
            >
              Gerenciar bebês
            </Button>
          </div>

          {/* Card 3 - Médicos */}
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-verde/20 p-6">
            <div className="w-12 h-12 bg-pequena-verde/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pequena-verde" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Médicos</h3>
            <p className="text-gray-600 text-sm mb-4">
              Gerencie os profissionais de saúde dos seus bebês.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => router.push('/medicos')}
            >
              Gerenciar médicos
            </Button>
          </div>

          {/* Card 4 - Consultas */}
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-azul/20 p-6">
            <div className="w-12 h-12 bg-pequena-azul/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pequena-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Consultas</h3>
            <p className="text-gray-600 text-sm mb-4">
              Agende e acompanhe consultas médicas dos seus bebês.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => router.push('/consultas')}
            >
              Gerenciar consultas
            </Button>
          </div>

          {/* Card 5 - Exames */}
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6">
            <div className="w-12 h-12 bg-pequena-secundaria/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pequena-secundaria" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Exames</h3>
            <p className="text-gray-600 text-sm mb-4">
              Visualize e gerencie os exames dos seus bebês.
            </p>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Em breve
            </Button>
          </div>

          {/* Card 6 - Vacinas */}
          <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-lavanda/20 p-6">
            <div className="w-12 h-12 bg-pequena-lavanda/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pequena-lavanda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Vacinas</h3>
            <p className="text-gray-600 text-sm mb-4">
              Controle do calendário vacinal dos seus bebês.
            </p>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Em breve
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-pequena-background rounded-2xl shadow-lg border border-pequena-lavanda/20 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Informações da Conta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ID do Usuário</p>
              <p className="font-mono text-sm text-gray-800 break-all">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">E-mail</p>
              <p className="text-gray-800">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Conta criada em</p>
              <p className="text-gray-800">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Último login</p>
              <p className="text-gray-800">
                {user.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 