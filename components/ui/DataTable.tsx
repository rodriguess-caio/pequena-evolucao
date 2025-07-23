'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { Button } from './Button'

interface Column {
  key: string
  label: string
  render?: (value: any, item: any) => ReactNode
  className?: string
}

interface Action {
  label: string
  onClick: (item: any) => void
  icon?: ReactNode
  variant?: 'default' | 'destructive'
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  actions?: Action[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: ReactNode
  emptyAction?: {
    label: string
    onClick: () => void
  }
}

function OptionsMenu({ item, actions, onEdit, onDelete, onView }: {
  item: any
  actions?: Action[]
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'right' | 'left'>('right')
  const [verticalPosition, setVerticalPosition] = useState<'bottom' | 'top'>('bottom')
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const menuWidth = 192 // w-48 = 12rem = 192px
      const menuHeight = 200 // altura aproximada do menu
      
      // Verificar posição horizontal
      if (rect.right + menuWidth > windowWidth - 20) { // 20px de margem
        setPosition('left')
      } else {
        setPosition('right')
      }
      
      // Verificar posição vertical
      if (rect.bottom + menuHeight > windowHeight - 20) { // 20px de margem
        setVerticalPosition('top')
      } else {
        setVerticalPosition('bottom')
      }
    }
    setIsOpen(!isOpen)
  }

  // Calcular posição do dropdown
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { left: 0, top: 0 }
    
    const rect = buttonRef.current.getBoundingClientRect()
    const menuWidth = 192
    const menuHeight = 200
    
    let left = 0
    let top = 0
    
    if (position === 'right') {
      left = rect.right
    } else {
      left = rect.left - menuWidth
    }
    
    if (verticalPosition === 'bottom') {
      top = rect.bottom + 8
    } else {
      top = rect.top - menuHeight - 8
    }
    
    // Garantir que não saia da tela
    if (left < 20) left = 20
    if (left + menuWidth > window.innerWidth - 20) left = window.innerWidth - menuWidth - 20
    if (top < 20) top = 20
    if (top + menuHeight > window.innerHeight - 20) top = window.innerHeight - menuHeight - 20
    
    return { left, top }
  }

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] min-w-max"
          style={getDropdownPosition()}
        >
          {onView && (
            <button
              onClick={() => handleAction(() => onView(item))}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => handleAction(() => onEdit(item))}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          )}

          {actions?.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(() => action.onClick(item))}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                action.variant === 'destructive'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}

          {onDelete && (
            <>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => handleAction(() => onDelete(item))}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Deletar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  actions,
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  emptyIcon,
  emptyAction
}: DataTableProps) {
  if (loading) {
    return (
      <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pequena-secundaria mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        {emptyIcon && (
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {emptyIcon}
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {emptyMessage}
        </h3>
        
        {emptyAction && (
          <Button onClick={emptyAction.onClick} className="mt-4">
            {emptyAction.label}
          </Button>
        )}
      </div>
    )
  }

  const hasActions = onEdit || onDelete || onView || actions

  return (
    <div className="bg-pequena-background rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-pequena-background border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {hasActions && (
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-pequena-background divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-white/50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(item[column.key], item)
                      : item[column.key]
                    }
                  </td>
                ))}
                {hasActions && (
                  <td className="px-6 py-4 text-center text-sm font-medium w-16">
                    <OptionsMenu
                      item={item}
                      actions={actions}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 