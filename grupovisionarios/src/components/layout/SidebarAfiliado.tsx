'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  BarChart3,
  Users,
  GraduationCap,
  Star,
  MessageCircle,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SidebarItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />
  },
  {
    id: 'stats',
    label: 'Estadísticas',
    href: '/stats',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: 'referrals',
    label: 'Referidos',
    href: '/referrals',
    icon: <Users className="w-5 h-5" />,
    badge: '12'
  },
  {
    id: 'training',
    label: 'Capacitación',
    href: '/training',
    icon: <GraduationCap className="w-5 h-5" />
  },
  {
    id: 'values',
    label: 'Valores',
    href: '/values',
    icon: <Star className="w-5 h-5" />
  }
]

const supportItems: SidebarItem[] = [
  {
    id: 'whatsapp',
    label: 'Soporte',
    href: 'https://wa.me/573207277421?text=Hola,%20necesito%20soporte%20con%20mi%20cuenta%20de%20afiliado',
    icon: <MessageCircle className="w-5 h-5" />
  }
]

interface SidebarAfiliadoProps {
  className?: string
}

export const SidebarAfiliado: React.FC<SidebarAfiliadoProps> = ({ className }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    // TODO: Implementar logout real
    console.log('Cerrando sesión...')
  }

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/573207277421?text=Hola,%20necesito%20soporte%20con%20mi%20cuenta%20de%20afiliado', '_blank')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">GV</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Grupo Visionarios</h3>
            <p className="text-sm text-gray-600">Panel de Afiliado</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={isActiveRoute(item.href)}
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </div>

        {/* Separator */}
        <div className="py-4">
          <div className="border-t border-gray-200"></div>
        </div>

        {/* Support Section */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">
            Soporte
          </p>
          {supportItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={false}
              isExternal={true}
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-medium"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-40',
        'bg-white border-r border-gray-200 shadow-soft',
        className
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

interface SidebarNavItemProps {
  item: SidebarItem
  isActive: boolean
  isExternal?: boolean
  onClick?: () => void
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ 
  item, 
  isActive, 
  isExternal = false,
  onClick 
}) => {
  const content = (
    <div className={cn(
      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
      isActive
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    )}>
      <div className={cn(
        'mr-3 flex-shrink-0',
        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
      )}>
        {item.icon}
      </div>
      
      <span className="flex-1">{item.label}</span>
      
      {item.badge && (
        <span className={cn(
          'ml-2 px-2 py-1 text-xs rounded-full',
          isActive
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gray-100 text-gray-600'
        )}>
          {item.badge}
        </span>
      )}
      
      {isExternal && (
        <ChevronRight className="w-4 h-4 ml-2 text-gray-400" />
      )}
    </div>
  )

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="block"
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={item.href} onClick={onClick} className="block">
      {content}
    </Link>
  )
} 