'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from './Button'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CopyButtonProps {
  text: string
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  successMessage?: string
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className,
  variant = 'outline',
  size = 'sm',
  showText = true,
  successMessage = '¡Copiado al portapapeles!'
}) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast.success(successMessage)
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
      toast.error('Error al copiar el texto')
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={cn('transition-all duration-200', className)}
    >
      {isCopied ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      {showText && (
        <span className="ml-2">
          {isCopied ? 'Copiado' : 'Copiar'}
        </span>
      )}
    </Button>
  )
}

// Copy input component with button integrated
interface CopyInputProps {
  value: string
  label?: string
  placeholder?: string
  className?: string
  readOnly?: boolean
}

const CopyInput: React.FC<CopyInputProps> = ({
  value,
  label,
  placeholder = 'Enlace generado',
  className,
  readOnly = true
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            'flex-1 px-3 py-2 border border-gray-300 rounded-lg',
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'bg-gray-50 text-gray-900 text-sm',
            readOnly && 'cursor-default'
          )}
        />
        <CopyButton
          text={value}
          showText={false}
          variant="outline"
          size="md"
        />
      </div>
    </div>
  )
}

// Copy card component for displaying links with titles
interface CopyCardProps {
  title: string
  description?: string
  url: string
  icon?: React.ReactNode
  className?: string
}

const CopyCard: React.FC<CopyCardProps> = ({
  title,
  description,
  url,
  icon,
  className
}) => {
  return (
    <div className={cn(
      'border border-gray-200 rounded-lg p-4 space-y-3',
      'hover:border-gray-300 transition-colors',
      className
    )}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
      
      <CopyInput
        value={url}
        placeholder="URL generada"
      />
    </div>
  )
}

export { CopyButton, CopyInput, CopyCard } 