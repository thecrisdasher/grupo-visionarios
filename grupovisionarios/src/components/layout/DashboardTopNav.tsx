"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bell, UserCircle } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  href: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'stats', label: 'Estadísticas', href: '/stats' },
  { id: 'referrals', label: 'Referidos', href: '/referrals' },
  { id: 'training', label: 'Capacitación', href: '/training' },
]

export default function DashboardTopNav({ balance }: { balance?: string }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between">
          {/* Nav links */}
          <nav className="flex gap-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'text-sm font-medium',
                  pathname.startsWith(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-6">
            {balance && (
              <span className="text-sm font-semibold text-blue-600 hidden sm:block">
                {balance}
              </span>
            )}
            <button className="relative text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
            </button>
            <UserCircle className="w-7 h-7 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  )
} 