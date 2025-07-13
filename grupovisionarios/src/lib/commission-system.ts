import { PrismaClient, Prisma as PrismaNS } from '@prisma/client'
import { Level } from '@/types'

// Helper to convert Prisma Decimal (or number) to number safely
const toNumber = (value: any): number => {
  if (typeof value === 'number') return value
  if (value && typeof value.toNumber === 'function') return value.toNumber()
  return Number(value) || 0
}

// Convierte el modelo Level de Prisma (que usa Decimal) a nuestro tipo Level (que usa number)
const convertPrismaLevel = (lvl: any): Level => ({
  id: lvl.id,
  name: lvl.name,
  order: lvl.order,
  commissionRate: toNumber(lvl.commissionRate),
  requirementsDescription: lvl.requirementsDescription,
  color: lvl.color,
  icon: lvl.icon ?? '',
  isActive: (lvl.isActive ?? true) as boolean,
  createdAt: lvl.createdAt,
  updatedAt: lvl.updatedAt,
  requirements: {
    // Basado en los requerimientos según el nivel (orden)
    referrals: getLevelRequiredReferrals(lvl.order),
    earnings: 0 // No hay requisitos de ganancias específicos
  }
})

// Función para determinar el número de referidos directos requeridos por nivel
function getLevelRequiredReferrals(levelOrder: number): number {
  // Por defecto, la mayoría de niveles requieren 3 referidos directos
  switch (levelOrder) {
    case 1: return 3;  // Visionario Primeros 3
    case 2: return 3;  // Mentor 3 de 3 (con estructura 3x3)
    default: return 3; // Otros niveles requieren mantener 3 referidos
  }
}

const prisma = new PrismaClient()

export interface CommissionCalculation {
  userId: string
  baseAmount: number
  commissionRate: number
  commissionAmount: number
  level: Partial<Level>
  reason: string
}

export interface CommissionDistribution {
  referrer: CommissionCalculation
  secondLevel?: CommissionCalculation
  thirdLevel?: CommissionCalculation
  totalCommissions: number
  distributionTree: CommissionCalculation[]
}

/**
 * Calculate commission for a user based on their current level
 */
export async function calculateUserCommission(
  userId: string, 
  baseAmount: number,
  reason: string = 'Venta de afiliación'
): Promise<CommissionCalculation | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { level: true }
    })

    if (!user || !user.level) {
      console.warn(`User ${userId} not found or has no level assigned`)
      return null
    }

    const rate = toNumber(user.level.commissionRate)
    const commissionAmount = baseAmount * rate

    return {
      userId: user.id,
      baseAmount,
      commissionRate: rate,
      commissionAmount,
      level: convertPrismaLevel(user.level),
      reason
    }
  } catch (error) {
    console.error('Error calculating user commission:', error)
    return null
  }
}

/**
 * Calculate and distribute commissions through the referral chain
 * Based on the multilevel structure with different rates per level
 */
export async function calculateMultilevelCommissions(
  originalBuyerId: string,
  baseAmount: number,
  maxLevels: number = 3
): Promise<CommissionDistribution> {
  const distributionTree: CommissionCalculation[] = []
  let totalCommissions = 0

  try {
    // Get the buyer and start tracing up the referral chain
    const buyer = await prisma.user.findUnique({
      where: { id: originalBuyerId },
      include: { 
        level: true,
        referredByUser: {
          include: { level: true }
        }
      }
    })

    if (!buyer) {
      throw new Error('Buyer not found')
    }

    // Start with the direct referrer (1st level)
    let currentUser = buyer.referredByUser
    let level = 1

    while (currentUser && level <= maxLevels) {
      if (currentUser.level) {
        // Calculate commission based on user's current level
        const commission = await calculateUserCommission(
          currentUser.id,
          baseAmount,
          `Comisión nivel ${level} por venta de ${buyer.name}`
        )

        if (commission) {
          distributionTree.push(commission)
          totalCommissions += toNumber(commission.commissionAmount)
        }
      }

      // Move up the chain
      const nextUser = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: { 
          level: true,
          referredByUser: {
            include: { level: true }
          }
        }
      })

      currentUser = nextUser?.referredByUser || null
      level++
    }

    // Structure the response for easy access
    const result: CommissionDistribution = {
      referrer: distributionTree[0] as CommissionCalculation,
      secondLevel: distributionTree[1],
      thirdLevel: distributionTree[2],
      totalCommissions,
      distributionTree
    }

    return result
  } catch (error) {
    console.error('Error calculating multilevel commissions:', error)
    return {
      referrer: {} as CommissionCalculation,
      totalCommissions: 0,
      distributionTree: []
    }
  }
}

