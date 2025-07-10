const prisma = require('@prisma/client').PrismaClient()

const levels = [
  {
    id: 'level_001',
    name: 'Visionario Primeros 3',
    order: 1,
    commissionRate: 0.15,
    requirementsDescription: 'Nivel inicial. Invita a 3 personas para ascender al siguiente nivel.',
    color: '#8B5CF6',
    icon: '👁️',
  },
  {
    id: 'level_002',
    name: 'Mentor 3 de 3',
    order: 2,
    commissionRate: 0.20,
    requirementsDescription: 'Tienes 3 referidos directos, cada uno debe invitar 3 más para ascender.',
    color: '#06B6D4',
    icon: '🎓',
  },
  {
    id: 'level_003',
    name: 'Guía',
    order: 3,
    commissionRate: 0.25,
    requirementsDescription: 'Estructura 3x3 completada. Mantén el crecimiento para seguir ascendiendo.',
    color: '#10B981',
    icon: '🧭',
  },
  {
    id: 'level_004',
    name: 'Master',
    order: 4,
    commissionRate: 0.30,
    requirementsDescription: 'Dominio demostrado en el crecimiento de red. Sigue expandiendo tu estructura.',
    color: '#F59E0B',
    icon: '🏅',
  },
  {
    id: 'level_005',
    name: 'Guerrero',
    order: 5,
    commissionRate: 0.35,
    requirementsDescription: 'Luchador incansable por el crecimiento. Expande tu red de guerreros.',
    color: '#EF4444',
    icon: '⚔️',
  },
  {
    id: 'level_006',
    name: 'Gladiador',
    order: 6,
    commissionRate: 0.40,
    requirementsDescription: 'Campeón en la arena del marketing multinivel. Demuestra tu fuerza.',
    color: '#DC2626',
    icon: '🛡️',
  },
  {
    id: 'level_007',
    name: 'Líder',
    order: 7,
    commissionRate: 0.45,
    requirementsDescription: 'Capacidad de liderazgo demostrada. Guía a otros hacia el éxito.',
    color: '#7C3AED',
    icon: '👑',
  },
  {
    id: 'level_008',
    name: 'Oro',
    order: 8,
    commissionRate: 0.50,
    requirementsDescription: 'Valor como el oro en el sistema. Tu red brilla con éxito.',
    color: '#F59E0B',
    icon: '🥇',
  },
  {
    id: 'level_009',
    name: 'Platino',
    order: 9,
    commissionRate: 0.55,
    requirementsDescription: 'Prestigio y elegancia en tu estrategia. Un nivel de élite alcanzado.',
    color: '#6B7280',
    icon: '🥈',
  },
  {
    id: 'level_010',
    name: 'Corona',
    order: 10,
    commissionRate: 0.60,
    requirementsDescription: 'Realeza en el marketing multinivel. Tu corona representa tu imperio.',
    color: '#FBBF24',
    icon: '👑',
  },
  {
    id: 'level_011',
    name: 'Diamante',
    order: 11,
    commissionRate: 0.65,
    requirementsDescription: 'Dureza y brillantez inquebrantables. Pocos alcanzan este nivel.',
    color: '#3B82F6',
    icon: '💎',
  },
  {
    id: 'level_012',
    name: 'Águila Real',
    order: 12,
    commissionRate: 0.70,
    requirementsDescription: 'El nivel más alto. Vuelas por encima de todos con majestuosidad.',
    color: '#059669',
    icon: '🦅',
  },
]

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')
  
  for (const level of levels) {
    console.log(`⏳ Procesando nivel: ${level.name}`)
    await prisma.level.upsert({
      where: { id: level.id },
      update: level,
      create: level,
    })
    console.log(`✅ Nivel ${level.name} creado/actualizado`)
  }

  const count = await prisma.level.count()
  console.log(`\n📊 Total niveles en la base de datos: ${count}`)
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 