'use client'

interface AgeRange {
  label: string
  minAge: number
  maxAge: number
}

interface AgeRangeFilterProps {
  selectedRange: AgeRange
  onRangeChange: (range: AgeRange) => void
}

const ageRanges: AgeRange[] = [
  { label: '0-2 anos', minAge: 0, maxAge: 24 },
  { label: '2-5 anos', minAge: 24, maxAge: 60 },
  { label: '5-10 anos', minAge: 60, maxAge: 120 }
]

export function AgeRangeFilter({ selectedRange, onRangeChange }: AgeRangeFilterProps) {
  return (
    <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Faixa Etária
      </h3>
      <div className="flex gap-2">
        {ageRanges.map((range) => (
          <button
            key={range.label}
            onClick={() => onRangeChange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedRange.label === range.label
                ? 'bg-pequena-secundaria text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  )
} 