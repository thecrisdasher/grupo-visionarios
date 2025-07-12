'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, User, Mail, Lock, Phone, Calendar, MapPin, CreditCard, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StripeCheckout } from '@/components/ui/StripeCheckout'

// Schemas de validación para cada paso
const step1Schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  documento: z.string().min(6, 'El documento debe tener al menos 6 caracteres'),
  departamento: z.string().min(2, 'Selecciona tu departamento'),
  ciudad: z.string().min(2, 'Escribe tu ciudad'),
  nacimiento: z.string().min(1, 'Selecciona tu fecha de nacimiento'),
  genero: z.string().min(1, 'Selecciona tu género'),
  referidoPor: z.string().optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
})

const step2Schema = z.object({
  tieneHeredero: z.boolean(),
  heredero: z.object({
    nombre: z.string().optional(),
    documento: z.string().optional(),
    relacion: z.string().optional(),
    contacto: z.string().optional()
  }).optional()
}).refine((data) => {
  if (data.tieneHeredero && data.heredero) {
    return data.heredero.nombre && data.heredero.documento && data.heredero.relacion && data.heredero.contacto
  }
  return true
}, {
  message: "Completa todos los campos del heredero",
  path: ["heredero"]
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

const departamentos = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
  'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
  'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
  'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada'
]

// Lista de ciudades principales de Colombia (capitales departamentales y otras relevantes)
const ciudades = [
  'Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga',
  'Cúcuta', 'Villavicencio', 'Santa Marta', 'Ibagué', 'Pereira', 'Manizales',
  'Armenia', 'Pasto', 'Popayán', 'Neiva', 'Tunja', 'Montería', 'Sincelejo',
  'Riohacha', 'Valledupar', 'Quibdó', 'Florencia', 'Yopal', 'Arauca',
  'Inírida', 'San José del Guaviare', 'Mocoa', 'Mitú', 'Puerto Carreño',
  'San Andrés', 'Leticia', 'Palmira', 'Buenaventura', 'Soacha', 'Bello',
  'Itagüí', 'Envigado', 'Dosquebradas'
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  // Forms para cada paso
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      referidoPor: new URLSearchParams(window?.location?.search).get('ref') || ''
    }
  })

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      tieneHeredero: false,
      heredero: {
        nombre: '',
        documento: '',
        relacion: '',
        contacto: ''
      }
    }
  })

  const watchTieneHeredero = step2Form.watch('tieneHeredero')

  // Navegación entre pasos
  const nextStep = async () => {
    if (currentStep === 1) {
      const isValid = await step1Form.trigger()
      if (isValid) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      const isValid = await step2Form.trigger()
      if (isValid) {
        setCurrentStep(3)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Preparar datos para el pago
  const handlePreparePayment = async () => {
    setIsLoading(true)
    
    try {
      const step1Data = step1Form.getValues()
      const step2Data = step2Form.getValues()

      // Preparar datos completos del registro
      const completeData = {
        ...step1Data,
        ...step2Data,
        nacimiento: new Date(step1Data.nacimiento),
      }

      setRegistrationData(completeData)
      
      toast.success('Datos validados. Procede con el pago para completar tu afiliación.')
    } catch (error) {
      toast.error('Error validando los datos')
    } finally {
      setIsLoading(false)
    }
  }

  // Callback después de pago exitoso con ePayco
  const handlePaymentSuccess = async (paymentData: any) => {
    setIsLoading(true)
    
    try {
      // Verificar que el pago esté completado
      if (paymentData.status !== 'COMPLETED') {
        toast.error('El pago aún no ha sido confirmado')
        return
      }

      // Preparar datos del pago para ePayco
      const ePaycoPaymentData = {
        invoice: paymentData.invoice,
        ref_payco: paymentData.metadata?.ePaycoResponse?.x_ref_payco || '',
        amount: paymentData.amount,
        currency: paymentData.currency || 'COP'
      }

      // Registrar usuario con todos los datos después del pago exitoso
      const response = await axios.post('/api/auth/register/complete', {
        ...registrationData,
        paymentData: ePaycoPaymentData
      })

      if (response.data.success) {
        setPaymentCompleted(true)
        toast.success('¡Afiliación completada exitosamente!')
        
        // Redirigir al login después de un momento
        setTimeout(() => {
          window.location.href = '/auth/login?message=registration-complete'
        }, 3000)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error completando el registro')
    } finally {
      setIsLoading(false)
    }
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Afiliación Completada!</h1>
          <p className="text-gray-600 mb-6">
            Tu cuenta ha sido creada exitosamente. Serás redirigido al login para acceder a tu dashboard.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {step}
                </div>
                <div className={`ml-2 text-sm font-medium ${step <= currentStep ? 'text-primary-600' : 'text-gray-500'}`}>
                  {step === 1 && 'Datos del Afiliado'}
                  {step === 2 && 'Heredero (Opcional)'}
                  {step === 3 && 'Pago de Membresía'}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ml-4 ${step < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                      Datos del Afiliado
              </h1>
              <p className="text-gray-600">
                      Completa tu información personal para crear tu cuenta
              </p>
            </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo *
                  </label>
                  <div className="relative">
                          <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            {...step1Form.register('name')}
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Tu nombre completo"
                          />
                        </div>
                        {step1Form.formState.errors.name && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.name.message}</p>
                        )}
                    </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correo Electrónico *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                            {...step1Form.register('email')}
                            type="email"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="tu@email.com"
                    />
                  </div>
                        {step1Form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.email.message}</p>
                        )}
                </div>

                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono Celular *
                  </label>
                  <div className="relative">
                          <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            {...step1Form.register('phone')}
                            type="tel"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="3001234567"
                          />
                        </div>
                        {step1Form.formState.errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Documento de Identidad *
                        </label>
                        <input
                          {...step1Form.register('documento')}
                          type="text"
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Número de cédula"
                        />
                        {step1Form.formState.errors.documento && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.documento.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departamento *
                        </label>
                        <select
                          {...step1Form.register('departamento')}
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Selecciona tu departamento</option>
                          {departamentos.map(dep => (
                            <option key={dep} value={dep}>{dep}</option>
                          ))}
                        </select>
                        {step1Form.formState.errors.departamento && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.departamento.message}</p>
                        )}
                    </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ciudad *
                        </label>
                        <select
                          {...step1Form.register('ciudad')}
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Selecciona tu ciudad</option>
                          {ciudades.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        {step1Form.formState.errors.ciudad && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.ciudad.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Nacimiento *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                            {...step1Form.register('nacimiento')}
                            type="date"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                        {step1Form.formState.errors.nacimiento && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.nacimiento.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Género *
                        </label>
                        <select
                          {...step1Form.register('genero')}
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Selecciona tu género</option>
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="otro">Otro</option>
                          <option value="prefiero_no_decir">Prefiero no decir</option>
                        </select>
                        {step1Form.formState.errors.genero && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.genero.message}</p>
                        )}
                </div>
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Referido por (Código)
                      </label>
                      <input
                        {...step1Form.register('referidoPor')}
                        type="text"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Código de quien te refirió (opcional)"
                        readOnly={!!new URLSearchParams(window?.location?.search).get('ref')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña *
                </label>
                <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                            {...step1Form.register('password')}
                            type="password"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Mínimo 8 caracteres"
                  />
                </div>
                        {step1Form.formState.errors.password && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.password.message}</p>
                        )}
              </div>

              <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Contraseña *
                </label>
                <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            {...step1Form.register('confirmPassword')}
                            type="password"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Confirma tu contraseña"
                          />
                        </div>
                        {step1Form.formState.errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                  </form>

                  <div className="flex justify-end">
                    <Button onClick={nextStep} size="lg" className="flex items-center gap-2">
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                      Heredero de la Afiliación
                    </h1>
                    <p className="text-gray-600">
                      (Opcional) Designa un heredero en caso de inactividad o fallecimiento
                    </p>
              </div>

                  <form className="space-y-6">
                    <div className="flex items-center space-x-3">
                <input
                        {...step2Form.register('tieneHeredero')}
                  type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Deseo asignar un heredero en caso de inactividad o fallecimiento
                </label>
              </div>

                    <AnimatePresence>
                      {watchTieneHeredero && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 border border-gray-200 rounded-lg p-6"
                        >
                          <h3 className="text-lg font-medium text-gray-900">Información del Heredero</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre Completo del Heredero *
                              </label>
                              <input
                                {...step2Form.register('heredero.nombre')}
                                type="text"
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Nombre completo del heredero"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Documento del Heredero *
                              </label>
                              <input
                                {...step2Form.register('heredero.documento')}
                                type="text"
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Número de documento"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relación con el Afiliado *
                              </label>
                              <select
                                {...step2Form.register('heredero.relacion')}
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="">Selecciona la relación</option>
                                <option value="hijo">Hijo/a</option>
                                <option value="esposo">Esposo/a</option>
                                <option value="padre">Padre/Madre</option>
                                <option value="hermano">Hermano/a</option>
                                <option value="otro_familiar">Otro familiar</option>
                                <option value="otro">Otro</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Teléfono o Correo de Contacto *
                              </label>
                              <input
                                {...step2Form.register('heredero.contacto')}
                                type="text"
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Teléfono o correo del heredero"
                              />
                            </div>
                          </div>

                          {step2Form.formState.errors.heredero && (
                            <p className="text-red-500 text-sm">{step2Form.formState.errors.heredero.message}</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
            </form>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} size="lg" className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button onClick={nextStep} size="lg" className="flex items-center gap-2">
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                      Pago de Membresía
                    </h1>
                    <p className="text-gray-600">
                      Pago único de $40,000 COP para activar tu afiliación
                    </p>
                  </div>

                  {!registrationData ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Preparando pago...</h3>
                      <p className="text-gray-600 mb-6">
                        Se validarán tus datos antes de proceder con el pago
                      </p>
                      <Button onClick={handlePreparePayment} isLoading={isLoading} size="lg">
                        Validar Datos y Proceder al Pago
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen del Pago</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Membresía Única - Grupo Visionarios</span>
                            <span className="font-medium">$40,000 COP</span>
                </div>
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total a Pagar</span>
                            <span>$40,000 COP</span>
                </div>
              </div>
            </div>

                      <StripeCheckout
                        amount={40000}
                        currency="COP"
                        description="Membresía Única - Grupo Visionarios"
                        customerInfo={{
                          name: registrationData.name,
                          email: registrationData.email,
                          phone: registrationData.phone
                        }}
                        onSuccess={handlePaymentSuccess}
                        onError={(error) => toast.error(error)}
                      />

                      <div className="flex justify-start">
                        <Button variant="outline" onClick={prevStep} size="lg" className="flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          Anterior
                </Button>
                      </div>
            </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 