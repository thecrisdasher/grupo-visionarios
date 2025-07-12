import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { generateReferralCode } from '@/lib/utils'
import { generateUserLinks } from '@/lib/user-links'

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    // El registro ahora requiere el proceso completo de afiliación con pago
    return NextResponse.json({ 
      error: 'El proceso de registro ha cambiado. Para afiliarte a Grupo Visionarios, debes completar el proceso completo que incluye información adicional y el pago de membresía. Serás redirigido al nuevo formulario.',
      redirectTo: '/auth/register' 
    }, { status: 400 })
  } catch (error) {
    console.error('[REGISTER_ERROR]', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
} 