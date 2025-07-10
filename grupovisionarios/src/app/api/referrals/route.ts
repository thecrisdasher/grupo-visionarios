import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { registerReferralAndEvaluate } from '@/lib/multilevel-system'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const createReferralSchema = z.object({
  referredUserId: z.string().cuid(),
  referrerCode: z.string().optional(), // For manual referral registration
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = createReferralSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { referredUserId, referrerCode } = parsed.data
    let referrerId = session.user.id

    // If referrerCode is provided, find the referrer
    if (referrerCode) {
    const referrer = await prisma.user.findUnique({
        where: { referralCode: referrerCode }
    })

    if (!referrer) {
        return NextResponse.json(
          { error: 'Código de referido inválido' },
          { status: 400 }
        )
      }

      referrerId = referrer.id
    }

    // Check if referral already exists
    const existingReferral = await prisma.referral.findUnique({
      where: {
        referrerId_referredId: {
          referrerId,
          referredId: referredUserId
        }
      }
    })

    if (existingReferral) {
      return NextResponse.json(
        { error: 'El referido ya existe' },
        { status: 400 }
      )
    }

    // Check if referred user exists and is not self-referral
    const referredUser = await prisma.user.findUnique({
      where: { id: referredUserId }
    })

    if (!referredUser) {
      return NextResponse.json(
        { error: 'Usuario referido no encontrado' },
        { status: 404 }
      )
    }

    if (referrerId === referredUserId) {
      return NextResponse.json(
        { error: 'No puedes referirte a ti mismo' },
        { status: 400 }
      )
    }

    // Register referral and evaluate promotion
    const result = await registerReferralAndEvaluate(referrerId, referredUserId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al registrar referido' },
        { status: 500 }
      )
    }

    // Get updated referrer info
    const updatedReferrer = await prisma.user.findUnique({
      where: { id: referrerId },
      include: {
        referralsMade: true
      }
    })

    return NextResponse.json({
      success: true,
      referralCreated: result.referralCreated,
      promoted: result.promoted,
      newLevel: result.newLevel,
        referrer: {
        id: updatedReferrer?.id,
        name: updatedReferrer?.name,
        totalReferrals: updatedReferrer?.referralsMade.length || 0
      },
      message: result.promoted 
        ? `¡Felicidades! Has ascendido a ${result.newLevel?.name}` 
        : 'Referido registrado exitosamente'
    })

  } catch (error) {
    console.error('Error in POST /api/referrals:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // Get user's referrals with pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Get referred users separately
    const referredUsers = await Promise.all(
      referrals.map(referral => 
        prisma.user.findUnique({
          where: { id: referral.referredId },
          include: {
            referralsMade: true
          }
        })
      )
    )

    const formattedReferrals = referrals.map((referral, index) => {
      const referredUser = referredUsers[index]
      if (!referredUser) return null

      return {
        id: referral.id,
        user: {
          id: referredUser.id,
          name: referredUser.name,
          email: referredUser.email,
          totalReferrals: referredUser.referralsMade.length,
          isActive: referredUser.isActive,
          joinDate: referredUser.createdAt
        },
        commission: referral.commission,
        status: referral.status,
        level: referral.level,
        createdAt: referral.createdAt
      }
    }).filter(Boolean)

    const totalReferrals = await prisma.referral.count({
      where: { referrerId: userId }
    })

    return NextResponse.json({
      success: true,
      referrals: formattedReferrals,
      pagination: {
        page,
        limit,
        total: totalReferrals,
        totalPages: Math.ceil(totalReferrals / limit)
      }
    })

  } catch (error) {
    console.error('Error in GET /api/referrals:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 