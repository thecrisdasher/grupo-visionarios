'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Clock, 
  DollarSign,
  TrendingUp,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export interface Referral {
  id: string
  name: string
  email: string
  joinDate: Date | string
  status: 'active' | 'pending' | 'inactive'
  level: number
  totalEarnings: number
  lastActivity?: Date | string
  avatar?: string
}

interface RecentReferralsListProps {
  referrals: Referral[]
  maxItems?: number
  className?: string
  showViewAll?: boolean
  onViewAll?: () => void
}

export const RecentReferralsList: React.FC<RecentReferralsListProps> = ({
  referrals,
  maxItems = 5,
  className,
  showViewAll = true,
  onViewAll
}) => {
  const displayReferrals = referrals.slice(0, maxItems)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(dateObj)
  }

  const getTimeAgo = (date: Date | string) => {
    const now = new Date()
    const dateObj = date instanceof Date ? date : new Date(date)
    const diffInMs = now.getTime() - dateObj.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    if (diffInDays < 30) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
    
    return formatDate(date)
  }

  const getStatusConfig = (status: Referral['status']) => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Activo'
        }
      case 'pending':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Pendiente'
        }
      case 'inactive':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Inactivo'
        }
    }
  }

  const getLevelColor = (level: number) => {
    if (level === 1) return 'text-blue-600 bg-blue-100'
    if (level === 2) return 'text-purple-600 bg-purple-100'
    return 'text-amber-600 bg-amber-100'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Referidos Recientes
          </CardTitle>
          {showViewAll && referrals.length > maxItems && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-blue-600 hover:text-blue-700"
            >
              Ver todos
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {displayReferrals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay referidos aún
            </h3>
            <p className="text-gray-600 text-sm">
              Comienza a invitar personas para construir tu red
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayReferrals.map((referral, index) => {
              const statusConfig = getStatusConfig(referral.status)
              const levelColor = getLevelColor(referral.level)
              
              return (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border border-gray-200',
                    'hover:border-gray-300 hover:shadow-sm transition-all duration-200'
                  )}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {referral.avatar ? (
                      <img
                        src={referral.avatar}
                        alt={referral.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {getInitials(referral.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {referral.name}
                      </h4>
                      
                      {/* Nivel */}
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        levelColor
                      )}>
                        Nivel {referral.level}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getTimeAgo(referral.joinDate)}
                      </span>
                      
                      {referral.totalEarnings > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(referral.totalEarnings)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                      statusConfig.color,
                      statusConfig.bgColor
                    )}>
                      {statusConfig.icon}
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Footer Stats */}
        {displayReferrals.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {referrals.filter(r => r.status === 'active').length}
                </div>
                <div className="text-xs text-gray-600">Activos</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {referrals.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-600">Pendientes</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    referrals.reduce((sum, r) => sum + r.totalEarnings, 0)
                  )}
                </div>
                <div className="text-xs text-gray-600">Total Generado</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para mostrar el detalle rápido de un referido
interface ReferralQuickViewProps {
  referral: Referral
  onClose: () => void
  className?: string
}

export const ReferralQuickView: React.FC<ReferralQuickViewProps> = ({
  referral,
  onClose,
  className
}) => {
  const statusConfig = getStatusConfig(referral.status)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  }

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg p-6 space-y-4',
      className
    )}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Detalle del Referido
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Nombre</label>
          <p className="text-gray-900">{referral.name}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-gray-900">{referral.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <div className={cn(
              'flex items-center gap-1 mt-1',
              statusConfig.color
            )}>
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Nivel</label>
            <p className="text-gray-900">Nivel {referral.level}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Fecha de Ingreso</label>
          <p className="text-gray-900">{formatDate(referral.joinDate)}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Total Generado</label>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(referral.totalEarnings)}
          </p>
        </div>

        {referral.lastActivity && (
          <div>
            <label className="text-sm font-medium text-gray-500">Última Actividad</label>
            <p className="text-gray-900">{formatDate(referral.lastActivity)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const getStatusConfig = (status: Referral['status']) => {
  switch (status) {
    case 'active':
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Activo'
      }
    case 'pending':
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Pendiente'
      }
    case 'inactive':
      return {
        icon: <XCircle className="w-4 h-4" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        label: 'Inactivo'
      }
  }
} 