'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { 
  Trophy, 
  Star, 
  Crown, 
  ChevronRight,
  Target
} from 'lucide-react'

export type AffiliateLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'

interface LevelConfig {
  id: AffiliateLevel
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  minReferrals: number
  benefits: string[]
}

const levelConfigs: Record<AffiliateLevel, LevelConfig> = {
  BASIC: {
    id: 'BASIC',
    name: 'Básico',
    icon: <Star className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    minReferrals: 0,
    benefits: ['Comisión 20%', 'Soporte básico', 'Material de capacitación']
  },
  INTERMEDIATE: {
    id: 'INTERMEDIATE',
    name: 'Intermedio',
    icon: <Trophy className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    minReferrals: 25,
    benefits: ['Comisión 30%', 'Soporte prioritario', 'Webinars exclusivos', 'Bonos mensuales']
  },
  ADVANCED: {
    id: 'ADVANCED',
    name: 'Avanzado',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    minReferrals: 50,
    benefits: ['Comisión 35%', 'Soporte VIP', 'Eventos exclusivos', 'Mentoría personalizada', 'Participación en ganancias']
  }
}

interface ProgressLevelProps {
  currentLevel: AffiliateLevel
  currentReferrals: number
  className?: string
}

export const ProgressLevel: React.FC<ProgressLevelProps> = ({
  currentLevel,
  currentReferrals,
  className
}) => {
  const getCurrentLevelConfig = () => levelConfigs[currentLevel]
  
  const getNextLevelConfig = (): LevelConfig | null => {
    const levels: AffiliateLevel[] = ['BASIC', 'INTERMEDIATE', 'ADVANCED']
    const currentIndex = levels.indexOf(currentLevel)
    return currentIndex < levels.length - 1 ? levelConfigs[levels[currentIndex + 1]] : null
  }

  const calculateProgress = (): number => {
    const nextLevel = getNextLevelConfig()
    if (!nextLevel) return 100 // Max level reached
    
    const currentConfig = getCurrentLevelConfig()
    const progressToNext = currentReferrals - currentConfig.minReferrals
    const totalNeeded = nextLevel.minReferrals - currentConfig.minReferrals
    
    return Math.min(Math.max((progressToNext / totalNeeded) * 100, 0), 100)
  }

  const getReferralsNeededForNext = (): number => {
    const nextLevel = getNextLevelConfig()
    return nextLevel ? Math.max(nextLevel.minReferrals - currentReferrals, 0) : 0
  }

  const currentConfig = getCurrentLevelConfig()
  const nextConfig = getNextLevelConfig()
  const progress = calculateProgress()
  const referralsNeeded = getReferralsNeededForNext()
  const isMaxLevel = !nextConfig

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Progreso de Nivel
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Level */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            currentConfig.bgColor,
            currentConfig.borderColor,
            'border-2'
          )}>
            <div className={currentConfig.color}>
              {currentConfig.icon}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              Nivel {currentConfig.name}
            </h3>
            <p className="text-sm text-gray-600">
              {currentReferrals} referidos • {currentConfig.benefits[0]}
            </p>
          </div>

          {!isMaxLevel && (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {!isMaxLevel && nextConfig && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Progreso hacia {nextConfig.name}
                </span>
                <span className="font-medium text-gray-900">
                  {Math.round(progress)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r',
                    nextConfig.id === 'INTERMEDIATE' 
                      ? 'from-blue-500 to-purple-500'
                      : 'from-purple-500 to-amber-500'
                  )}
                />
              </div>
              
              <p className="text-sm text-gray-600">
                {referralsNeeded > 0 
                  ? `${referralsNeeded} referidos más para el siguiente nivel`
                  : '¡Felicidades! Ya puedes avanzar al siguiente nivel'
                }
              </p>
            </div>

            {/* Next Level Preview */}
            <div className={cn(
              'p-4 rounded-lg border-2 border-dashed',
              nextConfig.borderColor,
              nextConfig.bgColor,
              'bg-opacity-30'
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  nextConfig.bgColor
                )}>
                  <div className={nextConfig.color}>
                    {nextConfig.icon}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Próximo: Nivel {nextConfig.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Requeridos: {nextConfig.minReferrals} referidos
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Beneficios del nivel {nextConfig.name}:
                </p>
                {nextConfig.benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      nextConfig.color.replace('text-', 'bg-')
                    )} />
                    <span className="text-xs text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {isMaxLevel && (
          <div className="text-center p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-amber-900 mb-1">
              ¡Nivel Máximo Alcanzado!
            </h3>
            <p className="text-sm text-amber-700">
              Has alcanzado el nivel más alto como afiliado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 