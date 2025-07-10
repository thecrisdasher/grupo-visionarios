import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export interface User {
  id: string
  name: string
  email: string
  levelId: string | null
  referredBy: string | null
  directReferralsCount: number
  indirectReferralsCount: number
  totalEarnings: number | Prisma.Decimal // aceptar Decimal o number
  level?: Level | null
  referrals?: User[]
}

export interface Level {
  id: string
  name: string
  order: number
  commissionRate: number | Prisma.Decimal // aceptar Decimal o number
  requirementsDescription: string
  color: string
  icon?: string | null
  minDirectReferrals: number
  minIndirectReferrals: number
}

export interface NetworkStructure {
  user: User
  directReferrals: User[]
  indirectReferrals: User[]
  totalDepth: number
  qualifiesForPromotion: boolean
  nextLevel?: Level | null
}

// --------------------------------------------------------------
// Utilidades para convertir objetos de Prisma a los tipos planos
// --------------------------------------------------------------
function decimalToNumber(value: number | Prisma.Decimal | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  // Prisma.Decimal expone toNumber()
  return (value as Prisma.Decimal).toNumber()
}

function mapLevel(level: any): Level {
  return {
    ...level,
    commissionRate: decimalToNumber(level.commissionRate)
  }
}

function mapUser(user: any): User {
  return {
    ...user,
    totalEarnings: decimalToNumber(user.totalEarnings),
    level: user.level ? mapLevel(user.level) : null
  }
}
// --------------------------------------------------------------

/**
 * Obtiene los referidos directos de un usuario
 */
export async function getDirectReferrals(userId: string): Promise<User[]> {
  try {
    const referralsRaw = await prisma.user.findMany({
      where: {
        referredBy: userId,
        isActive: true
      },
      include: {
        level: true,
        referrals: {
          where: { isActive: true },
          include: { level: true }
        }
      }
    })

    const referrals: User[] = referralsRaw.map((r: any) => mapUser(r))

    return referrals
  } catch (error) {
    console.error('Error fetching direct referrals:', error)
    return []
  }
}

/**
 * Verifica si cada uno de los referidos directos tiene al menos 3 referidos
 */
export async function hasThreeReferralsEach(referrals: User[]): Promise<boolean> {
  if (referrals.length < 3) return false

  for (const referral of referrals) {
    const directCount = await prisma.user.count({
      where: {
        referredBy: referral.id,
        isActive: true
      }
    })

    if (directCount < 3) {
      return false
    }
  }

  return true
}

/**
 * Calcula la estructura completa de la red de un usuario
 */
export async function calculateNetworkStructure(userId: string): Promise<NetworkStructure> {
  const userRaw = await prisma.user.findUnique({
    where: { id: userId },
    include: { level: true }
  })
  const user: User | null = userRaw ? mapUser(userRaw) : null

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  const directReferrals = await getDirectReferrals(userId)
  
  // Calcular referidos indirectos recursivamente
  let indirectReferrals: User[] = []
  let totalDepth = 0

  for (const direct of directReferrals) {
    const indirectFromThisUser = await getIndirectReferrals(direct.id, 1, 5) // Max 5 niveles de profundidad
    indirectReferrals = [...indirectReferrals, ...indirectFromThisUser.referrals]
    totalDepth = Math.max(totalDepth, indirectFromThisUser.depth + 1)
  }

  // Actualizar contadores en la base de datos
  await prisma.user.update({
    where: { id: userId },
    data: {
      directReferralsCount: directReferrals.length,
      indirectReferralsCount: indirectReferrals.length
    }
  })

  // Verificar si califica para promoción
  const qualifiesForPromotion = await evaluatePromotionEligibility(userId, directReferrals, indirectReferrals)
  
  // Obtener siguiente nivel
  const nextLevel = await getNextLevel(user.levelId)

  return {
    user,
    directReferrals,
    indirectReferrals,
    totalDepth,
    qualifiesForPromotion,
    nextLevel
  }
}

/**
 * Obtiene referidos indirectos recursivamente
 */
async function getIndirectReferrals(userId: string, currentDepth: number, maxDepth: number): Promise<{ referrals: User[], depth: number }> {
  if (currentDepth >= maxDepth) {
    return { referrals: [], depth: currentDepth }
  }

  const directReferrals = await getDirectReferrals(userId)
  let allIndirectReferrals: User[] = []
  let maxDepthFound = currentDepth

  for (const direct of directReferrals) {
    const indirectResult = await getIndirectReferrals(direct.id, currentDepth + 1, maxDepth)
    allIndirectReferrals = [...allIndirectReferrals, ...indirectResult.referrals]
    maxDepthFound = Math.max(maxDepthFound, indirectResult.depth)
  }

  return {
    referrals: [...directReferrals, ...allIndirectReferrals],
    depth: maxDepthFound
  }
}

/**
 * Evalúa si un usuario es elegible para promoción
 */
