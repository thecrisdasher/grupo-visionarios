import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateUserLinks } from '@/lib/user-links'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del usuario' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Generar nuevos enlaces únicos
    const newLinks = generateUserLinks(user.name, user.id)

    // Actualizar los enlaces en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        inviteLink: newLinks.inviteLink,
        statsLink: newLinks.statsLink,
        trainingLink: newLinks.trainingLink
      },
      select: {
        id: true,
        name: true,
        inviteLink: true,
        statsLink: true,
        trainingLink: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Enlaces regenerados exitosamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error regenerating user links:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// API para obtener los enlaces de un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del usuario' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        inviteLink: true,
        statsLink: true,
        trainingLink: true,
        referralCode: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Error getting user links:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// API para validar si un enlace existe y obtener datos del usuario
export async function PUT(request: NextRequest) {
  try {
    const { linkId, linkType } = await request.json()

    if (!linkId || !linkType) {
      return NextResponse.json(
        { error: 'Se requiere el ID del enlace y el tipo' },
        { status: 400 }
      )
    }

    let whereClause: any = {}
    
    switch (linkType) {
      case 'invite':
        whereClause = { inviteLink: linkId }
        break
      case 'stats':
        whereClause = { statsLink: linkId }
        break
      case 'training':
        whereClause = { trainingLink: linkId }
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de enlace inválido' },
          { status: 400 }
        )
    }

    const user = await prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        referralCode: true,
        createdAt: true,
        // For stats page
        payments: {
          where: { status: 'COMPLETED' },
          select: {
            amount: true,
            createdAt: true
          }
        },
        // For referrals count
        referrals: {
          select: {
            id: true,
            createdAt: true,
            isActive: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Enlace no válido o usuario no encontrado' },
        { status: 404 }
      )
    }

    // Calculate stats for the user
    const totalReferrals = user.referrals.length
    const activeReferrals = user.referrals.filter((r: any) => r.isActive).length
    const totalEarnings = user.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
    
    // Calculate monthly earnings (current month)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyEarnings = user.payments
      .filter((p: any) => {
        const paymentDate = new Date(p.createdAt)
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
      })
      .reduce((sum: number, payment: any) => sum + payment.amount, 0)

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        stats: {
          totalReferrals,
          activeReferrals,
          totalEarnings,
          monthlyEarnings,
          conversionRate: totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0
        }
      }
    })

  } catch (error) {
    console.error('Error validating link:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 