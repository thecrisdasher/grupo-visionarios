'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Star, Sparkles, Trophy, Gift } from 'lucide-react'
import { Level } from '@/types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface LevelUpNotificationProps {
  isVisible: boolean
  fromLevel: Level
  toLevel: Level
  onClose: () => void
  benefits?: string[]
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  isVisible,
  fromLevel,
  toLevel,
  onClose,
  benefits = []
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 300,
              duration: 0.6 
            }}
            className="bg-white rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Background animations */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: Math.random() * 300,
                    y: Math.random() * 400
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [400, -50]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute text-yellow-400"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 text-center">
              {/* Success icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  damping: 15,
                  stiffness: 200
                }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                ¡Felicidades! 🎉
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mb-6"
              >
                Has ascendido de nivel en tu carrera como afiliado
              </motion.p>

              {/* Level progression */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                {/* From level */}
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl mb-2 bg-gray-50"
                    style={{ borderColor: fromLevel.color }}
                  >
                    {fromLevel.icon}
                  </div>
                  <div className="text-xs text-gray-500">Anterior</div>
                  <div 
                    className="text-sm font-medium"
                    style={{ color: fromLevel.color }}
                  >
                    {fromLevel.name}
                  </div>
                </div>

                {/* Arrow */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center"
                >
                  <div className="w-8 h-px bg-gradient-to-r from-gray-300 to-yellow-400"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full transform rotate-45 border-2 border-white"></div>
                </motion.div>

                {/* To level */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: 0.9,
                    type: "spring",
                    damping: 15
                  }}
                  className="text-center"
                >
                  <div 
                    className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl mb-2 shadow-lg"
                    style={{ 
                      borderColor: toLevel.color,
                      backgroundColor: `${toLevel.color}15`,
                      boxShadow: `0 8px 25px ${toLevel.color}30`
                    }}
                  >
                    {toLevel.icon}
                  </div>
                  <div className="text-xs text-gray-500">Nuevo</div>
                  <div 
                    className="text-sm font-bold"
                    style={{ color: toLevel.color }}
                  >
                    {toLevel.name}
                  </div>
                </motion.div>
              </motion.div>

              {/* New commission rate */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Nueva Comisión</span>
                </div>
                <div className="text-3xl font-bold text-green-700">
                  {(toLevel.commissionRate * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-green-600">
                  +{((toLevel.commissionRate - fromLevel.commissionRate) * 100).toFixed(1)}% más que antes
                </div>
              </motion.div>

              {/* Benefits */}
              {benefits.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="text-left mb-6"
                >
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Nuevos Beneficios:
                  </h4>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Continue button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                ¡Continuar mi Camino! 🚀
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for easy level up notifications
export const useLevelUpNotification = () => {
  const [notification, setNotification] = React.useState<{
    isVisible: boolean
    fromLevel?: Level
    toLevel?: Level
    benefits?: string[]
  }>({
    isVisible: false
  })

  const showLevelUp = React.useCallback((fromLevel: Level, toLevel: Level, benefits?: string[]) => {
    // First show a toast for immediate feedback
    toast.success(`¡Felicidades! Ascendiste a ${toLevel.name}`, {
      duration: 4000,
      icon: '🎉',
      position: 'top-center',
      style: {
        background: `linear-gradient(135deg, ${toLevel.color}20, ${toLevel.color}10)`,
        border: `2px solid ${toLevel.color}`,
        color: toLevel.color
      }
    })

    // Then show the detailed modal after a short delay
    setTimeout(() => {
      setNotification({
        isVisible: true,
        fromLevel,
        toLevel,
        benefits
      })
    }, 1000)
  }, [])

  const hideLevelUp = React.useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }, [])

  return {
    ...notification,
    showLevelUp,
    hideLevelUp
  }
}

// Simple toast notification for quick level ups
export const showQuickLevelUpToast = (toLevel: Level) => {
  toast.custom((t) => (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, y: -100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.6, opacity: 0, y: -100 }}
      className={cn(
        'flex items-center gap-3 bg-white rounded-lg shadow-xl border-2 p-4 max-w-sm',
        t.visible ? 'animate-enter' : 'animate-leave'
      )}
      style={{ borderColor: toLevel.color }}
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
        style={{ 
          backgroundColor: `${toLevel.color}20`,
          color: toLevel.color 
        }}
      >
        {toLevel.icon}
      </div>
      <div className="flex-1">
        <div className="font-bold text-gray-900">¡Nivel Ascendido!</div>
        <div className="text-sm" style={{ color: toLevel.color }}>
          Ahora eres {toLevel.name}
        </div>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="p-1 rounded-full hover:bg-gray-100"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </motion.div>
  ), {
    duration: 6000,
    position: 'top-center'
  })
} 