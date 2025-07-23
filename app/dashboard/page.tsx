'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DevelopmentChart } from '@/components/dashboard/DevelopmentChart'
import { AgeRangeFilter } from '@/components/dashboard/AgeRangeFilter'
import { BebeSelector } from '@/components/dashboard/BebeSelector'

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

interface Bebe {
  id: string
  nome: string
  data_nascimento: string
}

interface DevelopmentData {
  id: string
  data_medicao: string
  idade_meses: number
  peso_kg?: number
  comprimento_cm?: number
  imc?: number
  observacoes?: string
}

interface AgeRange {
  label: string
  minAge: number
  maxAge: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [bebes, setBebes] = useState<Bebe[]>([])
  const [selectedBebeId, setSelectedBebeId] = useState<string>('')
  const [selectedBebe, setSelectedBebe] = useState<Bebe | null>(null)
  const [developmentData, setDevelopmentData] = useState<DevelopmentData[]>([])
  const [loadingCharts, setLoadingCharts] = useState(false)
  const [bebesCount, setBebesCount] = useState(0)
  const [consultasCount, setConsultasCount] = useState(0)
  const [medicosCount, setMedicosCount] = useState(0)
  const router = useRouter()

  const ageRanges: AgeRange[] = [
    { label: '0-2 anos', minAge: 0, maxAge: 24 },
    { label: '2-5 anos', minAge: 24, maxAge: 60 },
    { label: '5-10 anos', minAge: 60, maxAge: 120 }
  ]

  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange>(ageRanges[0])

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

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchBebes()
    }
  }, [user])

  useEffect(() => {
    if (selectedBebeId) {
      fetchDevelopmentData()
    }
  }, [selectedBebeId, selectedAgeRange])

  const fetchDashboardData = async () => {
    try {
      // Buscar contadores do dashboard
      const [bebesResponse, consultasResponse, medicosResponse] = await Promise.all([
        fetch('/api/bebes'),
        fetch('/api/consultas'),
        fetch('/api/medicos')
      ])

      if (bebesResponse.ok) {
        const bebesData = await bebesResponse.json()
        setBebesCount(bebesData.bebes?.length || 0)
      }

      if (consultasResponse.ok) {
        const consultasData = await consultasResponse.json()
        setConsultasCount(consultasData.consultas?.length || 0)
      }

      if (medicosResponse.ok) {
        const medicosData = await medicosResponse.json()
        setMedicosCount(medicosData.medicos?.length || 0)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
    }
  }

  const fetchBebes = async () => {
    try {
      const response = await fetch('/api/bebes')
      if (response.ok) {
        const data = await response.json()
        setBebes(data.bebes || [])
        
        // Selecionar o primeiro bebê por padrão
        if (data.bebes && data.bebes.length > 0 && !selectedBebeId) {
          setSelectedBebeId(data.bebes[0].id)
          setSelectedBebe(data.bebes[0])
        }
      }
    } catch (error) {
      console.error('Erro ao buscar bebês:', error)
    }
  }

  const fetchDevelopmentData = async () => {
    if (!selectedBebeId) return

    setLoadingCharts(true)
    try {
      const response = await fetch(`/api/desenvolvimento?bebe_id=${selectedBebeId}&min_age=${selectedAgeRange.minAge}&max_age=${selectedAgeRange.maxAge}`)
      if (response.ok) {
        const data = await response.json()
        setDevelopmentData(data.desenvolvimento || [])
        
        // Atualizar o bebê selecionado
        const currentBebe = bebes.find(b => b.id === selectedBebeId)
        if (currentBebe) {
          setSelectedBebe(currentBebe)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados de desenvolvimento:', error)
    } finally {
      setLoadingCharts(false)
    }
  }

  const handleBebeChange = (bebeId: string) => {
    setSelectedBebeId(bebeId)
    const bebe = bebes.find(b => b.id === bebeId)
    setSelectedBebe(bebe || null)
  }

  const handleAgeRangeChange = (range: AgeRange) => {
    setSelectedAgeRange(range)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      user={user!}
      title="Dashboard"
      subtitle="Acompanhe o desenvolvimento dos seus bebês"
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bebês</p>
                <p className="text-2xl font-bold text-gray-900">{bebesCount}</p>
              </div>
            </div>
            {bebesCount === 0 && (
              <Button 
                onClick={() => router.push('/bebes/novo')}
                className="mt-4 w-full bg-pequena-secundaria"
              >
                Cadastrar Primeiro Bebê
              </Button>
            )}
          </div>

          <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consultas</p>
                <p className="text-2xl font-bold text-gray-900">{consultasCount}</p>
              </div>
            </div>
            {consultasCount === 0 && (
              <Button 
                onClick={() => router.push('/consultas/nova')}
                className="mt-4 w-full bg-pequena-secundaria"
              >
                Agendar Primeira Consulta
              </Button>
            )}
          </div>

          <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Médicos</p>
                <p className="text-2xl font-bold text-gray-900">{medicosCount}</p>
              </div>
            </div>
            {medicosCount === 0 && (
              <Button 
                onClick={() => router.push('/medicos/novo')}
                className="mt-4 w-full bg-pequena-secundaria"
              >
                Cadastrar Primeiro Médico
              </Button>
            )}
          </div>
        </div>

        {/* Development Charts Section */}
        {bebes.length > 0 ? (
          <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <BebeSelector
                  bebes={bebes}
                  selectedBebeId={selectedBebeId}
                  onBebeChange={handleBebeChange}
                />
                <AgeRangeFilter
                  selectedRange={selectedAgeRange}
                  onRangeChange={handleAgeRangeChange}
                />
              </div>
              
              <Button
                onClick={() => router.push('/desenvolvimento/novo')}
                className="bg-pequena-secundaria"
              >
                Adicionar Medida
              </Button>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DevelopmentChart
                data={developmentData}
                type="peso"
                title={selectedBebe ? `Peso do ${selectedBebe.nome}` : "Peso"}
                color="#28C1AD"
                unit="kg"
                minAge={selectedAgeRange.minAge}
                maxAge={selectedAgeRange.maxAge}
              />
              
              <DevelopmentChart
                data={developmentData}
                type="comprimento"
                title={selectedBebe ? `Comprimento do ${selectedBebe.nome}` : "Comprimento"}
                color="#3B82F6"
                unit="cm"
                minAge={selectedAgeRange.minAge}
                maxAge={selectedAgeRange.maxAge}
              />
              
              <DevelopmentChart
                data={developmentData}
                type="imc"
                title={selectedBebe ? `IMC do ${selectedBebe.nome}` : "IMC"}
                color="#10B981"
                unit="kg/m²"
                minAge={selectedAgeRange.minAge}
                maxAge={selectedAgeRange.maxAge}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum bebê cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Cadastre seu primeiro bebê para começar a acompanhar o desenvolvimento.
            </p>
            <Button 
              onClick={() => router.push('/bebes/novo')}
              className="bg-pequena-secundaria"
            >
              Cadastrar Primeiro Bebê
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 