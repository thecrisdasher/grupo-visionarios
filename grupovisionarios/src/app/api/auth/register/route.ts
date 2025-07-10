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
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 })
    }

    // Hash password
    const hashed = await hash(password, 10)

    // Generate referral code (existing util) and user links
    const referralCode = generateReferralCode()
    const userLinks = generateUserLinks(name, '')

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: 'AFFILIATE',
        referralCode,
        inviteLink: userLinks.inviteLink,
        statsLink: userLinks.statsLink,
        trainingLink: userLinks.trainingLink,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[REGISTER_ERROR]', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
} 