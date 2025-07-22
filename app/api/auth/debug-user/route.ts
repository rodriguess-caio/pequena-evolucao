import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Try to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({
        error: 'Auth Error',
        message: authError.message,
        details: authError
      }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({
        error: 'No User',
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Check user status
    const userInfo = {
      id: authData.user.id,
      email: authData.user.email,
      email_confirmed_at: authData.user.email_confirmed_at,
      created_at: authData.user.created_at,
      user_metadata: authData.user.user_metadata
    }

    // Try to get profile
    let profileInfo = null
    let profileError = null
    
    try {
      const { data: profile, error: profileErr } = await supabase.rpc('get_user_profile')
      profileInfo = profile
      profileError = profileErr
    } catch (err) {
      profileError = err
    }

    // Check if profile exists in database directly
    let directProfileCheck = null
    try {
      const { data: directProfile, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      directProfileCheck = { data: directProfile, error: directError }
    } catch (err) {
      directProfileCheck = { error: err }
    }

    // Sign out after debug
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      user: userInfo,
      profile: {
        function_result: profileInfo,
        function_error: profileError,
        direct_check: directProfileCheck
      },
      session: authData.session ? 'Session created' : 'No session'
    })

  } catch (error) {
    console.error('Debug error:', error)
    
    return NextResponse.json({
      error: 'Debug Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
} 