import { NextRequest, NextResponse } from 'next/server'
import { calculateNetworkStructure } from '@/lib/multilevel'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Obtener información real del usuario desde la base de datos
    const userFromDb = await prisma.user.findUnique({
      where: { id: userId },
      include: { level: true }
    })

    if (!userFromDb) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener la estructura de red
    const networkStructure = await calculateNetworkStructure(userId)

    // Calcular estadísticas reales
    const totalReferrals = networkStructure.directReferrals.length + networkStructure.indirectReferrals.length
    const activeReferrals = networkStructure.directReferrals.length + networkStructure.indirectReferrals.length // Por ahora asumimos que todos son activos

    // Formatear la estructura de referidos para el frontend
    const formattedStructure = networkStructure.directReferrals.map(referral => ({
      id: referral.id,
      name: referral.name,
      email: referral.email,
      joinDate: new Date().toISOString().split('T')[0], // Placeholder por ahora
      status: 'active', // Por ahora todos activos
      level: referral.level?.order || 1,
      levelName: referral.level?.name || 'Sin nivel'
    }))

    const response = {
      success: true,
      user: {
        id: userFromDb.id,
        name: userFromDb.name,
        email: userFromDb.email,
        inviteLink: userFromDb.inviteLink,
        statsLink: userFromDb.statsLink,
        trainingLink: userFromDb.trainingLink
      },
      statistics: {
        totalReferrals,
        activeReferrals,
        directReferrals: networkStructure.directReferrals.length,
        indirectReferrals: networkStructure.indirectReferrals.length,
        totalEarnings: Number(userFromDb.totalEarnings) || 0,
        monthlyEarnings: 0 // Por ahora no tenemos cálculo de ganancias mensuales
      },
      structure: formattedStructure,
      qualifiesForPromotion: networkStructure.qualifiesForPromotion,
      nextLevel: networkStructure.nextLevel
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user structure:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}