/**
 * Process and record commission payments
 */
export async function processCommissionPayments(
  distribution: CommissionDistribution,
  paymentId: string,
  description: string = 'Comisión por venta'
): Promise<{
  success: boolean
  processedCommissions: any[]
  totalProcessed: number
  errors: string[]
}> {
  const processedCommissions: any[] = []
  const errors: string[] = []
  let totalProcessed = 0

  try {
    // Process each commission in the distribution tree
    for (const commission of distribution.distributionTree) {
      try {
        // Create payment record for this commission
        const payment = await prisma.payment.create({
          data: {
            userId: commission.userId,
            amount: toNumber(commission.commissionAmount),
            currency: 'COP',
            status: 'COMPLETED',
            paymentMethod: 'commission',
            description: `${description} - ${commission.reason}`,
            metadata: {
              originalPaymentId: paymentId,
              commissionLevel: (commission.level as any).order,
              commissionRate: commission.commissionRate,
              baseAmount: commission.baseAmount
            }
          }
        })

        // Create referral record if not exists
        await prisma.referral.upsert({
          where: {
            referrerId_referredId: {
              referrerId: commission.userId,
              referredId: paymentId // Using paymentId as a reference
            }
          },
          update: {
            commission: toNumber(commission.commissionAmount),
            status: 'PAID'
          },
          create: {
            referrerId: commission.userId,
            referredId: paymentId,
            level: (commission.level as any).order,
            commission: toNumber(commission.commissionAmount),
            status: 'PAID'
          }
        })

        processedCommissions.push({
          userId: commission.userId,
          paymentId: payment.id,
          amount: commission.commissionAmount,
          level: (commission.level as any).name
        })

        totalProcessed += toNumber(commission.commissionAmount)

      } catch (error) {
        console.error(`Error processing commission for user ${commission.userId}:`, error)
        errors.push(`Error procesando comisión para usuario ${commission.userId}`)
      }
    }

    return {
      success: errors.length === 0,
      processedCommissions,
      totalProcessed,
      errors
    }

  } catch (error) {
    console.error('Error processing commission payments:', error)
    return {
      success: false,
      processedCommissions,
      totalProcessed,
      errors: ['Error general procesando comisiones']
    }
  }
}

/**
 * Get commission history for a user
 */
export async function getUserCommissionHistory(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    const skip = (page - 1) * limit

    const [commissions, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          userId,
          paymentMethod: 'commission'
        },
        include: {
          user: {
            include: { level: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.payment.count({
        where: {
          userId,
          paymentMethod: 'commission'
        }
      })
    ])

    // Calculate totals
    const totalEarned = await prisma.payment.aggregate({
      where: {
        userId,
        paymentMethod: 'commission',
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    })

    const pendingEarnings = await prisma.payment.aggregate({
      where: {
        userId,
        paymentMethod: 'commission',
        status: 'PENDING'
      },
      _sum: { amount: true }
    })

    return {
      commissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalEarned: totalEarned._sum.amount || 0,
        pendingEarnings: pendingEarnings._sum.amount || 0,
        totalCommissions: total
      }
    }

  } catch (error) {
    console.error('Error fetching commission history:', error)
    return {
      commissions: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      summary: { totalEarned: 0, pendingEarnings: 0, totalCommissions: 0 }
    }
  }
}

/**
 * Calculate potential earnings for a user based on their current level
 */
