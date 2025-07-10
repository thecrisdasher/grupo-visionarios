import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Types for the multilevel system
export interface UserReferralStructure {
  id: string
  name: string
  email: string
  level: {
    id: string
    name: string
    order: number
    color: string
    icon: string | null // icono puede ser nulo en la tabla Level
  }
  directReferrals: UserReferralStructure[]
  referralCount: number
  isActive: boolean
  joinDate: Date
}

export interface PromotionEvaluation {
  canPromote: boolean
  currentLevel: number
  nextLevel?: number
  directReferrals: number
  validSecondLevelReferrals: number
  requiredStructure: string
  missingRequirements?: string[]
}

/**
 * Get direct referrals for a user
 */
export async function getDirectReferrals(userId: string) {
  try {
    const referrals = await prisma.user.findMany({
      where: { 
        referredBy: userId,
        isActive: true 
      },
      include: {
        level: true,
        referrals: {
          where: { isActive: true },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return referrals.map(user => ({
      ...user,
      referralCount: user.referrals.length
    }))
  } catch (error) {
    console.error('Error fetching direct referrals:', error)
    return []
  }
}

/**
 * Check if each of the 3 direct referrals has at least 3 referrals
 */
export async function hasThreeReferralsEach(referrals: any[]): Promise<boolean> {
  if (referrals.length < 3) return false

  // Check the first 3 referrals (most important ones)
  const firstThreeReferrals = referrals.slice(0, 3)
  
  for (const referral of firstThreeReferrals) {
    const referralCount = await prisma.user.count({
      where: { 
        referredBy: referral.id,
        isActive: true 
      }
    })
    
    if (referralCount < 3) {
      return false
    }
  }
  
  return true
}

/**
 * Get the complete referral structure for a user (tree format)
 */
export async function getUserReferralStructure(userId: string, maxDepth: number = 3): Promise<UserReferralStructure | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        level: true
      }
    })

    if (!user) return null
    if (!user.level) {
      throw new Error('El usuario no tiene nivel asignado')
    }

    const directReferrals = await getDirectReferralsRecursive(userId, maxDepth)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      level: {
        id: user.level!.id,
        name: user.level!.name,
        order: user.level!.order,
        color: user.level!.color,
        icon: user.level!.icon ?? null
      },
      directReferrals,
      referralCount: directReferrals.length,
      isActive: user.isActive,
      joinDate: user.createdAt
    }
  } catch (error) {
    console.error('Error fetching user referral structure:', error)
    return null
  }
}

/**
 * Helper function to get referrals recursively
 */
async function getDirectReferralsRecursive(userId: string, depth: number): Promise<UserReferralStructure[]> {
  if (depth <= 0) return []

  const referrals = await prisma.user.findMany({
    where: { 
      referredBy: userId,
      isActive: true 
    },
    include: {
      level: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const result: UserReferralStructure[] = []
  
  for (const referral of referrals) {
    const childReferrals = await getDirectReferralsRecursive(referral.id, depth - 1)
    
    result.push({
      id: referral.id,
      name: referral.name,
      email: referral.email,
      level: {
        id: referral.level!.id,
        name: referral.level!.name,
        order: referral.level!.order,
        color: referral.level!.color,
        icon: referral.level!.icon ?? null
      },
      directReferrals: childReferrals,
      referralCount: childReferrals.length,
      isActive: referral.isActive,
      joinDate: referral.createdAt
    })
  }

  return result
}

/**
 * Evaluate if a user can be promoted to the next level
 */
export async function evaluateUserPromotion(userId: string): Promise<PromotionEvaluation> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { level: true }
    })

    if (!user) {
      throw new Error('User not found')
    }
    if (!user.level) {
      throw new Error('User does not have an assigned level')
    }

    const directReferrals = await getDirectReferrals(userId)
    const directReferralsCount = directReferrals.length
    
    // Check if user has at least 3 direct referrals
    if (directReferralsCount < 3) {
      return {
        canPromote: false,
        currentLevel: user.level!.order,
        directReferrals: directReferralsCount,
        validSecondLevelReferrals: 0,
        requiredStructure: '3 referidos directos + 9 referidos indirectos (3x3)',
        missingRequirements: [`Necesitas ${3 - directReferralsCount} referidos directos más`]
      }
    }

    // Check if the first 3 referrals each have at least 3 referrals (3x3 structure)
    const hasValidStructure = await hasThreeReferralsEach(directReferrals)
    
    if (!hasValidStructure) {
      // Count how many of the first 3 have valid structures
      const firstThree = directReferrals.slice(0, 3)
      let validCount = 0
      const missingRequirements: string[] = []

      for (let i = 0; i < firstThree.length; i++) {
        const referralCount = await prisma.user.count({
          where: { 
            referredBy: firstThree[i].id,
            isActive: true 
          }
        })
        
        if (referralCount >= 3) {
          validCount++
        } else {
          missingRequirements.push(
            `${firstThree[i].name} necesita ${3 - referralCount} referidos más`
          )
        }
      }

      return {
        canPromote: false,
        currentLevel: user.level!.order,
        directReferrals: directReferralsCount,
        validSecondLevelReferrals: validCount,
        requiredStructure: '3 referidos directos + 9 referidos indirectos (3x3)',
        missingRequirements
      }
    }

    // Get next level
    const nextLevel = await prisma.level.findFirst({
      where: { 
        order: user.level!.order + 1
      }
    })

    return {
      canPromote: true,
      currentLevel: user.level!.order,
      nextLevel: nextLevel?.order,
      directReferrals: directReferralsCount,
      validSecondLevelReferrals: 3,
      requiredStructure: '3 referidos directos + 9 referidos indirectos (3x3)'
    }

  } catch (error) {
    console.error('Error evaluating user promotion:', error)
    throw error
  }
}

