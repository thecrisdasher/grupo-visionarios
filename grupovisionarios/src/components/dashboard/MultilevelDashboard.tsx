'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { LevelDisplay, LevelComparison } from '@/components/ui/LevelDisplay'
import { ReferralTree } from '@/components/ui/ReferralTree'
import { 
  Level, 
  UserReferralStructure, 
  PromotionEvaluation,
  User,
  PromotionApiResponse 
} from '@/types'
import { 
  Users, 
  DollarSign,
  TrendingUp,
  Award,
  Crown,
  Star,
  Zap,
  Target,
  ArrowUp,
  Calendar,
  Gift
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MultilevelDashboardProps {
  user: User
  currentLevel: Level
  nextLevel?: Level
  evaluation: PromotionEvaluation
  structure: UserReferralStructure
  recentPromotions?: any[]
  className?: string
}

export const MultilevelDashboard: React.FC<MultilevelDashboardProps> = ({
  user,
  currentLevel,
  nextLevel,
  evaluation,
  structure,
  recentPromotions = [],
  className
}) => {
  const [isPromoting, setIsPromoting] = useState(false)
  const [selectedNode, setSelectedNode] = useState<UserReferralStructure | null>(null)

  // Calculate progress percentage
  const progressPercentage = React.useMemo(() => {
    if (evaluation.canPromote) return 100
    
    let progress = 0
    const directProgress = Math.min(evaluation.directReferrals / 3, 1) * 50
    progress += directProgress
    
    const structureProgress = Math.min(evaluation.validSecondLevelReferrals / 3, 1) * 50
    progress += structureProgress
    
    return Math.round(progress)
  }, [evaluation])

  // Handle promotion request
  const handlePromotionRequest = async () => {
    if (!evaluation.canPromote) {
      toast.error('No cumples los requisitos para ascender')
      return
    }

    setIsPromoting(true)
    try {
      const response = await fetch(`/api/user/${user.id}/evaluate-promotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forcePromotion: false })
      })

      const result: PromotionApiResponse = await response.json()

      if (result.success && result.promoted) {
        toast.success(result.message || '¡Felicidades por tu ascenso!', {
          duration: 5000,
          icon: '🎉'
        })
        // Reload page to show updated level
        window.location.reload()
      } else {
        toast.error(result.error || 'No fue posible procesar el ascenso')
      }
    } catch (error) {
      console.error('Error promoting user:', error)
      toast.error('Error al procesar la promoción')
    } finally {
      setIsPromoting(false)
    }
  }

  // Stats cards data
  const statsCards = [
    {
      title: 'Referidos Directos',
      value: evaluation.directReferrals,
      target: 3,
      icon: Users,
      color: 'blue',
      description: 'Personas que has invitado directamente'
    },
    {
      title: 'Estructura 3x3',
      value: evaluation.validSecondLevelReferrals,
      target: 3,
      icon: Target,
      color: 'green',
      description: 'Referidos con estructura completa'
    },
    {
      title: 'Comisión Actual',
      value: `${(currentLevel.commissionRate * 100).toFixed(0)}%`,
      icon: DollarSign,
      color: 'yellow',
      description: 'Porcentaje de comisión por ventas'
    },
    {
      title: 'Red Total',
      value: calculateTotalNetwork(structure),
      icon: TrendingUp,
      color: 'purple',
      description: 'Tamaño total de tu red'
    }
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with level display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-6"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                ¡Hola, {user.name}! 👋
              </h1>
              <p className="text-blue-100">
                Bienvenido a tu dashboard multinivel
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-blue-200 mb-1">Tu nivel actual</div>
              <LevelDisplay 
                level={currentLevel}
                variant="badge"
                size="lg"
              />
            </div>
          </div>

          {/* Progress section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Progreso al siguiente nivel
              </span>
              <span className="text-sm font-bold">
                {progressPercentage}%
              </span>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-white rounded-full h-3 shadow-lg"
              />
            </div>

            {evaluation.canPromote ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-between bg-white/10 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-300" />
                  <span className="font-medium">¡Puedes ascender!</span>
                </div>
                <Button
                  onClick={handlePromotionRequest}
                  disabled={isPromoting}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                >
                  {isPromoting ? 'Procesando...' : 'Ascender Ahora'}
                  <ArrowUp className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ) : (
              <div className="text-sm text-blue-200">
                {evaluation.missingRequirements?.join(' • ')}
              </div>
            )}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-24 -translate-x-24" />
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {stat.value}
                      </span>
                      {stat.target && (
                        <span className="text-sm text-gray-500">
                          /{stat.target}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={cn(
                    'p-3 rounded-full',
                    stat.color === 'blue' && 'bg-blue-100 text-blue-600',
                    stat.color === 'green' && 'bg-green-100 text-green-600',
                    stat.color === 'yellow' && 'bg-yellow-100 text-yellow-600',
                    stat.color === 'purple' && 'bg-purple-100 text-purple-600'
                  )}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Level comparison */}
      {nextLevel && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Tu Progreso de Nivel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LevelComparison 
                currentLevel={currentLevel}
                nextLevel={nextLevel}
              />
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Requisitos para {nextLevel.name}:</h4>
                <p className="text-sm text-gray-600">
                  {nextLevel.requirementsDescription}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 rounded-full',
                      evaluation.directReferrals >= 3 ? 'bg-green-500' : 'bg-gray-300'
                    )} />
                    <span className="text-sm">
                      {evaluation.directReferrals}/3 referidos directos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 rounded-full',
                      evaluation.validSecondLevelReferrals >= 3 ? 'bg-green-500' : 'bg-gray-300'
                    )} />
                    <span className="text-sm">
                      {evaluation.validSecondLevelReferrals}/3 con estructura 3x3
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Referral tree */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tu Red de Referidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReferralTree
              structure={structure}
              maxDepth={3}
              interactive={true}
              showStats={true}
              onNodeClick={setSelectedNode}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent promotions */}
      {recentPromotions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Ascensos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPromotions.map((promotion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                  >
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      🎉
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        ¡Ascendiste a {promotion.toLevel?.name}!
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(promotion.promotedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Node details modal */}
      {selectedNode && (
        <NodeDetailsModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}

// Helper function to calculate total network size
function calculateTotalNetwork(structure: UserReferralStructure): number {
  let total = structure.directReferrals.length
  
  structure.directReferrals.forEach(child => {
    total += calculateTotalNetwork(child)
  })
  
  return total
}

// Modal for node details
const NodeDetailsModal: React.FC<{
  node: UserReferralStructure
  onClose: () => void
}> = ({ node, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-lg mb-4">Detalles del Referido</h3>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500">Nombre</div>
            <div className="font-medium">{node.name}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-medium">{node.email}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Nivel</div>
            <LevelDisplay 
              level={node.level}
              variant="badge"
              className="mt-1"
            />
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Fecha de Ingreso</div>
            <div className="font-medium">
              {new Date(node.joinDate).toLocaleDateString()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Referidos Directos</div>
              <div className="font-bold text-lg">{node.directReferrals.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Estado</div>
              <div className={cn(
                'font-medium',
                node.isActive ? 'text-green-600' : 'text-gray-500'
              )}>
                {node.isActive ? 'Activo' : 'Inactivo'}
              </div>
            </div>
          </div>
        </div>
        
        <Button
          onClick={onClose}
          className="w-full mt-6"
        >
          Cerrar
        </Button>
      </motion.div>
    </motion.div>
  )
} 