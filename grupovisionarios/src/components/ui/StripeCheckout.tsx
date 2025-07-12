'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { cn } from '@/lib/utils'
import { CreditCard, Lock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface EPaycoCheckoutProps {
  amount: number
  currency?: string
  description: string
  customerInfo?: {
    name?: string
    email?: string
    phone?: string
  }
  onSuccess?: (paymentData: any) => void
  onError?: (error: string) => void
  className?: string
}

const EPaycoCheckout: React.FC<EPaycoCheckoutProps> = ({
  amount,
  currency = 'COP',
  description,
  customerInfo,
  onSuccess,
  onError,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handlePayment = async () => {
    if (!customerInfo?.name || !customerInfo?.email) {
      toast.error('Por favor complete la información del cliente')
      return
    }

    setIsLoading(true)
    setPaymentStatus('processing')

    try {
      // Crear checkout con ePayco
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error creando el checkout')
      }

      if (!data.payment_url) {
        throw new Error('No se recibió URL de pago')
      }

      // Guardar URL para mostrar o redirigir
      setCheckoutUrl(data.payment_url)
      
      // Abrir pago PSE en nueva ventana o redirigir
      window.open(data.payment_url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
      
      toast.success('Redirigiendo a PSE para completar el pago bancario...')
      
      // Opcional: Polling para verificar el estado del pago
      startPaymentStatusPolling(data.invoice)

    } catch (error: any) {
      setPaymentStatus('error')
      const errorMessage = error.message || 'Error al crear el checkout'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const startPaymentStatusPolling = (invoice: string) => {
    // Polling simple para verificar el estado del pago cada 5 segundos
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status?invoice=${invoice}`)
        const data = await response.json()
        
        if (data.status === 'COMPLETED') {
          clearInterval(pollInterval)
          setPaymentStatus('success')
          toast.success('¡Pago procesado exitosamente!')
          onSuccess?.(data)
        } else if (data.status === 'FAILED') {
          clearInterval(pollInterval)
          setPaymentStatus('error')
          toast.error('El pago fue rechazado')
          onError?.('Pago rechazado')
        }
      } catch (error) {
        // Continuar el polling en caso de error de red
        console.log('Error checking payment status:', error)
      }
    }, 5000)

    // Detener el polling después de 10 minutos
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 600000)
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
              Recibirás un email con la confirmación en unos momentos.
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
        <div className="space-y-4">
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

          {/* Customer Information Display */}
          {customerInfo && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Información del cliente:</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Nombre:</strong> {customerInfo.name}</div>
                <div><strong>Email:</strong> {customerInfo.email}</div>
                {customerInfo.phone && (
                  <div><strong>Teléfono:</strong> {customerInfo.phone}</div>
                )}
              </div>
            </div>
          )}

          {/* ePayco Information */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Pago con PSE - ePayco</span>
            </div>
            <p className="text-sm opacity-90">
              Paga directamente desde tu cuenta bancaria con PSE (Pagos Seguros en Línea).
            </p>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 rounded-lg p-3">
            <Lock className="w-4 h-4 text-green-600" />
            <span>Transacción segura protegida por ePayco</span>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isLoading || paymentStatus === 'processing'}
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Creando checkout...' : (
              <div className="flex items-center gap-2">
                <span>Pagar {formatAmount(amount)}</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            )}
          </Button>

          {/* Status Messages */}
          {paymentStatus === 'processing' && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4" />
              <span>Se abrió una nueva ventana para completar el pago. Si no se abrió, 
                {checkoutUrl && (
                  <a 
                    href={checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-700 font-medium ml-1 underline"
                  >
                    haz clic aquí
                  </a>
                )}
              </span>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4" />
              <span>Hubo un error al procesar el pago. Intenta nuevamente.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { EPaycoCheckout as StripeCheckout } 