/**
 * Promote user to the next level
 */
export async function promoteUser(userId: string): Promise<{ success: boolean; newLevel?: any; error?: string }> {
  try {
    const evaluation = await evaluateUserPromotion(userId)
    
    if (!evaluation.canPromote) {
      return {
        success: false,
        error: `No cumple los requisitos: ${evaluation.missingRequirements?.join(', ')}`
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { level: true }
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }
    if (!user.level) {
      return { success: false, error: 'El usuario no tiene nivel asignado' }
    }

    const nextLevel = await prisma.level.findFirst({
      where: { 
        order: user.level!.order + 1
      }
    })

    if (!nextLevel) {
      return { success: false, error: 'No hay siguiente nivel disponible' }
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user level
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { levelId: nextLevel.id },
        include: { level: true }
      })

      // Create promotion record
      await tx.promotion.create({
        data: {
          userId,
          fromLevelId: user.level!.id,
          toLevelId: nextLevel.id,
          reason: 'Promoción automática',
          metadata: {
            directReferrals: evaluation.directReferrals,
            validStructure: true
          }
        }
      })

      return updatedUser
    })

    return {
      success: true,
      newLevel: result.level
    }

  } catch (error) {
    console.error('Error promoting user:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

/**
 * Register a new referral and check for automatic promotion
 */
export async function registerReferralAndEvaluate(referrerId: string, referredUserId: string): Promise<{
  success: boolean
  referralCreated: boolean
  promotionEvaluated: boolean
  promoted?: boolean
  newLevel?: any
  error?: string
}> {
  try {
    // Create referral record
    const referral = await prisma.referral.create({
      data: {
        referrerId,
        referredId: referredUserId,
        level: 1,
        commission: 0, // Will be calculated based on level
        status: 'APPROVED'
      }
    })

    // Evaluate if referrer can be promoted
    const evaluation = await evaluateUserPromotion(referrerId)
    let promotionResult = null

    if (evaluation.canPromote) {
      promotionResult = await promoteUser(referrerId)
    }

    return {
      success: true,
      referralCreated: true,
      promotionEvaluated: true,
      promoted: promotionResult?.success || false,
      newLevel: promotionResult?.newLevel
    }

  } catch (error) {
    console.error('Error registering referral and evaluating promotion:', error)
    return {
      success: false,
      referralCreated: false,
      promotionEvaluated: false,
      error: 'Error interno del servidor'
    }
  }
}

/**
 * Get user's current level info with progress
 */
export async function getUserLevelInfo(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        level: true,
        promotionHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) return null
    if (!user.level) {
      throw new Error('El usuario no tiene nivel asignado')
    }
    
    const evaluation = await evaluateUserPromotion(userId)
    
    const nextLevel = await prisma.level.findFirst({
      where: { 
        order: user.level!.order + 1
      }
    })

    return {
      currentLevel: user.level!,
      nextLevel,
      evaluation,
      promotionHistory: user.promotionHistory,
      canPromote: evaluation.canPromote
    }

  } catch (error) {
    console.error('Error getting user level info:', error)
    return null
  }
} 