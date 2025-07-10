'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { StripeCheckout } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CreditCard, Package, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Sample packages/services
const packages = [
  {
    id: 'basic',
    name: 'Plan Básico',
    description: 'Perfecto para empezar tu negocio de afiliados',
    price: 150000,
    features: [
      'Acceso a materiales básicos',
      'Comisión del 20%',
      'Soporte por email',
      'Dashboard personal'
    ],
    popular: false
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    description: 'Para usuarios que quieren maximizar sus ganancias',
    price: 350000,
    features: [
      'Acceso completo a materiales',
      'Comisión del 30%',
      'Soporte prioritario',
      'Capacitación personalizada',
      'Herramientas avanzadas'
    ],
    popular: true
  },
  {
    id: 'vip',
    name: 'Plan VIP',
    description: 'La experiencia completa para profesionales',
    price: 650000,
    features: [
      'Todo del Plan Premium',
      'Mentoría 1:1',
      'Eventos exclusivos',
      'Comisión del 35%',
      'Recursos premium ilimitados'
    ],
    popular: false
  }
]

export default function PaymentsPage() {
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handlePackageSelect = (pkg: typeof packages[0]) => {
    setSelectedPackage(pkg)
    setShowCheckout(true)
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent)
    // Here you could redirect to a success page or show a success message
    setShowCheckout(false)
    setSelectedPackage(null)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
  }

  const handleBackToPackages = () => {
    setShowCheckout(false)
    setSelectedPackage(null)
  }

  if (showCheckout && selectedPackage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackToPackages}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a paquetes
          </button>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Package Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Resumen del Paquete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedPackage.name}</h3>
                      <p className="text-gray-600">{selectedPackage.description}</p>
                    </div>
                    
                    <div className="text-3xl font-bold text-blue-600">
                      {formatPrice(selectedPackage.price)}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Incluye:</h4>
                      <ul className="space-y-1">
                        {selectedPackage.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <StripeCheckout
                amount={selectedPackage.price}
                currency="COP"
                description={`${selectedPackage.name} - Grupo Visionarios`}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elige tu Plan de Afiliados
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selecciona el paquete que mejor se adapte a tus objetivos de negocio. 
            Todos incluyen acceso inmediato y soporte especializado.
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Más Popular
                  </span>
                </div>
              )}
              
              <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
                pkg.popular ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
              }`}>
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatPrice(pkg.price)}
                    </div>
                    <p className="text-gray-600 text-sm">{pkg.description}</p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-6">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handlePackageSelect(pkg)}
                    className="w-full"
                    variant={pkg.popular ? "primary" : "secondary"}
                    size="lg"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pagar Ahora
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pago Seguro</h3>
                  <p className="text-gray-600 text-sm">Procesamos pagos con Stripe, la plataforma más segura del mundo</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Acceso Inmediato</h3>
                  <p className="text-gray-600 text-sm">Una vez confirmado el pago, tendrás acceso inmediato a tu plan</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Garantía 30 días</h3>
                  <p className="text-gray-600 text-sm">Si no estás satisfecho, te devolvemos tu dinero sin preguntas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" passHref>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 