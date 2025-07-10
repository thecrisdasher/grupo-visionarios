'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { 
  Star,
  Heart,
  Target,
  Users,
  Lightbulb,
  Shield,
  Zap,
  Trophy,
  Users2,
  Compass,
  Crown,
  Flame
} from 'lucide-react'

interface Value {
  id: string
  name: string
  shortName: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  description: string
  slug: string
}

const values: Value[] = [
  {
    id: '1',
    name: 'Excelencia',
    shortName: 'Excelencia',
    icon: <Star className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'Búsqueda constante de la calidad suprema',
    slug: 'excelencia'
  },
  {
    id: '2',
    name: 'Pasión',
    shortName: 'Pasión',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    description: 'Amor genuino por lo que hacemos',
    slug: 'pasion'
  },
  {
    id: '3',
    name: 'Enfoque',
    shortName: 'Enfoque',
    icon: <Target className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    description: 'Concentración en objetivos claros',
    slug: 'enfoque'
  },
  {
    id: '4',
    name: 'Colaboración',
    shortName: 'Colaboración',
    icon: <Users className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    description: 'Trabajo en equipo hacia metas comunes',
    slug: 'colaboracion'
  },
  {
    id: '5',
    name: 'Innovación',
    shortName: 'Innovación',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    description: 'Creatividad y soluciones únicas',
    slug: 'innovacion'
  },
  {
    id: '6',
    name: 'Integridad',
    shortName: 'Integridad',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    description: 'Honestidad y transparencia absoluta',
    slug: 'integridad'
  },
  {
    id: '7',
    name: 'Agilidad',
    shortName: 'Agilidad',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    description: 'Adaptación rápida a los cambios',
    slug: 'agilidad'
  },
  {
    id: '8',
    name: 'Liderazgo',
    shortName: 'Liderazgo',
    icon: <Trophy className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    description: 'Inspirar y guiar con el ejemplo',
    slug: 'liderazgo'
  },
  {
    id: '9',
    name: 'Compromiso',
    shortName: 'Compromiso',
    icon: <Users2 className="w-5 h-5" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200',
    description: 'Dedicación inquebrantable a nuestros ideales',
    slug: 'compromiso'
  },
  {
    id: '10',
    name: 'Visión',
    shortName: 'Visión',
    icon: <Compass className="w-5 h-5" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-200',
    description: 'Perspectiva clara del futuro deseado',
    slug: 'vision'
  },
  {
    id: '11',
    name: 'Respeto',
    shortName: 'Respeto',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    description: 'Valoración y consideración mutua',
    slug: 'respeto'
  },
  {
    id: '12',
    name: 'Perseverancia',
    shortName: 'Perseverancia',
    icon: <Flame className="w-5 h-5" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-200',
    description: 'Persistencia ante los desafíos',
    slug: 'perseverancia'
  }
]

interface ValueIconsGridProps {
  className?: string
  showTitle?: boolean
  itemsPerRow?: number
  /**
   * Callback cuando se hace click en un valor
   */
  onValueClick?: (value: Value) => void
  /**
   * Valores resaltados (ids)
   */
  highlightedValues?: string[]
}

export const ValueIconsGrid: React.FC<ValueIconsGridProps> = ({
  className,
  showTitle = true,
  itemsPerRow = 4,
  onValueClick,
  highlightedValues = []
}) => {
  const gridCols = {
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }

  const gridClass = gridCols[itemsPerRow as keyof typeof gridCols] || gridCols[4]

  const handleValueClick = (value: Value) => {
    if (onValueClick) {
      onValueClick(value)
    }
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Nuestros 12 Valores
          </CardTitle>
          <p className="text-sm text-gray-600">
            Los principios que guían a cada visionario
          </p>
        </CardHeader>
      )}
      
      <CardContent>
        <div className={cn(
          'grid gap-4',
          gridClass
        )}>
          {values.map((value, index) => {
            const isHighlighted = highlightedValues.includes(value.id)
            
            return (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href={`/values/${value.slug}`}
                  onClick={() => handleValueClick(value)}
                  className="block"
                >
                  <div className={cn(
                    'group relative p-4 rounded-lg border-2 transition-all duration-300',
                    'hover:shadow-lg cursor-pointer',
                    isHighlighted
                      ? `${value.borderColor} ${value.bgColor} border-solid shadow-md`
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  )}>
                    {/* Icono */}
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3',
                      'transition-all duration-300 group-hover:scale-110',
                      isHighlighted
                        ? value.bgColor
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    )}>
                      <div className={cn(
                        'transition-colors duration-300',
                        isHighlighted
                          ? value.color
                          : 'text-gray-600 group-hover:text-gray-800'
                      )}>
                        {value.icon}
                      </div>
                    </div>

                    {/* Nombre */}
                    <h3 className={cn(
                      'text-center font-semibold text-sm mb-2 transition-colors duration-300',
                      isHighlighted
                        ? value.color
                        : 'text-gray-900 group-hover:text-gray-800'
                    )}>
                      {value.shortName}
                    </h3>

                    {/* Descripción (opcional, solo en hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs text-gray-600 text-center leading-tight">
                        {value.description}
                      </p>
                    </div>

                    {/* Indicador de destacado */}
                    {isHighlighted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <Star className="w-3 h-3 text-white fill-current" />
                      </motion.div>
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Footer informativo */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <p className="text-sm text-gray-700 font-medium mb-1">
              💫 Valores en Acción
            </p>
            <p className="text-xs text-gray-600">
              Haz clic en cualquier valor para conocer más sobre cómo lo aplicamos en nuestra comunidad
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente compacto para mostrar solo algunos valores
interface ValueIconsCompactProps {
  selectedValues?: string[]
  maxItems?: number
  className?: string
  onValueClick?: (value: Value) => void
}

export const ValueIconsCompact: React.FC<ValueIconsCompactProps> = ({
  selectedValues,
  maxItems = 6,
  className,
  onValueClick
}) => {
  const displayValues = selectedValues 
    ? values.filter(v => selectedValues.includes(v.id)).slice(0, maxItems)
    : values.slice(0, maxItems)

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {displayValues.map((value, index) => (
        <motion.div
          key={value.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Link 
            href={`/values/${value.slug}`}
            onClick={() => onValueClick?.(value)}
            className="block"
          >
            <div className={cn(
              'group w-14 h-14 rounded-lg border-2 flex items-center justify-center',
              'transition-all duration-300 cursor-pointer',
              'hover:shadow-md',
              value.borderColor,
              'bg-white hover:' + value.bgColor
            )}>
              <div className={cn(
                'transition-colors duration-300',
                'text-gray-600 group-hover:' + value.color.replace('text-', '')
              )}>
                {value.icon}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
      
      {values.length > maxItems && !selectedValues && (
        <Link href="/values" className="block">
          <div className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
            <span className="text-gray-500 text-xs font-medium">+{values.length - maxItems}</span>
          </div>
        </Link>
      )}
    </div>
  )
}

export { values, type Value } 