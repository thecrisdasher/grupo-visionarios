'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Level, PromotionEvaluation } from '@/types'
import { Crown, Star, Trophy, Award } from 'lucide-react'

// Allow LevelDisplay to accept either full Level objects or database level structure
export type LevelLike = Level | {
  id: string
  name: string
  order: number
  color: string
  icon: string | null
  commissionRate?: number
  requirements?: {
    referrals: number
    earnings: number
  }
  requirementsDescription?: string
}

interface LevelDisplayProps {
  level: LevelLike
  evaluation?: PromotionEvaluation
  showIcon?: boolean
  showName?: boolean
  showProgress?: boolean
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'card' | 'badge' | 'minimal'
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({
  level,
  evaluation,
  showIcon = true,
  showName = true,
  showProgress = false,
  showDescription = false,
  size = 'md',
  className,
  variant = 'card'
}) => {
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!evaluation) return 0
    if (evaluation.canPromote) return 100

    let progress = 0
    // Direct referrals progress (50% weight)
    const directProgress = Math.min(evaluation.directReferrals / 3, 1) * 50
    progress += directProgress

    // Valid structure progress (50% weight)  
    const structureProgress = Math.min(evaluation.validSecondLevelReferrals / 3, 1) * 50
    progress += structureProgress

    return Math.round(progress)
  }

  const progress = calculateProgress()

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-2',
      icon: 'text-lg',
      title: 'text-sm font-medium',
      description: 'text-xs',
      progressHeight: 'h-1.5'
    },
    md: {
      container: 'p-3',
      icon: 'text-xl',
      title: 'text-base font-semibold',
      description: 'text-sm',
      progressHeight: 'h-2'
    },
    lg: {
      container: 'p-4',
      icon: 'text-2xl',
      title: 'text-lg font-bold',
      description: 'text-base',
      progressHeight: 'h-2.5'
    },
    xl: {
      container: 'p-6',
      icon: 'text-3xl',
      title: 'text-xl font-bold',
      description: 'text-lg',
      progressHeight: 'h-3'
    }
  }

  const config = sizeConfig[size]

  // Get icon based on level order
  const getIconComponent = () => {
    const iconMap: Record<number, any> = {
      1: '👁️', // Visionario
      2: '🎓', // Mentor  
      3: '🧭', // Guía
      4: '🏅', // Master
      5: '⚔️', // Guerrero
      6: '🛡️', // Gladiador
      7: '👑', // Líder
      8: '🥇', // Oro
      9: '🥈', // Platino
      10: '👑', // Corona
      11: '💎', // Diamante
      12: '🦅'  // Águila Real
    }
    
    return iconMap[level.order] || '🏆'
  }

  // Variant styles
  if (variant === 'badge') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
          'text-white font-medium shadow-sm',
          className
        )}
        style={{ 
          backgroundColor: level.color,
          borderColor: level.color
        }}
      >
        {showIcon && (
          <span className={config.icon}>
            {level.icon || getIconComponent()}
          </span>
        )}
        {showName && (
          <span className={config.title}>
            {level.name}
          </span>
        )}
      </motion.div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showIcon && (
          <span 
            className={cn('flex items-center justify-center rounded-full', config.icon)}
            style={{ color: level.color }}
          >
            {level.icon || getIconComponent()}
          </span>
        )}
        {showName && (
          <span className={cn(config.title)} style={{ color: level.color }}>
            {level.name}
          </span>
        )}
      </div>
    )
  }

  // Card variant (default)
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-xl border shadow-lg',
        'bg-gradient-to-br from-white to-gray-50',
        config.container,
        className
      )}
      style={{ 
        borderColor: level.color,
        boxShadow: `0 4px 20px ${level.color}20`
      }}
    >
      {/* Header with icon and name */}
      <div className="flex items-center gap-3 mb-2">
        {showIcon && (
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className={cn(
              'flex items-center justify-center rounded-full p-2',
              'shadow-md border-2'
            )}
            style={{ 
              backgroundColor: `${level.color}15`,
              borderColor: level.color,
              color: level.color
            }}
          >
            <span className={config.icon}>
              {level.icon || getIconComponent()}
            </span>
          </motion.div>
        )}
        
        <div className="flex-1">
          {showName && (
            <h3 className={cn(config.title)} style={{ color: level.color }}>
              {level.name}
            </h3>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Nivel {level.order}</span>
            <span>•</span>
            <span>{(((level.commissionRate ?? 0) * 100).toFixed(0))}% comisión</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {showDescription && level.requirementsDescription && (
        <p className={cn(config.description, 'text-gray-600 mb-3')}>
          {level.requirementsDescription}
        </p>
      )}

      {/* Progress section */}
      {showProgress && evaluation && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700">
              Progreso al siguiente nivel
            </span>
            <span className="text-xs font-bold" style={{ color: level.color }}>
              {progress}%
            </span>
          </div>
          
          <div className={cn('w-full bg-gray-200 rounded-full', config.progressHeight)}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn('rounded-full', config.progressHeight)}
              style={{ backgroundColor: level.color }}
            />
          </div>

          {/* Requirements breakdown */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Referidos directos</div>
              <div className="font-bold text-sm">
                {evaluation.directReferrals}/3
              </div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Estructura 3x3</div>
              <div className="font-bold text-sm">
                {evaluation.validSecondLevelReferrals}/3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement badge for completed levels */}
      {evaluation?.canPromote && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute top-2 right-2"
        >
          <div className="bg-green-500 text-white rounded-full p-1">
            <Trophy className="w-4 h-4" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Compact level indicator for headers/navigation
export const LevelIndicator: React.FC<{
  level: LevelLike
  className?: string
}> = ({ level, className }) => {
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
        'border shadow-sm',
        className
      )}
      style={{ 
        backgroundColor: `${level.color}10`,
        borderColor: `${level.color}40`,
        color: level.color
      }}
    >
      <span>{level.icon || '🏆'}</span>
      <span>{level.name}</span>
    </div>
  )
}

// Level comparison component
export const LevelComparison: React.FC<{
  currentLevel: Level
  nextLevel?: Level
  className?: string
}> = ({ currentLevel, nextLevel, className }) => {
  if (!nextLevel) {
    return (
      <div className={cn('text-center p-4', className)}>
        <div className="text-2xl mb-2">🎉</div>
        <div className="font-bold text-lg text-gray-800">
          ¡Nivel máximo alcanzado!
        </div>
        <div className="text-sm text-gray-600">
          Has llegado al nivel más alto del sistema
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-between p-4 bg-gray-50 rounded-lg', className)}>
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-1">Nivel actual</div>
        <LevelIndicator level={currentLevel} />
      </div>
      
      <div className="flex-1 mx-4">
        <div className="flex items-center justify-center">
          <div className="flex-1 h-px bg-gray-300"></div>
          <div className="mx-2 text-gray-400">→</div>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-1">Siguiente nivel</div>
        <LevelIndicator level={nextLevel} />
      </div>
    </div>
  )
} 