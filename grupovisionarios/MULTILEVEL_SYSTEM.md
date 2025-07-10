# Sistema Multinivel Escalonado 3x3 - Grupo Visionarios

## 🎯 Descripción General

Este sistema implementa un programa de afiliados multinivel con estructura escalonada 3x3, donde los usuarios solo pueden ascender de nivel cuando:
1. Tienen al menos 3 referidos directos
2. Cada uno de esos 3 referidos también tiene al menos 3 referidos propios

## 📊 Niveles del Sistema

| Orden | Nombre | Comisión | Ícono | Color |
|-------|--------|----------|-------|-------|
| 1 | Visionario Primeros 3 | 15% | 👁️ | #8B5CF6 |
| 2 | Mentor 3 de 3 | 20% | 🎓 | #06B6D4 |
| 3 | Guía | 25% | 🧭 | #10B981 |
| 4 | Master | 30% | 🏅 | #F59E0B |
| 5 | Guerrero | 35% | ⚔️ | #EF4444 |
| 6 | Gladiador | 40% | 🛡️ | #DC2626 |
| 7 | Líder | 45% | 👑 | #7C3AED |
| 8 | Oro | 50% | 🥇 | #F59E0B |
| 9 | Platino | 55% | 🥈 | #6B7280 |
| 10 | Corona | 60% | 👑 | #FBBF24 |
| 11 | Diamante | 65% | 💎 | #3B82F6 |
| 12 | Águila Real | 70% | 🦅 | #059669 |

## 🗄️ Estructura de Base de Datos

### Tabla `levels`
```sql
- id (String, PK)
- name (String, único)
- order (Int, único, 1-12)
- commissionRate (Decimal, 0.0000-1.0000)
- requirementsDescription (String)
- color (String, hex color)
- icon (String, emoji)
- isActive (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Tabla `users` (modificada)
```sql
- levelId (String, FK to levels)
- level (Relación)
- levelPromotions (Relación)
```

### Tabla `level_promotions`
```sql
- id (String, PK)
- userId (String, FK)
- fromLevelId (String, FK, opcional)
- toLevelId (String, FK)
- promotedAt (DateTime)
- reason (String)
- directReferrals (Int)
- validStructure (Boolean)
```

## 🔧 API Endpoints

### POST `/api/referrals`
Registra un nuevo referido y evalúa promoción automática.

```typescript
// Request
{
  referredUserId: string,
  referrerCode?: string // opcional
}

// Response
{
  success: boolean,
  referralCreated: boolean,
  promoted: boolean,
  newLevel?: Level,
  message: string
}
```

### GET `/api/user/[id]/structure`
Obtiene la estructura de árbol de referidos.

```typescript
// Query params: depth=3, includeInactive=false

// Response
{
  success: boolean,
  user: UserInfo,
  structure: UserReferralStructure[],
  statistics: {
    directReferrals: number,
    totalReferrals: number,
    hasThreeDirects: boolean,
    directsWithThree: number,
    isValid3x3: boolean
  }
}
```

### GET/POST `/api/user/[id]/evaluate-promotion`
Evalúa y ejecuta promociones de nivel.

```typescript
// GET Response
{
  currentLevel: Level,
  nextLevel?: Level,
  evaluation: PromotionEvaluation,
  canPromote: boolean,
  progress: {
    percentage: number,
    directReferrals: ProgressInfo,
    validStructure: ProgressInfo
  }
}

// POST Request
{
  forcePromotion?: boolean // solo admin
}
```

## 📱 Componentes React

### `LevelDisplay`
Muestra el nivel actual del usuario con estilo visual.

```tsx
<LevelDisplay 
  level={currentLevel}
  evaluation={evaluation}
  showProgress={true}
  size="lg"
  variant="card"
/>
```

### `ReferralTree`
Visualiza la estructura de referidos en formato árbol.

```tsx
<ReferralTree
  structure={userStructure}
  maxDepth={3}
  interactive={true}
  showStats={true}
  onNodeClick={(node) => console.log(node)}
/>
```

### `MultilevelDashboard`
Dashboard completo con estadísticas y controles.

```tsx
<MultilevelDashboard
  user={user}
  currentLevel={currentLevel}
  nextLevel={nextLevel}
  evaluation={evaluation}
  structure={structure}
