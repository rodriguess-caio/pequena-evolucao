import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { updateProfileSchema } from '@/lib/validations/auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Get user profile data - simplified approach without functions
    let profile = null

    try {
      // Try to get the profile directly
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError)

        // If profile doesn't exist, create it manually
        if (profileError.code === 'PGRST116') {
          console.log('Criando perfil para usuário:', user.id)

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: user.user_metadata?.name || 'Usuário',
              email: user.email || ''
            })
            .select()
            .single()

          if (createError) {
            console.error('Erro ao criar perfil:', createError)
            // Don't fail the login, just continue without profile
          } else {
            profile = newProfile
            console.log('Perfil criado com sucesso')
          }
        }
      } else {
        profile = profileData
        console.log('Perfil encontrado')
      }
    } catch (err) {
      console.error('Erro geral ao buscar/criar perfil:', err)
      // Don't fail the login, just continue without profile
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name,
        avatar_url: profile?.avatar_url,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at,
      }
    })

  } catch (error) {
    console.error('Erro ao buscar perfil:', error)

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = updateProfileSchema.parse(body)
    
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Update user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        name: validatedData.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (profileError) {
      console.error('Erro ao atualizar perfil:', profileError)
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: profile.name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }
    })

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Delete user profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Erro ao deletar perfil:', profileError)
      return NextResponse.json(
        { error: 'Erro ao deletar perfil' },
        { status: 400 }
      )
    }

    // Delete user account from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

    if (authError) {
      console.error('Erro ao deletar usuário:', authError)
      return NextResponse.json(
        { error: 'Erro ao deletar conta' },
        { status: 400 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({
      message: 'Conta deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar conta:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 