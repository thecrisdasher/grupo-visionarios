"use client"

import { useState, useRef, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Settings, HelpCircle, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function UserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold focus:outline-none"
      >
        {userInitial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-40">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.name}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {session?.user?.email}
            </p>
          </div>
          <div className="py-1">
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <Settings className="w-4 h-4" /> Configuración
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <HelpCircle className="w-4 h-4" /> Ayuda
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 