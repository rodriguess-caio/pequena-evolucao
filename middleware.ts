import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Proteger rotas autenticadas
  const protectedRoutes = ['/profile', '/bebes', '/exames']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirecionar usuários logados apenas da página de login
  // Permitir acesso a registro e recuperação de senha mesmo logado
  if ((req.nextUrl.pathname === '/auth/login' || req.nextUrl.pathname === '/') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 