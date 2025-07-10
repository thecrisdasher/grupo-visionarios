import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getUserReferralStructure } from '@/lib/multilevel-system'

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
    const { searchParams } = new URL(request.url)
    const maxDepth = parseInt(searchParams.get('depth') || '3')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Check if user has permission to view this structure
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para ver esta estructura' },
        { status: 403 }
      )
    }

    // Get the complete referral structure
    const structure = await getUserReferralStructure(userId, maxDepth)

    if (!structure) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Calculate structure statistics
    const calculateStats = (node: any): any => {
      const directCount = node.directReferrals.length
      let totalCount = directCount
      let activeCount = node.directReferrals.filter((r: any) => r.isActive).length
      let totalDepth = 0

      for (const child of node.directReferrals) {
        const childStats = calculateStats(child)
        totalCount += childStats.total
        activeCount += childStats.active
        totalDepth = Math.max(totalDepth, childStats.depth + 1)
      }

      return {
        direct: directCount,
        total: totalCount,
        active: activeCount,
        depth: totalDepth
      }
    }

    const stats = calculateStats(structure)

    // Check 3x3 structure validation
    const validateStructure = (node: any): {
      hasThreeDirects: boolean
      directsWithThree: number
      isValid3x3: boolean
    } => {
      const directReferrals = node.directReferrals || []
      const hasThreeDirects = directReferrals.length >= 3
      
      let directsWithThree = 0
      if (hasThreeDirects) {
        for (let i = 0; i < Math.min(3, directReferrals.length); i++) {
          const childDirects = directReferrals[i].directReferrals?.length || 0
          if (childDirects >= 3) {
            directsWithThree++
          }
        }
      }

      const isValid3x3 = hasThreeDirects && directsWithThree >= 3

      return {
        hasThreeDirects,
        directsWithThree,
        isValid3x3
      }
    }

    const structureValidation = validateStructure(structure)

    // Format response
    const responseData = {
      success: true,
      user: {
        id: structure.id,
        name: structure.name,
        email: structure.email,
        level: structure.level,
        isActive: structure.isActive,
        joinDate: structure.joinDate
      },
      structure: structure.directReferrals,
      statistics: {
        directReferrals: stats.direct,
        totalReferrals: stats.total,
        activeReferrals: stats.active,
        maxDepth: stats.depth,
        ...structureValidation
      },
      validation: {
        canPromote: structureValidation.isValid3x3,
        requirements: {
          directReferrals: {
            required: 3,
            current: stats.direct,
            met: stats.direct >= 3
          },
          secondLevelReferrals: {
            required: 3,
            current: structureValidation.directsWithThree,
            met: structureValidation.directsWithThree >= 3
          }
        }
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error in GET /api/user/[id]/structure:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 