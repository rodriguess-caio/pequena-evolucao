/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'supabase.co'],
  },
  // Otimizações para reduzir avisos de build
  experimental: {
    // Desabilitar warnings sobre uso de cookies em páginas estáticas
    // já que estamos usando autenticação que requer cookies
    serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs'],
  },
  // Configurações de build
  swcMinify: true,
  // Reduzir warnings sobre renderização dinâmica
  typescript: {
    // Ignorar erros de TypeScript durante o build (opcional)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignorar erros de ESLint durante o build (opcional)
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 