'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp,
  DollarSign,
  Trophy,
  Target
} from 'lucide-react'
import Link from 'next/link'

// Mock data - In real app this would be fetched from API
const mockReferrer = {
  name: 'Juan Pérez',
  level: 'PREMIUM',
  totalReferrals: 15,
  monthlyEarnings: 850000,
  joinDate: '2023-06-15',
  successRate: 85,
  achievements: [
    'Top Referrer del Mes',
    'Mentor Certificado',
    'Líder de Ventas'
  ]
}

const benefits = [
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: 'Ingresos Recurrentes',
    description: 'Gana comisiones del 20% al 35% por cada referido exitoso'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Red de Apoyo',
    description: 'Únete a una comunidad de más de 1,000 afiliados activos'
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Capacitación Personalizada',
    description: 'Acceso a materiales de capacitación y mentoría 1:1'
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Reconocimiento',
    description: 'Programa de incentivos y reconocimientos por desempeño'
  }
]

const plans = [
  {
    name: 'Plan Básico',
    price: 150000,
    commission: '20%',
    features: [
      'Materiales básicos de marketing',
      'Soporte por email',
      'Dashboard personal',
      'Comisión del 20%'
    ]
  },
  {
    name: 'Plan Premium',
    price: 350000,
    commission: '30%',
    features: [
      'Todo del Plan Básico',
      'Capacitación avanzada',
      'Soporte prioritario',
      'Comisión del 30%',
      'Herramientas premium'
    ],
    popular: true
  },
  {
    name: 'Plan VIP',
    price: 650000,
    commission: '35%',
    features: [
      'Todo del Plan Premium',
      'Mentoría personal',
      'Eventos exclusivos',
      'Comisión del 35%',
      'Recursos ilimitados'
    ]
  }
]

export default function InvitePage() {
  const params = useParams()
  const linkId = params.linkId as string
  const [isLoading, setIsLoading] = useState(true)
  const [referrer, setReferrer] = useState(mockReferrer)

  useEffect(() => {
    // Simulate API call to get referrer data
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando invitación...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¡{referrer.name} te invita!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Únete a Grupo Visionarios y comienza a generar ingresos como afiliado 
            con el respaldo de uno de nuestros mejores mentores.
          </p>
        </motion.div>

        {/* Referrer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-1">{referrer.totalReferrals}</div>
                  <div className="text-blue-100">Referidos Exitosos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">{formatCurrency(referrer.monthlyEarnings)}</div>
                  <div className="text-blue-100">Ganancias Mensuales</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">{referrer.successRate}%</div>
                  <div className="text-blue-100">Tasa de Éxito</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">{referrer.level}</div>
                  <div className="text-blue-100">Nivel de Afiliado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Grupo Visionarios?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                      {benefit.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Elige tu Plan de Afiliado
            </h2>
            <p className="text-gray-600">
              Todos los planes incluyen capacitación completa y soporte personalizado
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <Card className={`h-full ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} hover:shadow-xl transition-all`}>
                  <CardHeader className="text-center">
                    <CardTitle>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {formatCurrency(plan.price)}
                      </div>
                      <div className="text-lg text-green-600 font-semibold">
                        Comisión: {plan.commission}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href={`/payments?plan=${plan.name.toLowerCase().replace(' ', '-')}&referrer=${linkId}`} passHref>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "primary" : "secondary"}
                        size="lg"
                      >
                        Comenzar Ahora
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-4 italic">
                  "{referrer.name} ha sido un mentor increíble. Gracias a su guía y los materiales 
                  de Grupo Visionarios, he logrado generar ingresos consistentes desde el primer mes."
                </blockquote>
                <cite className="text-gray-600 font-semibold">- María González, Afiliada desde 2023</cite>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        {referrer.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Logros de {referrer.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-3">
                  {referrer.achievements.map((achievement, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      <Trophy className="w-4 h-4 inline mr-2" />
                      {achievement}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  )
} 