export async function evaluatePromotionEligibility(userId: string, directReferrals: User[], indirectReferrals: User[]): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { level: true }
  })

  if (!user) return false

  const nextLevel = await getNextLevel(user.levelId)
  if (!nextLevel) return false

  // Verificar requisitos mínimos
  const hasEnoughDirect = directReferrals.length >= nextLevel.minDirectReferrals
  const hasEnoughIndirect = indirectReferrals.length >= nextLevel.minIndirectReferrals

  // Verificar estructura 3x3 específica
  if (nextLevel.order >= 2) {
    const hasValidStructure = await hasThreeReferralsEach(directReferrals.slice(0, 3))
    return hasEnoughDirect && hasEnoughIndirect && hasValidStructure
  }

  return hasEnoughDirect && hasEnoughIndirect
}

/**
 * Promociona un usuario al siguiente nivel
 */
export async function promoteUser(userId: string): Promise<{ success: boolean, newLevel?: Level, error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { level: true }
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    const nextLevel = await getNextLevel(user.levelId)
    if (!nextLevel) {
      return { success: false, error: 'No hay nivel siguiente disponible' }
    }

    // Verificar elegibilidad
    const structure = await calculateNetworkStructure(userId)
    if (!structure.qualifiesForPromotion) {
      return { success: false, error: 'El usuario no cumple los requisitos para promoción' }
    }

    // Realizar la promoción
    await prisma.$transaction([
      // Actualizar nivel del usuario
      prisma.user.update({
        where: { id: userId },
        data: {
          levelId: nextLevel.id,
          lastPromotionAt: new Date()
        }
      }),
      // Registrar en historial de promociones
      prisma.promotion.create({
        data: {
          userId,
          fromLevelId: user.levelId,
          toLevelId: nextLevel.id,
          reason: 'Automatic promotion - Requirements met',
          metadata: {
            directReferrals: structure.directReferrals.length,
            indirectReferrals: structure.indirectReferrals.length,
            evaluatedAt: new Date().toISOString()
          }
        }
      })
    ])

    return { success: true, newLevel: nextLevel }
  } catch (error) {
    console.error('Error promoting user:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

/**
 * Obtiene el siguiente nivel basado en el nivel actual
 */
export async function getNextLevel(currentLevelId: string | null): Promise<Level | null> {
  try {
    if (!currentLevelId) {
      // Si no tiene nivel, obtener el primer nivel
      const nextLevelRaw = await prisma.level.findFirst({
        where: { order: 1 }
      })
      return nextLevelRaw ? mapLevel(nextLevelRaw) : null
    }

    const currentLevelRaw = await prisma.level.findUnique({
      where: { id: currentLevelId }
    })

    if (!currentLevelRaw) return null

    // Obtener el siguiente nivel
    const nextLevelRaw = await prisma.level.findFirst({
      where: { order: currentLevelRaw.order + 1 }
    })
    return nextLevelRaw ? mapLevel(nextLevelRaw) : null
  } catch (error) {
    console.error('Error getting next level:', error)
    return null
  }
}

/**
 * Obtiene todos los niveles ordenados
 */
export async function getAllLevels(): Promise<Level[]> {
  try {
    const levelsRaw = await prisma.level.findMany({
      orderBy: { order: 'asc' }
    })
    return levelsRaw.map((lvl: any) => mapLevel(lvl))
  } catch (error) {
    console.error('Error fetching levels:', error)
    return []
  }
}

/**
 * Evalúa promociones para todos los usuarios activos (para cronjob)
 */
export async function evaluateAllPromotions(): Promise<{ promoted: number, evaluated: number }> {
  try {
    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: 'AFFILIATE'
      },
      include: { level: true }
    })

    let promoted = 0
    const evaluated = activeUsers.length

    for (const user of activeUsers) {
      const structure = await calculateNetworkStructure(user.id)
      if (structure.qualifiesForPromotion) {
        const result = await promoteUser(user.id)
        if (result.success) {
          promoted++
          console.log(`✅ Usuario ${user.name} promovido a ${result.newLevel?.name}`)
        }
      }
    }

    return { promoted, evaluated }
  } catch (error) {
    console.error('Error evaluating all promotions:', error)
    return { promoted: 0, evaluated: 0 }
  }
}

/**
 * Calcula las comisiones basadas en el nivel del usuario
 */
export async function calculateCommission(userId: string, baseAmount: number): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { level: true }
    })

    if (!user || !user.level) {
      // Comisión base si no tiene nivel
      return baseAmount * 0.10 // 10%
    }

    return baseAmount * (decimalToNumber(user.level.commissionRate) / 100)
  } catch (error) {
    console.error('Error calculating commission:', error)
    return 0
  }
}

/**
 * Registra un nuevo referido y evalúa promociones
 */
export async function registerReferral(referrerId: string, referredId: string): Promise<{ success: boolean, promotionResult?: any }> {
  try {
    // Registrar el referido
    await prisma.user.update({
      where: { id: referredId },
      data: { referredBy: referrerId }
    })

    // Crear registro en tabla de referrals
    await prisma.referral.create({
      data: {
        referrerId,
        referredId,
        level: 1,
        commission: 0, // Se calculará después
        status: 'APPROVED'
      }
    })

    // Evaluar promoción del referrer
    const structure = await calculateNetworkStructure(referrerId)
    let promotionResult = null

    if (structure.qualifiesForPromotion) {
      promotionResult = await promoteUser(referrerId)
    }

    return { success: true, promotionResult }
  } catch (error) {
    console.error('Error registering referral:', error)
    return { success: false }
  }
} 