'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { UserReferralStructure } from '@/types'
import { ChevronDown, ChevronRight, Users, Eye, Calendar, Award } from 'lucide-react'
import { LevelIndicator } from './LevelDisplay'

interface ReferralTreeProps {
  structure: UserReferralStructure
  maxDepth?: number
  interactive?: boolean
  showStats?: boolean
  onNodeClick?: (node: UserReferralStructure) => void
  className?: string
}

interface TreeNodeProps {
  node: UserReferralStructure
  depth: number
  maxDepth: number
  isLast: boolean
  interactive: boolean
  showStats: boolean
  onNodeClick?: (node: UserReferralStructure) => void
  parentExpanded?: boolean
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  maxDepth,
  isLast,
  interactive,
  showStats,
  onNodeClick,
  parentExpanded = true
}) => {
  const [expanded, setExpanded] = useState(depth < 2) // Auto-expand first 2 levels
  const hasChildren = node.directReferrals.length > 0
  const shouldShowChildren = expanded && hasChildren && depth < maxDepth

  const handleToggle = useCallback(() => {
    if (hasChildren) {
      setExpanded(!expanded)
    }
  }, [hasChildren, expanded])

  const handleNodeClick = useCallback(() => {
    if (onNodeClick) {
      onNodeClick(node)
    }
  }, [onNodeClick, node])

  // Calculate statistics for this node
  const totalDescendants = useCallback((n: UserReferralStructure): number => {
    let count = n.directReferrals.length
    n.directReferrals.forEach(child => {
      count += totalDescendants(child)
    })
    return count
  }, [])

  const stats = {
    direct: node.directReferrals.length,
    total: totalDescendants(node),
    active: node.directReferrals.filter(r => r.isActive).length
  }

  // Node connection styles
  const getConnectionStyles = () => {
    if (depth === 0) return ''
    
    return cn(
      'relative',
      'before:absolute before:left-[-20px] before:top-[20px] before:w-[16px] before:h-px before:bg-gray-300',
      !isLast && 'after:absolute after:left-[-20px] after:top-[20px] after:bottom-[-20px] after:w-px after:bg-gray-300'
    )
  }

  // Status indicator color
  const getStatusColor = () => {
    if (!node.isActive) return 'bg-gray-400'
    if (stats.direct >= 3) return 'bg-green-500'
    if (stats.direct >= 1) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: parentExpanded ? 1 : 0, x: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.05 }}
      className={cn('relative', depth > 0 && 'ml-6')}
    >
      <div className={getConnectionStyles()}>
        {/* Node Content */}
        <motion.div
          whileHover={interactive ? { scale: 1.02 } : {}}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border bg-white shadow-sm',
            'transition-all duration-200',
            interactive && 'cursor-pointer hover:shadow-md hover:border-blue-300',
            depth === 0 && 'border-2 border-blue-500 shadow-lg'
          )}
          onClick={interactive ? handleNodeClick : undefined}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3 text-gray-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-600" />
              )}
            </button>
          )}

          {/* Status Indicator */}
          <div className={cn('w-3 h-3 rounded-full', getStatusColor())} />

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate">
                {node.name}
              </h4>
              <LevelIndicator level={node.level} />
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(node.joinDate).toLocaleDateString()}
              </span>
              
              {showStats && (
                <>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {stats.direct} directos
                  </span>
                  
                  {stats.total > stats.direct && (
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {stats.total} total
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {showStats && depth === 0 && (
            <div className="flex gap-2">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-xs text-blue-600">Directos</div>
                <div className="font-bold text-blue-800">{stats.direct}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-xs text-green-600">Activos</div>
                <div className="font-bold text-green-800">{stats.active}</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="text-xs text-purple-600">Total</div>
                <div className="font-bold text-purple-800">{stats.total}</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {shouldShowChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              {node.directReferrals.map((child, index) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  isLast={index === node.directReferrals.length - 1}
                  interactive={interactive}
                  showStats={showStats}
                  onNodeClick={onNodeClick}
                  parentExpanded={expanded}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Truncation indicator */}
        {hasChildren && !shouldShowChildren && depth >= maxDepth && (
          <div className="ml-6 mt-2 p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>
                {node.directReferrals.length} referido{node.directReferrals.length !== 1 ? 's' : ''} más...
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export const ReferralTree: React.FC<ReferralTreeProps> = ({
  structure,
  maxDepth = 3,
  interactive = true,
  showStats = true,
  onNodeClick,
  className
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'compact'>('tree')

  // Calculate tree statistics
  const calculateTreeStats = useCallback((node: UserReferralStructure): {
    totalNodes: number
    maxDepth: number
    totalActive: number
    levels: Record<number, number>
  } => {
    let totalNodes = 1
    let maxDepthFound = 0
    let totalActive = node.isActive ? 1 : 0
    const levels: Record<number, number> = {}
    
    const traverse = (n: UserReferralStructure, depth: number) => {
      maxDepthFound = Math.max(maxDepthFound, depth)
      levels[depth] = (levels[depth] || 0) + 1
      
      n.directReferrals.forEach(child => {
        totalNodes++
        if (child.isActive) totalActive++
        traverse(child, depth + 1)
      })
    }
    
    traverse(structure, 0)
    
    return { totalNodes, maxDepth: maxDepthFound, totalActive, levels }
  }, [structure])

  const treeStats = calculateTreeStats(structure)

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Red de Referidos</h3>
          <p className="text-sm text-gray-600">
            Estructura multinivel de {structure.name}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Stats Summary */}
          <div className="flex gap-3 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">{treeStats.totalNodes}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{treeStats.totalActive}</div>
              <div className="text-gray-500">Activos</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-600">{treeStats.maxDepth + 1}</div>
              <div className="text-gray-500">Niveles</div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white rounded-lg border p-1">
            <button
              onClick={() => setViewMode('tree')}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                viewMode === 'tree'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Árbol
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                viewMode === 'compact'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Compacto
            </button>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="bg-white rounded-lg border p-4 overflow-x-auto">
        {viewMode === 'tree' ? (
          <TreeNode
            node={structure}
            depth={0}
            maxDepth={maxDepth}
            isLast={true}
            interactive={interactive}
            showStats={showStats}
            onNodeClick={onNodeClick}
          />
        ) : (
          <CompactView
            structure={structure}
            maxDepth={maxDepth}
            onNodeClick={onNodeClick}
          />
        )}
      </div>

      {/* 3x3 Structure Validation */}
      <StructureValidation structure={structure} />
    </div>
  )
}

// Compact grid view
const CompactView: React.FC<{
  structure: UserReferralStructure
  maxDepth: number
  onNodeClick?: (node: UserReferralStructure) => void
}> = ({ structure, maxDepth, onNodeClick }) => {
  const organizeByLevels = (node: UserReferralStructure, depth = 0): Record<number, UserReferralStructure[]> => {
    const levels: Record<number, UserReferralStructure[]> = { [depth]: [node] }
    
    const traverse = (n: UserReferralStructure, d: number) => {
      if (d >= maxDepth) return
      
      n.directReferrals.forEach(child => {
        if (!levels[d + 1]) levels[d + 1] = []
        levels[d + 1].push(child)
        traverse(child, d + 1)
      })
    }
    
    traverse(node, depth)
    return levels
  }

  const levels = organizeByLevels(structure)

  return (
    <div className="space-y-6">
      {Object.entries(levels).map(([depth, nodes]) => (
        <div key={depth} className="space-y-2">
          <h4 className="font-medium text-gray-700">
            Nivel {depth} ({nodes.length} persona{nodes.length !== 1 ? 's' : ''})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {nodes.map(node => (
              <motion.div
                key={node.id}
                whileHover={{ scale: 1.02 }}
                className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => onNodeClick?.(node)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    node.isActive ? 'bg-green-500' : 'bg-gray-400'
                  )} />
                  <span className="font-medium text-sm truncate">{node.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <LevelIndicator level={node.level} />
                  <span>{node.directReferrals.length} ref.</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// 3x3 Structure validation component
const StructureValidation: React.FC<{
  structure: UserReferralStructure
}> = ({ structure }) => {
  const validate3x3Structure = () => {
    const directReferrals = structure.directReferrals.slice(0, 3)
    const hasThreeDirects = directReferrals.length >= 3
    
    let validSecondLevel = 0
    directReferrals.forEach(referral => {
      if (referral.directReferrals.length >= 3) {
        validSecondLevel++
      }
    })
    
    const isValid3x3 = hasThreeDirects && validSecondLevel >= 3
    
    return {
      hasThreeDirects,
      validSecondLevel,
      isValid3x3,
      directReferrals
    }
  }

  const validation = validate3x3Structure()

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
      <h4 className="font-semibold text-gray-900 mb-3">Validación Estructura 3x3</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Requirement 1 */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold',
            validation.hasThreeDirects ? 'bg-green-500' : 'bg-gray-400'
          )}>
            {validation.hasThreeDirects ? '✓' : '1'}
          </div>
          <div>
            <div className="font-medium text-sm">3 Referidos Directos</div>
            <div className="text-xs text-gray-600">
              {structure.directReferrals.length}/3 completado
            </div>
          </div>
        </div>

        {/* Requirement 2 */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold',
            validation.validSecondLevel >= 3 ? 'bg-green-500' : 'bg-gray-400'
          )}>
            {validation.validSecondLevel >= 3 ? '✓' : '2'}
          </div>
          <div>
            <div className="font-medium text-sm">Cada uno con 3</div>
            <div className="text-xs text-gray-600">
              {validation.validSecondLevel}/3 completado
            </div>
          </div>
        </div>

        {/* Final validation */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold',
            validation.isValid3x3 ? 'bg-green-500' : 'bg-gray-400'
          )}>
            {validation.isValid3x3 ? '🏆' : '!'}
          </div>
          <div>
            <div className="font-medium text-sm">
              {validation.isValid3x3 ? 'Puede Ascender' : 'En Progreso'}
            </div>
            <div className="text-xs text-gray-600">
              {validation.isValid3x3 ? 'Estructura completa' : 'Sigue creciendo'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 