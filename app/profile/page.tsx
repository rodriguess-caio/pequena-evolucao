'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InputField } from '@/components/ui/InputField'
import { Button } from '@/components/ui/Button'
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/validations/auth'

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          reset({
            name: data.user.name || '',
            email: data.user.email || '',
          })
        } else {
          // Se não há usuário autenticado, redirecionar para login
          router.push('/')
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router, reset])

  const onSubmit = async (data: UpdateProfileFormData) => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setUser(result.user)
        setSuccess('Perfil atualizado com sucesso!')
        setIsEditing(false)
      } else {
        setError(result.error || 'Erro ao atualizar perfil')
      }
    } catch (err) {
      setError('Erro ao atualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        // Redirecionar para login após deletar conta
        router.push('/')
      } else {
        setError(result.error || 'Erro ao deletar conta')
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      setError('Erro ao deletar conta')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pequena-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-pequena-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Meu Perfil
              </h1>
              <p className="text-gray-600">
                Gerencie suas informações pessoais
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Voltar ao Dashboard
              </Button>

              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Informações Pessoais
                </h2>
                
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <InputField
                    label="Nome"
                    placeholder="Seu nome completo"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <InputField
                    label="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    error={errors.email?.message}
                    disabled // E-mail não pode ser editado
                    {...register('email')}
                  />

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      loading={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>

                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setError('')
                        setSuccess('')
                        reset({
                          name: user.name || '',
                          email: user.email || '',
                        })
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <p className="text-gray-800">{user.name || 'Não informado'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <p className="text-gray-800">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conta criada em
                    </label>
                    <p className="text-gray-800">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Última atualização
                    </label>
                    <p className="text-gray-800">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-pequena-background rounded-2xl shadow-lg border border-pequena-secundaria/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informações da Conta
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">ID do Usuário</p>
                  <p className="font-mono text-sm text-gray-800 break-all">{user.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-green-600 font-medium">Ativo</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-2xl shadow-lg border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                Zona de Perigo
              </h3>
              
              <p className="text-sm text-red-700 mb-4">
                Estas ações são irreversíveis. Tenha certeza antes de prosseguir.
              </p>

              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                Deletar Minha Conta
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Deletar Conta
                </h3>
                
                <p className="text-gray-600 text-sm mb-6">
                  Tem certeza que deseja deletar sua conta? Esta ação é irreversível e todos os seus dados serão perdidos permanentemente.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    loading={isDeleting}
                    onClick={handleDeleteAccount}
                    className="flex-1"
                  >
                    {isDeleting ? 'Deletando...' : 'Sim, Deletar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 