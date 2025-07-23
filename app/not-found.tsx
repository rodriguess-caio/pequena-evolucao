export default function NotFound() {
  return (
    <div className="min-h-screen bg-pequena-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-pequena-secundaria text-white rounded-lg hover:bg-pequena-secundaria/90"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  )
} 