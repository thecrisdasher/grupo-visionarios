import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { evaluateUserPromotion, promoteUser, getUserLevelInfo } from '@/lib/multilevel-system'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const userId = params.id
    const { forcePromotion = false } = await request.json()

    // Check permissions - user can only promote themselves unless they're admin
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para promocionar este usuario' },
        { status: 403 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { level: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Evaluate promotion eligibility
    const evaluation = await evaluateUserPromotion(userId)

    if (!evaluation.canPromote && !forcePromotion) {
      return NextResponse.json({
        success: false,
        canPromote: false,
        evaluation,
        message: 'El usuario no cumple los requisitos para promoción',
        requirements: evaluation.missingRequirements
      })
    }

    // For admin force promotion, skip validation
    if (forcePromotion && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden forzar promociones' },
        { status: 403 }
      )
    }

    // Execute promotion
    const promotionResult = await promoteUser(userId)

    if (!promotionResult.success) {
      return NextResponse.json({
        success: false,
        error: promotionResult.error,
        evaluation
      }, { status: 400 })
    }

    // Get updated user level info
    const updatedLevelInfo = await getUserLevelInfo(userId)

    return NextResponse.json({
      success: true,
      promoted: true,
      message: `¡Felicidades! Has ascendido a ${promotionResult.newLevel?.name}`,
      promotion: {
        fromLevel: user.level,
        toLevel: promotionResult.newLevel,
        promotedAt: new Date(),
        reason: forcePromotion ? 'Promoción administrativa' : 'Estructura 3x3 completada'
      },
      updatedUserInfo: updatedLevelInfo,
      evaluation
    })

  } catch (error) {
    console.error('Error in POST /api/user/[id]/evaluate-promotion:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const userId = params.id

    // Check permissions
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para ver esta información' },
        { status: 403 }
      )
    }

    // Get current user level info and evaluation
    const levelInfo = await getUserLevelInfo(userId)

    if (!levelInfo) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Calculate progress percentage
    const calculateProgress = () => {
      const { evaluation } = levelInfo
      if (!evaluation) return 0

      if (evaluation.canPromote) return 100

      // Calculate based on requirements met
      let progress = 0
      
      // Direct referrals progress (50% weight)
      const directProgress = Math.min(evaluation.directReferrals / 3, 1) * 50
      progress += directProgress

      // Valid structure progress (50% weight)
      const structureProgress = Math.min(evaluation.validSecondLevelReferrals / 3, 1) * 50
      progress += structureProgress

      return Math.round(progress)
    }

    const progressPercentage = calculateProgress()

    return NextResponse.json({
      success: true,
      currentLevel: levelInfo.currentLevel,
      nextLevel: levelInfo.nextLevel,
      evaluation: levelInfo.evaluation,
      promotionHistory: levelInfo.promotionHistory,
      canPromote: levelInfo.canPromote,
      progress: {
        percentage: progressPercentage,
        directReferrals: {
          current: levelInfo.evaluation?.directReferrals || 0,
          required: 3,
          percentage: Math.round(Math.min((levelInfo.evaluation?.directReferrals || 0) / 3, 1) * 100)
        },
        validStructure: {
          current: levelInfo.evaluation?.validSecondLevelReferrals || 0,
          required: 3,
          percentage: Math.round(Math.min((levelInfo.evaluation?.validSecondLevelReferrals || 0) / 3, 1) * 100)
        }
      },
      requirements: {
        met: levelInfo.evaluation?.canPromote || false,
        missing: levelInfo.evaluation?.missingRequirements || [],
        description: levelInfo.evaluation?.requiredStructure || ''
      }
    })

  } catch (error) {
    console.error('Error in GET /api/user/[id]/evaluate-promotion:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 