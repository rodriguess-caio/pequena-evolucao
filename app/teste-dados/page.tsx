'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface DevelopmentData {
  id: string
  data_medicao: string
  idade_meses: number
  peso_kg?: number
  comprimento_cm?: number
  imc?: number
  observacoes?: string
}

export default function TesteDadosPage() {
  const [developmentData, setDevelopmentData] = useState<DevelopmentData[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Mock bebê ID for testing - replace with actual bebê ID from your database
  const bebeId = '550e8400-e29b-41d4-a716-446655440000' // Replace with actual ID

  useEffect(() => {
    fetchDevelopmentData()
  }, [])

  const fetchDevelopmentData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/desenvolvimento?bebe_id=${bebeId}`)
      if (response.ok) {
        const data = await response.json()
        setDevelopmentData(data.desenvolvimento || [])
        setMessage(`Dados carregados: ${data.desenvolvimento?.length || 0} registros`)
      } else {
        setMessage('Erro ao carregar dados')
      }
    } catch (error) {
      console.error('Erro:', error)
      setMessage('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const insertTestData = async () => {
    setLoading(true)
    try {
      const testData = {
        bebe_id: bebeId,
        data_medicao: new Date().toISOString().split('T')[0],
        peso_kg: 7.5,
        comprimento_cm: 68,
        observacoes: 'Dados de teste inseridos manualmente'
      }

      const response = await fetch('/api/desenvolvimento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      if (response.ok) {
        setMessage('Dados de teste inseridos com sucesso!')
        fetchDevelopmentData() // Reload data
      } else {
        const error = await response.json()
        setMessage(`Erro ao inserir dados: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      setMessage('Erro ao inserir dados')
    } finally {
      setLoading(false)
    }
  }

  const insertMultipleTestData = async () => {
    setLoading(true)
    try {
      // Array of test data points to simulate development over time
      const testDataPoints = [
        {
          data_medicao: '2024-01-15',
          peso_kg: 3.2,
          comprimento_cm: 50,
          observacoes: 'Peso do nascimento'
        },
        {
          data_medicao: '2024-02-15',
          peso_kg: 4.1,
          comprimento_cm: 54,
          observacoes: '1 mês - Controle pediátrico'
        },
        {
          data_medicao: '2024-03-15',
          peso_kg: 5.0,
          comprimento_cm: 57.5,
          observacoes: '2 meses - Vacinação'
        },
        {
          data_medicao: '2024-04-15',
          peso_kg: 5.8,
          comprimento_cm: 60.5,
          observacoes: '3 meses - Controle de desenvolvimento'
        },
        {
          data_medicao: '2024-05-15',
          peso_kg: 6.4,
          comprimento_cm: 63,
          observacoes: '4 meses - Consulta de rotina'
        },
        {
          data_medicao: '2024-06-15',
          peso_kg: 7.0,
          comprimento_cm: 65.5,
          observacoes: '5 meses - Controle pediátrico'
        }
      ]

      let successCount = 0
      let errorCount = 0

      for (const testData of testDataPoints) {
        try {
          const response = await fetch('/api/desenvolvimento', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bebe_id: bebeId,
              ...testData
            })
          })

          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }

      setMessage(`Inserção concluída: ${successCount} sucessos, ${errorCount} erros`)
      fetchDevelopmentData() // Reload data
    } catch (error) {
      console.error('Erro:', error)
      setMessage('Erro ao inserir dados múltiplos')
    } finally {
      setLoading(false)
    }
  }

  const clearTestData = async () => {
    setLoading(true)
    try {
      // This would require a DELETE endpoint, but for now we'll just reload
      setMessage('Dados de teste removidos (recarregue a página)')
      fetchDevelopmentData()
    } catch (error) {
      console.error('Erro:', error)
      setMessage('Erro ao limpar dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pequena-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Teste de Dados de Desenvolvimento - Linha Pontilhada
        </h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Controles de Teste
          </h2>
          
          <div className="flex gap-4 mb-4 flex-wrap">
            <Button
              onClick={fetchDevelopmentData}
              disabled={loading}
              className="bg-pequena-secundaria text-white hover:bg-pequena-secundaria/90"
            >
              {loading ? 'Carregando...' : 'Carregar Dados'}
            </Button>
            
            <Button
              onClick={insertTestData}
              disabled={loading}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Inserir 1 Dado de Teste
            </Button>

            <Button
              onClick={insertMultipleTestData}
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Inserir Múltiplos Dados (6 pontos)
            </Button>
            
            <Button
              onClick={clearTestData}
              disabled={loading}
              variant="outline"
            >
              Limpar Dados de Teste
            </Button>
          </div>

          {message && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">{message}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Dados de Desenvolvimento ({developmentData.filter(d => d.observacoes !== 'Dados de referência - OMS').length} registros reais)
          </h2>
          
          {developmentData.length === 0 ? (
            <p className="text-gray-600">Nenhum dado encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Idade (meses)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peso (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comprimento (cm)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IMC (kg/m²)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {developmentData
                    .filter(data => data.observacoes !== 'Dados de referência - OMS')
                    .sort((a, b) => new Date(a.data_medicao).getTime() - new Date(b.data_medicao).getTime())
                    .map((data) => (
                    <tr key={data.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(data.data_medicao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.idade_meses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.peso_kg || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.comprimento_cm || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.imc || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.observacoes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Como Funciona a Linha Pontilhada
          </h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Bebê ID para Teste:</h3>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {bebeId}
              </code>
              <p className="mt-1">Substitua este ID pelo ID real de um bebê no seu banco de dados.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Como Testar a Linha Pontilhada:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Substitua o bebeId acima pelo ID real de um bebê</li>
                <li>Clique em "Inserir Múltiplos Dados (6 pontos)" para criar uma linha de evolução</li>
                <li>Vá para o dashboard e selecione o bebê</li>
                <li>Verifique se a linha pontilhada conecta todos os pontos de desenvolvimento</li>
                <li>Adicione mais pontos usando "Inserir 1 Dado de Teste"</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Características da Linha Pontilhada:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Estilo:</strong> Linha tracejada (borderDash: [8, 4])</li>
                <li><strong>Cor:</strong> Cor específica do gráfico (peso: verde, comprimento: laranja, IMC: vermelho)</li>
                <li><strong>Pontos:</strong> Círculos destacados em cada medição</li>
                <li><strong>Eixo X:</strong> Idade em meses (0-24)</li>
                <li><strong>Eixo Y:</strong> Valor da medição (peso, comprimento, IMC)</li>
                <li><strong>Legenda:</strong> Mostra o valor mais recente do bebê</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Dados de Teste Múltiplos:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>0 meses:</strong> 3.2 kg, 50 cm (nascimento)</li>
                <li><strong>1 mês:</strong> 4.1 kg, 54 cm</li>
                <li><strong>2 meses:</strong> 5.0 kg, 57.5 cm</li>
                <li><strong>3 meses:</strong> 5.8 kg, 60.5 cm</li>
                <li><strong>4 meses:</strong> 6.4 kg, 63 cm</li>
                <li><strong>5 meses:</strong> 7.0 kg, 65.5 cm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 