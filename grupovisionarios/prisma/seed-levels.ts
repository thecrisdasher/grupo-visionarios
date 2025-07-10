import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const levels = [
  {
    name: 'Visionario Primeros 3',
    order: 1,
    commissionRate: 15.00,
    requirementsDescription: 'Invita a tus primeros 3 afiliados directos para comenzar tu camino como Visionario',
    color: '#3B82F6', // Blue
    icon: '👁️',
    minDirectReferrals: 3,
    minIndirectReferrals: 0
  },
  {
    name: 'Mentor 3 de 3',
    order: 2,
    commissionRate: 20.00,
    requirementsDescription: 'Cada uno de tus 3 afiliados directos debe invitar al menos 3 personas (estructura 3x3)',
    color: '#10B981', // Green
    icon: '🎓',
    minDirectReferrals: 3,
    minIndirectReferrals: 9
  },
  {
    name: 'Guía',
    order: 3,
    commissionRate: 25.00,
    requirementsDescription: 'Demuestra liderazgo y construye una red sólida de 3 niveles de profundidad',
    color: '#8B5CF6', // Purple
    icon: '🧭',
    minDirectReferrals: 3,
    minIndirectReferrals: 27
  },
  {
    name: 'Master',
    order: 4,
    commissionRate: 30.00,
    requirementsDescription: 'Alcanza la maestría en construcción de redes con estructura avanzada',
    color: '#F59E0B', // Yellow
    icon: '👑',
    minDirectReferrals: 3,
    minIndirectReferrals: 81
  },
  {
    name: 'Guerrero',
    order: 5,
    commissionRate: 32.00,
    requirementsDescription: 'Lucha incansablemente por el crecimiento de tu red y el de otros',
    color: '#EF4444', // Red
    icon: '⚔️',
    minDirectReferrals: 3,
    minIndirectReferrals: 243
  },
  {
    name: 'Gladiador',
    order: 6,
    commissionRate: 35.00,
    requirementsDescription: 'Domina el arte del networking con fuerza y determinación',
    color: '#DC2626', // Dark Red
    icon: '🛡️',
    minDirectReferrals: 3,
    minIndirectReferrals: 729
  },
  {
    name: 'Líder',
    order: 7,
    commissionRate: 38.00,
    requirementsDescription: 'Inspira y guía a tu organización hacia nuevas alturas',
    color: '#7C3AED', // Indigo
    icon: '🚀',
    minDirectReferrals: 3,
    minIndirectReferrals: 2187
  },
  {
    name: 'Oro',
    order: 8,
    commissionRate: 40.00,
    requirementsDescription: 'Alcanza el nivel dorado de excelencia en construcción de redes',
    color: '#D97706', // Orange
    icon: '🥇',
    minDirectReferrals: 3,
    minIndirectReferrals: 6561
  },
  {
    name: 'Platino',
    order: 9,
    commissionRate: 42.00,
    requirementsDescription: 'Supera el oro y establece nuevos estándares de excelencia',
    color: '#6B7280', // Gray
    icon: '🥈',
    minDirectReferrals: 3,
    minIndirectReferrals: 19683
  },
  {
    name: 'Corona',
    order: 10,
    commissionRate: 45.00,
    requirementsDescription: 'Reina sobre una vasta red de visionarios comprometidos',
    color: '#F59E0B', // Amber
    icon: '👑',
    minDirectReferrals: 3,
    minIndirectReferrals: 59049
  },
  {
    name: 'Diamante',
    order: 11,
    commissionRate: 48.00,
    requirementsDescription: 'Brilla con la fuerza y resistencia del diamante más puro',
    color: '#06B6D4', // Cyan
    icon: '💎',
    minDirectReferrals: 3,
    minIndirectReferrals: 177147
  },
  {
    name: 'Águila Real',
    order: 12,
    commissionRate: 50.00,
    requirementsDescription: 'Vuela a las alturas más grandes como el líder supremo de la red',
    color: '#059669', // Emerald
    icon: '🦅',
    minDirectReferrals: 3,
    minIndirectReferrals: 531441
  }
]

async function seedLevels() {
  console.log('🌱 Iniciando seeding de niveles...')

  try {
    // Eliminar niveles existentes (opcional - solo para desarrollo)
    await prisma.level.deleteMany({})
    console.log('🗑️ Niveles existentes eliminados')

    // Crear niveles
    for (const level of levels) {
      const createdLevel = await prisma.level.create({
        data: level
      })
      console.log(`✅ Nivel creado: ${createdLevel.name} (Orden: ${createdLevel.order})`)
    }

    console.log('🎉 Seeding de niveles completado exitosamente!')
    
    // Mostrar resumen
    const totalLevels = await prisma.level.count()
    console.log(`📊 Total de niveles en la base de datos: ${totalLevels}`)

  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    throw error
  }
}

async function main() {
  await seedLevels()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

export { levels, seedLevels } 