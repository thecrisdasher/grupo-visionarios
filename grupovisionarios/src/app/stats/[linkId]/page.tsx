'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Award,
  Target,
  Star,
  ArrowUp,
  ArrowDown,
  Trophy
} from 'lucide-react'
import Link from 'next/link'

// Mock data - In real app this would be fetched from API
const mockStats = {
  user: {
    name: 'Juan Pérez',
    level: 'PREMIUM',
    joinDate: '2023-06-15',
    avatar: '/placeholder-avatar.jpg'
  },
  overview: {
    totalReferrals: 156,
    activeReferrals: 142,
    totalEarnings: 12500000,
    monthlyEarnings: 1850000,
    conversionRate: 85.2,
    averageCommission: 28.5
  },
  monthlyData: [
    { month: 'Ene', referrals: 8, earnings: 320000 },
    { month: 'Feb', referrals: 12, earnings: 480000 },
    { month: 'Mar', referrals: 15, earnings: 600000 },
    { month: 'Abr', referrals: 18, earnings: 720000 },
    { month: 'May', referrals: 22, earnings: 880000 },
    { month: 'Jun', referrals: 25, earnings: 1000000 },
    { month: 'Jul', referrals: 28, earnings: 1120000 },
    { month: 'Ago', referrals: 32, earnings: 1280000 },
    { month: 'Sep', referrals: 35, earnings: 1400000 },
    { month: 'Oct', referrals: 38, earnings: 1520000 },
    { month: 'Nov', referrals: 42, earnings: 1680000 },
    { month: 'Dic', referrals: 46, earnings: 1850000 }
  ],
  achievements: [
    {
      title: 'Top Referrer',
      description: 'Mejor rendimiento del mes',
      date: '2024-12-01',
      icon: <Trophy className="w-5 h-5" />
    },
    {
      title: 'Mentor Certificado',
      description: 'Certificación en capacitación',
      date: '2024-11-15',
      icon: <Award className="w-5 h-5" />
    },
    {
      title: 'Meta Alcanzada',
      description: '100+ referidos exitosos',
      date: '2024-10-20',
      icon: <Target className="w-5 h-5" />
    }
  ],
  recentActivity: [
    { type: 'referral', description: 'Nuevo referido registrado', date: '2024-12-15' },
    { type: 'commission', description: 'Comisión de $45,000 recibida', date: '2024-12-14' },
    { type: 'achievement', description: 'Logro desbloqueado: Top Referrer', date: '2024-12-01' },
    { type: 'referral', description: 'Referido completó capacitación', date: '2024-11-28' }
  ]
}

export default function StatsPage() {
  const params = useParams()
  const linkId = params.linkId as string
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(mockStats)
  const [selectedPeriod, setSelectedPeriod] = useState('12m')

  useEffect(() => {
    // Simulate API call to get stats data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [linkId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'referral':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'commission':
        return <DollarSign className="w-4 h-4 text-green-500" />
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />
    }
  }

  const calculateGrowth = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive: growth >= 0
    }
  }

  // Calculate growth from previous month
  const currentMonth = stats.monthlyData[stats.monthlyData.length - 1]
  const previousMonth = stats.monthlyData[stats.monthlyData.length - 2]
  const earningsGrowth = calculateGrowth(currentMonth.earnings, previousMonth.earnings)
  const referralsGrowth = calculateGrowth(currentMonth.referrals, previousMonth.referrals)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Estadísticas de {stats.user.name}
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Nivel {stats.user.level} • Miembro desde {formatDate(stats.user.joinDate)}
          </p>
          <div className="flex justify-center gap-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {stats.overview.totalReferrals} Referidos Totales
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {stats.overview.conversionRate}% Tasa de Éxito
            </span>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Referidos Activos</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{stats.overview.activeReferrals}</p>
                    <div className={`flex items-center text-sm ${referralsGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {referralsGrowth.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {referralsGrowth.value}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Ganancias del Mes</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.overview.monthlyEarnings)}
                    </p>
                    <div className={`flex items-center text-sm ${earningsGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {earningsGrowth.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {earningsGrowth.value}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Comisión Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.averageCommission}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rendimiento Mensual</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedPeriod === '6m' ? 'primary' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('6m')}
                  >
                    6M
                  </Button>
                  <Button 
                    variant={selectedPeriod === '12m' ? 'primary' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('12m')}
                  >
                    12M
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.monthlyData.slice(-6).map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-900">{data.month}</p>
                        <p className="text-sm text-gray-600">{data.referrals} referidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(data.earnings)}</p>
                      <p className="text-sm text-gray-600">Comisiones</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Logros Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{achievement.title}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(achievement.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="pt-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
              <h2 className="text-2xl font-bold mb-2">
                ¿Quieres resultados como {stats.user.name}?
              </h2>
              <p className="text-blue-100 mb-6">
                Únete a Grupo Visionarios y comienza tu camino hacia el éxito financiero
              </p>
              <Link href={`/invite/${linkId}`} passHref>
                <Button variant="secondary" size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  Comenzar Ahora
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
} 