export async function calculatePotentialEarnings(
  userId: string,
  projectedSales: number = 1000000 // 1M COP default
): Promise<{
  currentLevel: Level
  currentRate: number
  monthlyPotential: number
  yearlyPotential: number
  nextLevel?: Level
  nextLevelPotential?: number
  improvementAmount?: number
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { level: true }
    })

    if (!user || !user.level) {
      throw new Error('User or level not found')
    }

    const currentRate = toNumber(user.level.commissionRate)
    const monthlyPotential = projectedSales * currentRate
    const yearlyPotential = monthlyPotential * 12

    // Get next level
    const nextLevel = await prisma.level.findFirst({
      where: {
        order: user.level.order + 1
      }
    })

    let nextLevelPotential: number | undefined
    let improvementAmount: number | undefined

    if (nextLevel) {
      nextLevelPotential = projectedSales * toNumber(nextLevel.commissionRate)
      improvementAmount = nextLevelPotential - monthlyPotential
    }

    return {
      currentLevel: convertPrismaLevel(user.level),
      currentRate,
      monthlyPotential,
      yearlyPotential,
      nextLevel: nextLevel ? convertPrismaLevel(nextLevel) : undefined,
      nextLevelPotential,
      improvementAmount
    }

  } catch (error) {
    console.error('Error calculating potential earnings:', error)
    throw error
  }
}

/**
 * Generate commission report for admin dashboard
 */
export async function generateCommissionReport(
  startDate: Date,
  endDate: Date
) {
  try {
    const commissions = await prisma.payment.findMany({
      where: {
        paymentMethod: 'commission',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: {
          include: { level: true }
        }
      }
    })

    // Group by level
    const byLevel = commissions.reduce((acc, commission) => {
      const levelName = ((commission as any).user as any)?.level?.name || 'Sin nivel'
      if (!acc[levelName]) {
        acc[levelName] = {
          count: 0,
          totalAmount: 0,
          users: new Set()
        }
      }
      acc[levelName].count++
      acc[levelName].totalAmount += toNumber(commission.amount)
      acc[levelName].users.add(commission.userId)
      return acc
    }, {} as Record<string, any>)

    // Calculate totals
    const totalCommissions = commissions.reduce((sum, c) => sum + toNumber(c.amount), 0)
    const totalPayments = commissions.length
    const uniqueUsers = new Set(commissions.map(c => c.userId)).size

    return {
      summary: {
        totalCommissions,
        totalPayments,
        uniqueUsers,
        averageCommission: totalCommissions / totalPayments || 0
      },
      byLevel: Object.entries(byLevel).map(([level, data]) => ({
        level,
        count: data.count,
        totalAmount: data.totalAmount,
        uniqueUsers: data.users.size,
        averageAmount: data.totalAmount / data.count
      })),
      rawData: commissions
    }

  } catch (error) {
    console.error('Error generating commission report:', error)
    throw error
  }
}

/**
 * Update legacy commission rates to new system
 * This is a migration helper function
 */
export async function migrateLegacyCommissions() {
  try {
    // Get all payments with old commission structure
    const legacyPayments = await prisma.payment.findMany({
      where: {
        paymentMethod: 'commission',
        metadata: {
          path: ['migrated'],
          equals: PrismaNS.DbNull
        }
      },
      include: {
        user: {
          include: { level: true }
        }
      }
    })

    let migratedCount = 0

    for (const payment of legacyPayments) {
      if (payment.user.level) {
        // Recalculate commission based on current level
        const originalAmount = toNumber((payment.metadata as any)?.baseAmount || payment.amount)
        const newCommission = originalAmount * toNumber((payment.user as any).level?.commissionRate ?? 0)

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            amount: newCommission,
            metadata: {
              ...(payment.metadata as any || {}),
              migrated: true,
              originalAmount: Number(payment.amount),
              newCommissionRate: toNumber((payment.user as any).level?.commissionRate ?? 0)
            }
          }
        })

        migratedCount++
      }
    }

    return {
      success: true,
      migratedCount,
      message: `Successfully migrated ${migratedCount} commission payments`
    }

  } catch (error) {
    console.error('Error migrating legacy commissions:', error)
    return {
      success: false,
      migratedCount: 0,
      message: 'Error migrating commissions',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 