/>
```

### `LevelUpNotification`
Notificación animada para ascensos de nivel.

```tsx
const { showLevelUp, hideLevelUp, isVisible } = useLevelUpNotification()

// Mostrar cuando asciende
showLevelUp(fromLevel, toLevel, benefits)
```

## ⚙️ Funciones Principales

### `evaluateUserPromotion(userId: string)`
Evalúa si un usuario puede ser promovido.

```typescript
const evaluation = await evaluateUserPromotion(userId)
console.log(evaluation.canPromote) // boolean
console.log(evaluation.missingRequirements) // string[]
```

### `promoteUser(userId: string)`
Ejecuta la promoción de un usuario.

```typescript
const result = await promoteUser(userId)
if (result.success) {
  console.log(result.newLevel)
}
```

### `getUserReferralStructure(userId: string)`
Obtiene la estructura completa de referidos.

```typescript
const structure = await getUserReferralStructure(userId, 3)
console.log(structure.directReferrals.length)
```

## 💰 Sistema de Comisiones

### Cálculo Automático
Las comisiones se calculan automáticamente basadas en el `level.commissionRate`:

```typescript
const commission = await calculateUserCommission(userId, saleAmount)
console.log(commission.commissionAmount) // saleAmount * level.commissionRate
```

### Distribución Multinivel
El sistema puede distribuir comisiones hasta 3 niveles:

```typescript
const distribution = await calculateMultilevelCommissions(buyerId, amount)
console.log(distribution.referrer) // 1er nivel
console.log(distribution.secondLevel) // 2do nivel  
console.log(distribution.thirdLevel) // 3er nivel
```

## 🔄 Migración de Datos

### Seed de Niveles
```bash
cd grupovisionarios
npx prisma db seed
```

### Migración de Comisiones Existentes
```typescript
const result = await migrateLegacyCommissions()
console.log(result.migratedCount)
```

## 📈 Validación 3x3

El sistema valida automáticamente la estructura 3x3:

1. **3 Referidos Directos**: Usuario debe tener exactamente 3+ referidos directos
2. **Cada uno con 3**: Los primeros 3 referidos deben tener 3+ referidos cada uno
3. **Ascenso Automático**: Cuando se cumple, el usuario asciende automáticamente

### Ejemplo de Estructura Válida:
```
👤 Usuario Principal
├── 👤 Referido 1 (3+ referidos) ✅
├── 👤 Referido 2 (3+ referidos) ✅  
└── 👤 Referido 3 (3+ referidos) ✅
```

## 🎨 Personalización Visual

### Colores por Nivel
Cada nivel tiene un color único que se aplica a:
- Bordes y fondos de componentes
- Indicadores de progreso  
- Notificaciones
- Badges de nivel

### Iconos Temáticos
Cada nivel tiene un emoji/ícono representativo que se muestra en:
- Displays de nivel
- Notificaciones de ascenso
- Árbol de referidos
- Dashboard

## 🔐 Permisos y Seguridad

- **Usuarios**: Solo pueden ver su propia estructura y promocionarse a sí mismos
- **Administradores**: Pueden ver cualquier estructura y forzar promociones
- **Validación**: Todas las promociones se validan automáticamente
- **Auditoría**: Historial completo de promociones en `level_promotions`

## 🚀 Cómo Usar

1. **Instalar dependencias** del sistema
2. **Aplicar migraciones** de base de datos
3. **Ejecutar seed** para crear los 12 niveles
4. **Importar componentes** en tu aplicación
5. **Configurar APIs** en tu frontend

### Ejemplo de Integración:

```tsx
import { MultilevelDashboard, useLevelUpNotification } from '@/components/ui'

function DashboardPage() {
  const { showLevelUp } = useLevelUpNotification()
  
  // Mostrar dashboard
  return (
    <MultilevelDashboard
      user={user}
      currentLevel={level}
      evaluation={evaluation}
      structure={structure}
    />
  )
}
```

## 📞 Soporte

El sistema está completamente integrado con:
- ✅ Stripe para pagos
- ✅ WhatsApp para contacto
- ✅ PDF para facturas
- ✅ Email para notificaciones
- ✅ Toast notifications
- ✅ Responsive design

---

**¡El sistema multinivel escalonado 3x3 está listo para impulsar tu red de afiliados! 🚀** 