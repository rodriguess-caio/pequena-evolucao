'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { useEffect, useState } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface DevelopmentData {
  id: string
  data_medicao: string
  idade_meses: number
  peso_kg?: number
  comprimento_cm?: number
  imc?: number
  observacoes?: string
}

interface ReferenceData {
  idade_meses: number
  percentil_3: number
  percentil_10: number
  percentil_25: number
  percentil_50: number
  percentil_75: number
  percentil_90: number
  percentil_97: number
}

interface DevelopmentChartProps {
  data: DevelopmentData[]
  type: 'peso' | 'comprimento' | 'imc'
  title: string
  color: string
  unit: string
  minAge: number
  maxAge: number
}

export function DevelopmentChart({ data, type, title, color, unit, minAge, maxAge }: DevelopmentChartProps) {
  const [referenceData, setReferenceData] = useState<ReferenceData[]>([])

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const response = await fetch(
          `/api/referencia-medica?tipo=${type}&min_age=${minAge}&max_age=${maxAge}`
        )
        if (response.ok) {
          const result = await response.json()
          setReferenceData(result.referencia || [])
        }
      } catch (error) {
        console.error('Erro ao buscar dados de referência:', error)
      }
    }

    fetchReferenceData()
  }, [type, minAge, maxAge])

  // Filter out reference data - only show real user data
  const realData = data.filter(item => 
    item.observacoes !== 'Dados de referência - OMS' && 
    item.observacoes !== 'Dados padrão baseados em padrões médicos da OMS'
    // Include 'Peso do nascimento' as it's the only reference data we want to show
  ).sort((a, b) => {
    // Sort by date (most recent first) and then by ID as fallback
    const dateA = new Date(a.data_medicao).getTime()
    const dateB = new Date(b.data_medicao).getTime()
    if (dateA !== dateB) {
      return dateB - dateA // Most recent first
    }
    // If dates are equal, sort by ID to ensure consistent ordering
    return a.id.localeCompare(b.id)
  })

  // Get reference line labels based on type
  const getReferenceLabels = () => {
    switch (type) {
      case 'peso':
        return {
          percentil_97: 'Peso elevado para a idade',
          percentil_90: 'Peso adequado para a idade',
          percentil_50: 'Peso adequado para a idade',
          percentil_10: 'Baixo peso para a idade',
          percentil_3: 'Muito baixo peso para a idade'
        }
      case 'comprimento':
        return {
          percentil_97: 'Comprimento adequado',
          percentil_90: 'Comprimento adequado',
          percentil_50: 'Comprimento adequado',
          percentil_10: 'Baixo comprimento',
          percentil_3: 'Muito baixo comprimento'
        }
      case 'imc':
        return {
          percentil_97: 'Obesidade',
          percentil_90: 'Sobrepeso',
          percentil_75: 'Risco de sobrepeso',
          percentil_50: 'Eutrofia (normal)',
          percentil_25: 'Eutrofia (normal)',
          percentil_10: 'Magreza',
          percentil_3: 'Magreza acentuada'
        }
      default:
        return {}
    }
  }

  const referenceLabels = getReferenceLabels()

  // Create datasets for reference lines
  const createReferenceDatasets = () => {
    const datasets = []
    
    // Add reference lines based on type
    if (type === 'imc') {
      // IMC has more reference lines
      if (referenceData.length > 0) {
        datasets.push(
          {
            label: referenceLabels.percentil_97 || 'Obesidade',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_97
            })),
            borderColor: '#FF0000',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_90 || 'Sobrepeso',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_90
            })),
            borderColor: '#FF6B6B',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_75 || 'Risco de sobrepeso',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_75
            })),
            borderColor: '#FFB366',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_50 || 'Eutrofia (normal)',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_50
            })),
            borderColor: '#000000',
            backgroundColor: 'transparent',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_25 || 'Eutrofia (normal)',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_25
            })),
            borderColor: '#90EE90',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_10 || 'Magreza',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_10
            })),
            borderColor: '#FFD700',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_3 || 'Magreza acentuada',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_3
            })),
            borderColor: '#FFA500',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          }
        )
      }
    } else {
      // Peso and Comprimento have fewer reference lines
      if (referenceData.length > 0) {
        datasets.push(
          {
            label: referenceLabels.percentil_97 || 'Elevado',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_97
            })),
            borderColor: '#FF0000',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_90 || 'Adequado',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_90
            })),
            borderColor: '#4CAF50',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_50 || 'Mediana',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_50
            })),
            borderColor: '#000000',
            backgroundColor: 'transparent',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_10 || 'Baixo',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_10
            })),
            borderColor: '#FFD700',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: referenceLabels.percentil_3 || 'Muito baixo',
            data: referenceData.map(item => ({
              x: item.idade_meses,
              y: item.percentil_3
            })),
            borderColor: '#FFA500',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          }
        )
      }
    }

    return datasets
  }

  const chartData = {
    datasets: [
      // Reference lines first (so they appear behind the baby data)
      ...createReferenceDatasets(),
      // Baby data as connected line with points
      {
        label: title, // Remove values from legend, keep only the dynamic title
        data: realData.map(item => ({
          x: item.idade_meses,
          y: (() => {
            switch (type) {
              case 'peso':
                return item.peso_kg
              case 'comprimento':
                return item.comprimento_cm
              case 'imc':
                return item.imc
              default:
                return 0
            }
          })()
        })).filter(point => point.y !== null && point.y !== undefined),
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 10,
        showLine: true, // Show connecting line
        borderDash: [8, 4], // Dashed line
        pointStyle: 'circle'
      }
    ]
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          filter: function(legendItem, data) {
            // Show legend for baby data and main reference lines
            const label = legendItem.text
            if (label.includes(title)) return true
            if (type === 'imc') {
              return ['Obesidade', 'Sobrepeso', 'Eutrofia (normal)', 'Magreza'].includes(label)
            } else {
              return ['Elevado', 'Adequado', 'Mediana', 'Baixo', 'Muito baixo'].includes(label)
            }
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} ${unit}`
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 24,
        title: {
          display: true,
          text: 'Idade (meses)'
        },
        ticks: {
          stepSize: 2,
          callback: function(value) {
            return value + ' meses'
          }
        },
        grid: {
          display: true,
          color: '#f0f0f0'
        }
      },
      y: {
        title: {
          display: true,
          text: `${title} (${unit})`
        },
        grid: {
          display: true,
          color: '#f0f0f0'
        },
        beginAtZero: false
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    }
  }

  return (
    <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
} 