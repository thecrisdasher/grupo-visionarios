'use client'

import React from 'react'
import { SidebarAfiliado } from './SidebarAfiliado'
import { cn } from '@/lib/utils'

interface AffiliateLayoutProps {
  children: React.ReactNode
  className?: string
  /**
   * Opcional: permite desactivar el sidebar para páginas específicas
   */
  showSidebar?: boolean
  /**
   * Opcional: clase adicional para el contenido principal
   */
  contentClassName?: string
}

export const AffiliateLayout: React.FC<AffiliateLayoutProps> = ({
  children,
  className,
  showSidebar = true,
  contentClassName
}) => {
  if (!showSidebar) {
    return (
      <div className={cn('min-h-screen', className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Sidebar */}
      <SidebarAfiliado />

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className={cn(
          'min-h-screen',
          contentClassName
        )}>
          {children}
        </main>
      </div>
    </div>
  )
} 