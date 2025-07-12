'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, 
  Calendar,
  Check
} from 'lucide-react'

interface MonthOption {
  value: string
  label: string
  year: number
  month: number
}

interface DropdownMonthSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  maxMonthsBack?: number
  /**
   * Formato del label del mes: 'full' | 'short' | 'numeric'
   */
  labelFormat?: 'full' | 'short' | 'numeric'
}

export const DropdownMonthSelector: React.FC<DropdownMonthSelectorProps> = ({
  value,
  onChange,
  className,
  placeholder = "Seleccionar mes",
  maxMonthsBack = 12,
  labelFormat = 'full'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generar opciones de meses
  const generateMonthOptions = (): MonthOption[] => {
    const options: MonthOption[] = []
    const now = new Date()
    
    for (let i = 0; i < maxMonthsBack; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth()
      
      const monthNames = {
        full: [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ],
        short: [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ]
      }
      
      let label = ''
      if (labelFormat === 'numeric') {
        label = `${String(month + 1).padStart(2, '0')}/${year}`
      } else {
        const monthName = monthNames[labelFormat][month]
        label = `${monthName} ${year}`
      }
      
      options.push({
        value: `${year}-${String(month + 1).padStart(2, '0')}`,
        label,
        year,
        month: month + 1
      })
    }
    
    return options
  }

  const monthOptions = generateMonthOptions()
  const selectedOption = monthOptions.find(option => option.value === value)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5',
          'bg-white border border-gray-200 rounded-lg',
          'hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'transition-all duration-200',
          'text-left text-sm font-medium',
          isOpen && 'border-blue-500 ring-2 ring-blue-500'
        )}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={cn(
            selectedOption ? 'text-gray-900' : 'text-gray-500'
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {/* Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              'absolute top-full left-0 right-0 z-50 mt-1',
              'bg-white border border-gray-200 rounded-lg shadow-lg',
              'max-h-64 overflow-y-auto'
            )}
          >
            <div className="py-1">
              {monthOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm transition-colors duration-150',
                    'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                    'flex items-center justify-between',
                    option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  )}
                >
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente complementario para mostrar resumen del mes seleccionado
interface MonthSummaryCardProps {
  selectedMonth: string
  data?: {
    referrals: number
    earnings: number
    conversions: number
    newSignups: number
  }
  className?: string
}

export const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({
  selectedMonth,
  data,
  className
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatMonth = (monthValue: string) => {
    if (!monthValue) return 'Mes no seleccionado'
    
    const [year, month] = monthValue.split('-')
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  const defaultData = {
    referrals: 0,
    earnings: 0,
    conversions: 0,
    newSignups: 0
  }

  const monthData = data || defaultData

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg p-6',
      className
    )}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Resumen de {formatMonth(selectedMonth)}
        </h3>
        <p className="text-sm text-gray-600">
          Estadísticas del periodo seleccionado
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {monthData.referrals}
          </div>
          <div className="text-xs text-blue-700 font-medium">
            Referidos
          </div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(monthData.earnings)}
          </div>
          <div className="text-xs text-green-700 font-medium">
            Ganancias
          </div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {monthData.conversions}%
          </div>
          <div className="text-xs text-purple-700 font-medium">
            Conversión
          </div>
        </div>

        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {monthData.newSignups}
          </div>
          <div className="text-xs text-orange-700 font-medium">
            Nuevos
          </div>
        </div>
      </div>
    </div>
  )
} 