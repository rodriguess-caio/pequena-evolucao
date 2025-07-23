'use client'

interface Bebe {
  id: string
  nome: string
  data_nascimento: string
}

interface BebeSelectorProps {
  bebes: Bebe[]
  selectedBebeId: string | null
  onBebeChange: (bebeId: string) => void
}

export function BebeSelector({ bebes, selectedBebeId, onBebeChange }: BebeSelectorProps) {
  if (bebes.length === 0) {
    return (
      <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Selecionar Bebê
        </h3>
        <p className="text-gray-600 text-sm">
          Nenhum bebê cadastrado. Cadastre um bebê para ver os gráficos de desenvolvimento.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Selecionar Bebê
      </h3>
      <div className="flex gap-2 flex-wrap">
        {bebes.map((bebe) => (
          <button
            key={bebe.id}
            onClick={() => onBebeChange(bebe.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedBebeId === bebe.id
                ? 'bg-pequena-secundaria text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {bebe.nome}
          </button>
        ))}
      </div>
    </div>
  )
} 