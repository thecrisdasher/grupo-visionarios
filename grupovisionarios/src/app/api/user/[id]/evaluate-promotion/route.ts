import { NextRequest, NextResponse } from 'next/server'
import { getUserLevelInfo } from '@/lib/multilevel-system'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Obtener información real del nivel del usuario
    const levelInfo = await getUserLevelInfo(userId)

    if (!levelInfo) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado o sin nivel asignado' },
        { status: 404 }
      )
    }

    // Formatear la respuesta para el frontend
    const response = {
      success: true,
      currentLevel: {
        id: levelInfo.currentLevel.id,
        name: levelInfo.currentLevel.name,
        icon: levelInfo.currentLevel.icon,
        color: levelInfo.currentLevel.color,
        order: levelInfo.currentLevel.order,
        commissionRate: Number(levelInfo.currentLevel.commissionRate),
        requirementsDescription: levelInfo.currentLevel.requirementsDescription,
        requirements: {
          referrals: levelInfo.currentLevel.minDirectReferrals || 3,
          earnings: 0 // Por ahora no tenemos requisitos de ganancias
        }
      },
      nextLevel: levelInfo.nextLevel ? {
        id: levelInfo.nextLevel.id,
        name: levelInfo.nextLevel.name,
        icon: levelInfo.nextLevel.icon,
        color: levelInfo.nextLevel.color,
        order: levelInfo.nextLevel.order,
        commissionRate: Number(levelInfo.nextLevel.commissionRate),
        requirementsDescription: levelInfo.nextLevel.requirementsDescription,
        requirements: {
          referrals: levelInfo.nextLevel.minDirectReferrals || 3,
          earnings: 0
        }
      } : null,
      directReferrals: levelInfo.evaluation.directReferrals || 0,
      validSecondLevelReferrals: levelInfo.evaluation.validSecondLevelReferrals || 0,
      canPromote: levelInfo.evaluation.canPromote || false,
      requiredStructure: levelInfo.evaluation.requiredStructure || '3 referidos directos + 9 referidos indirectos (3x3)',
      missingRequirements: levelInfo.evaluation.missingRequirements || [],
      progress: {
        referrals: levelInfo.evaluation.directReferrals || 0,
        earnings: 0 // Por ahora no tenemos datos de ganancias
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error evaluating promotion:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}