'use client'

import * as React from 'react'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { cn } from '@/lib/utils'
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface CheckoutFormProps {
  amount: number
  currency?: string
  description: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
  className?: string
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  currency = 'COP',
  description,
  onSuccess,
  onError,
  className
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!customerInfo.name || !customerInfo.email) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    setIsLoading(true)
    setPaymentStatus('processing')

    try {
      // Create payment intent on backend
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          customerInfo
        })
      })

      const { clientSecret } = await response.json()

      if (!clientSecret) {
        throw new Error('No se pudo crear la sesión de pago')
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        setPaymentStatus('success')
        toast.success('¡Pago procesado exitosamente!')
        onSuccess?.(paymentIntent)
      }

    } catch (error: any) {
      setPaymentStatus('error')
      const errorMessage = error.message || 'Error al procesar el pago'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        fontFamily: '"Inter", sans-serif',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
    hidePostalCode: true,
  }

  if (paymentStatus === 'success') {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Pago Exitoso!
            </h3>
            <p className="text-gray-600 mb-4">
              Tu pago de {formatAmount(amount)} ha sido procesado correctamente.
            </p>
            <p className="text-sm text-gray-500">
              Recibirás un email con la factura en unos momentos.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Procesar Pago
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total a pagar:</span>
              <span className="text-xl font-bold text-gray-900">
                {formatAmount(amount)}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {description}
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={customerInfo.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>

          {/* Card Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Información de la tarjeta
            </label>
            <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 rounded-lg p-3">
            <Lock className="w-4 h-4 text-green-600" />
            <span>Tus datos están protegidos con encriptación SSL</span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || isLoading || paymentStatus === 'processing'}
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Procesando...' : `Pagar ${formatAmount(amount)}`}
          </Button>

          {paymentStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4" />
              <span>Hubo un error al procesar el pago. Intenta nuevamente.</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

interface StripeCheckoutProps extends CheckoutFormProps {}

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  // Show error if Stripe is not configured
  if (!stripePromise) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', props.className)}>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Configuración Pendiente
            </h3>
            <p className="text-gray-600 mb-4">
              El sistema de pagos está en configuración. Por favor intenta más tarde.
            </p>
            <p className="text-sm text-gray-500">
              Para configurar: Agrega NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY a las variables de entorno.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}

export { StripeCheckout } 