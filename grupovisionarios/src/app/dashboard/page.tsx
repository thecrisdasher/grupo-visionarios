"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AffiliateLayout } from '@/components/layout/AffiliateLayout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui'
import {
  Users,
  DollarSign,
  TrendingUp,
  UserPlus,
  Calendar,
  Star,
  Award,
} from 'lucide-react'
import { ProgressLevelAdvanced } from '@/components/stats/ProgressLevelAdvanced'
import {
  DropdownMonthSelector,
  MonthSummaryCard,
} from '@/components/stats/DropdownMonthSelector'
import { RecentReferralsList } from '@/components/stats/RecentReferralsList'
import { ValueIconsGrid } from '@/components/stats/ValueIconsGrid'
import DashboardTopNav from '@/components/layout/DashboardTopNav'
import { AffiliateLinksPanel } from '@/components/stats/AffiliateLinksPanel'
import toast from 'react-hot-toast'

interface MonthlyData {
  referrals: number
  earnings: number
  conversions: number
  newSignups: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()

  /* ----------------------- ESTADOS ----------------------- */
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null) // info básica + enlaces
  const [evaluation, setEvaluation] = useState<any>(null) // nivel actual / progreso
  const [referralStats, setReferralStats] = useState<any>(null) // totales de red
  const [structure, setStructure] = useState<any>(null) // árbol completo (por si lo necesitas)

  // mes actual (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthlyData>>({})

  /* ----------------------- EFECTOS ----------------------- */
  useEffect(() => {
    if (status !== 'authenticated') return

    const userId = (session!.user as any).id
    if (!userId) return // todavía no está el id en el token

    // 1. Info de nivel & promoción
    fetch(`/api/user/${userId}/evaluate-promotion`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEvaluation(res)
      })

    // 2. Estructura y estadísticas de referidos
    fetch(`/api/user/${userId}/structure`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setUserData(res.user)
          setReferralStats(res.statistics)
          setStructure(res.structure)
        }
      })

    // 3. (Opcional) Ganancias mensuales – de momento placeholder 0
    setMonthlyData({
      [selectedMonth]: {
        referrals: 0,
        earnings: 0,
        conversions: 0,
        newSignups: 0,
      },
    })

    setLoading(false)
  }, [status, session])

  /* ----------------------- HELPERS ----------------------- */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)

  const handleRegenerateLinks = async () => {
    if (!userData) return
    try {
      const res = await fetch('/api/user/regenerate-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id }),
      })
      const data = await res.json()
      if (data.success) {
        setUserData((prev: any) => ({ ...prev, ...data.user }))
        toast.success('Enlaces regenerados exitosamente')
      } else {
        toast.error(data.error || 'Error al regenerar enlaces')
      }
    } catch (err) {
      toast.error('Error al regenerar enlaces')
    }
  }

  if (loading || !userData || !evaluation || !referralStats) {
    return <p className="p-8">Cargando dashboard…</p>
  }

  /* ----------------------- DERIVADOS ----------------------- */
  const totalReferrals = referralStats.totalReferrals
  const activeReferrals = referralStats.activeReferrals
  const monthlyEarnings = monthlyData[selectedMonth]?.earnings ?? 0
  const conversionRate = totalReferrals
    ? Math.round((activeReferrals / totalReferrals) * 100)
    : 0

  // Determinar nivel simplificado para componente ProgressLevel
  type AffiliateLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
  const affiliateLevel: AffiliateLevel = totalReferrals >= 50
    ? 'ADVANCED'
    : totalReferrals >= 25
      ? 'INTERMEDIATE'
      : 'BASIC'

  /* ----------------------- UI ----------------------- */
  return (
    <AffiliateLayout contentClassName="bg-gradient-to-br from-blue-50 to-purple-50">
      <DashboardTopNav balance={formatCurrency(monthlyEarnings)} />
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                ¡Bienvenido, {userData.name}!
              </h1>
              <p className="text-lg text-gray-600">Tu panel de control de afiliados</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Tu nivel actual</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {evaluation.currentLevel?.icon || '🏆'}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {evaluation.currentLevel?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---- Main Stats Cards ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Referrals */}
          <Card hover="lift">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Referidos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Earnings */}
          <Card hover="lift">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ganancias del Mes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(monthlyEarnings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card hover="lift">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                  <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Referrals */}
          <Card hover="lift">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Referidos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{activeReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progreso al Siguiente Nivel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProgressLevelAdvanced
            currentLevel={evaluation.currentLevel}
            nextLevel={evaluation.nextLevel ? evaluation.nextLevel as any : undefined}
            evaluation={evaluation}
          />
        </motion.div>

        {/* Selector de mes y resumen (placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DropdownMonthSelector
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  maxMonthsBack={6}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <MonthSummaryCard
              selectedMonth={selectedMonth}
              data={monthlyData[selectedMonth] || { referrals: 0, earnings: 0, conversions: 0, newSignups: 0 }}
            />
          </div>
        </motion.div>

        {/* Recientes y valores estáticos → puedes sustituir por datos reales si existieran */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <RecentReferralsList
            referrals={structure?.slice(0, 5) || []}
            maxItems={5}
            onViewAll={() => (window.location.href = '/referrals')}
          />

          <ValueIconsGrid itemsPerRow={3} highlightedValues={['1', '5', '8']} />
        </motion.div>

        {/* Panel de enlaces de afiliado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AffiliateLinksPanel
            links={{
              inviteLink: userData.inviteLink,
              statsLink: userData.statsLink,
              trainingLink: userData.trainingLink,
            }}
            userName={userData.name}
            onRegenerateLinks={handleRegenerateLinks}
          />
        </motion.div>

        {/* Acciones rápidas (enlaces) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="primary"
                  className="flex items-center justify-center gap-2 h-12"
                  onClick={() => window.open(`/invite/${userData.inviteLink}`, '_blank')}
                >
                  <Users className="w-5 h-5" />
                  Ver Página de Invitación
                </Button>

                <Button
                  variant="secondary"
                  className="flex items-center justify-center gap-2 h-12"
                  onClick={() => window.open(`/stats/${userData.statsLink}`, '_blank')}
                >
                  <TrendingUp className="w-5 h-5" />
                  Ver Mis Estadísticas
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-12"
                  onClick={() => window.open(`/training/${userData.trainingLink}`, '_blank')}
                >
                  <Award className="w-5 h-5" />
                  Ir a Capacitación
                </Button>

                <Button
                  variant="ghost"
                  className="flex items-center justify-center gap-2 h-12"
                  onClick={() => window.open('/values', '_blank')}
                >
                  <Star className="w-5 h-5" />
                  Explorar Valores
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AffiliateLayout>
  )
} 