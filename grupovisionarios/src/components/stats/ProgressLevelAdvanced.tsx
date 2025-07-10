"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Target } from 'lucide-react'
import { Level, PromotionEvaluation } from '@/types'
import { LevelDisplay } from '@/components/ui/LevelDisplay'
import { cn } from '@/lib/utils'

interface ProgressLevelAdvancedProps {
  currentLevel: Level
  nextLevel?: Level
  evaluation: PromotionEvaluation
  className?: string
}

export const ProgressLevelAdvanced: React.FC<ProgressLevelAdvancedProps> = ({
  currentLevel,
  nextLevel,
  evaluation,
  className,
}) => {
  // Progress calculation: 50% direct referrals, 50% structure 3x3
  const progress = React.useMemo(() => {
    if (evaluation.canPromote) return 100
    const directP = Math.min(evaluation.directReferrals / 3, 1) * 50
    const structP = Math.min(evaluation.validSecondLevelReferrals / 3, 1) * 50
    return Math.round(directP + structP)
  }, [evaluation])

  const referralsNeeded = React.useMemo(() => {
    const missingDirect = Math.max(3 - evaluation.directReferrals, 0)
    const missingStruct = Math.max(3 - evaluation.validSecondLevelReferrals, 0)
    return { missingDirect, missingStruct }
  }, [evaluation])

  const isMax = !nextLevel

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" /> Progreso de Nivel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nivel Actual */}
        <div className="flex items-center gap-4">
          <LevelDisplay level={currentLevel} variant="badge" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{currentLevel.name}</h3>
            <p className="text-sm text-gray-600">
              {evaluation.directReferrals} referidos directos • Comisión {(
                currentLevel.commissionRate * 100
              ).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        {!isMax && nextLevel && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Progreso hacia {nextLevel.name}
                </span>
                <span className="font-medium text-gray-900">{progress}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>

              <p className="text-sm text-gray-600">
                {evaluation.canPromote
                  ? '¡Felicidades! Ya puedes ascender al siguiente nivel.'
                  : `${referralsNeeded.missingDirect + referralsNeeded.missingStruct > 0 ? `${referralsNeeded.missingDirect + referralsNeeded.missingStruct} requisitos pendientes` : ''}`}
              </p>
            </div>

            {/* Vista previa del próximo nivel */}
            <div className="p-4 rounded-lg border-2 border-dashed bg-purple-50 bg-opacity-40">
              <LevelDisplay level={nextLevel} variant="minimal" />
              <p className="text-xs text-gray-600 mt-2">
                Requisitos: 3 directos + 3 estructuras 3x3 completas
              </p>
            </div>
          </>
        )}

        {isMax && (
          <div className="text-center p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
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