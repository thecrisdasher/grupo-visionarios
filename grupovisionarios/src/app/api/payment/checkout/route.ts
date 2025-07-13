import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateUserLinks } from '@/lib/user-links'
import { generateReferralCode } from '@/lib/utils'

// 👉 Asegurarnos de que `fetch` exista (Node 18+ lo incluye de forma nativa).
//    Solo si no existe intentamos cargar un polyfill, sin sobreescribir la implementación nativa.
if (typeof globalThis.fetch !== 'function') {
  try {
    // `node-fetch` solo se carga si hace falta.
    //  - Si el proyecto ya tiene la dependencia instalada funcionará.
    //  - Si no está instalada, lanzará un mensaje de log descriptivo y el request fallará como antes.
    //    (Útil en entornos donde no sea necesario el polyfill).
    //  - Nunca sobreescribimos la implementación de Node si existe.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fetchPkg = require('node-fetch')
    const fetchFn = fetchPkg.default || fetchPkg
    globalThis.fetch = fetchFn
    globalThis.Headers = fetchPkg.Headers
    globalThis.Request = fetchPkg.Request
    globalThis.Response = fetchPkg.Response
    console.log('ℹ️  Polyfill global fetch cargado desde node-fetch')
  } catch (polyErr) {
    console.warn('⚠️  No se pudo cargar node-fetch. Asegúrate de instalarlo si tu versión de Node no soporta fetch nativo.')
  }
}

const prisma = new PrismaClient()

// ✅ Inicializar ePayco SDK después del polyfill
function initializeEPaycoSDK() {
  if (!process.env.EPAYCO_PUBLIC_KEY || !process.env.EPAYCO_PRIVATE_KEY) {
    throw new Error('ePayco configuration missing')
  }

  return require('epayco-sdk-node')({
    apiKey: process.env.EPAYCO_PUBLIC_KEY,
    privateKey: process.env.EPAYCO_PRIVATE_KEY,
    lang: 'ES',
    test: process.env.EPAYCO_TEST === 'true'
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting payment checkout process')
    
    // Inicializar SDK después del polyfill
    let ePayco
    try {
      ePayco = initializeEPaycoSDK()
    } catch (error) {
      console.error('❌ ePayco configuration error:', error)
      return NextResponse.json(
        { error: 'ePayco no está configurado correctamente' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { amount, currency = 'COP', description, customerInfo } = body

    // Validate required fields
    if (!amount || !description || !customerInfo?.name || !customerInfo?.email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Create or find user
    let user = await prisma.user.findUnique({
      where: { email: customerInfo.email }
    })

    if (!user) {
      // Create a temporary user for the payment
      const referralCode = generateReferralCode()
      
      // Generate unique links for the new user
      const userLinks = generateUserLinks(customerInfo.name, '')
      
      user = await prisma.user.create({
        data: {
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone || null,
          password: '', // We'll handle proper registration separately
          referralCode,
          inviteLink: userLinks.inviteLink,
          statsLink: userLinks.statsLink,
          trainingLink: userLinks.trainingLink,
          isActive: false // Mark as inactive until proper registration
        }
      })
      
      console.log('✅ Created new user:', user.id)
    }

    // Generar un invoice único para ePayco
    const invoice = `GV-${Date.now()}-${user.id.slice(-6)}`

    // 🔧 MEJORADO: Función helper para obtener IP del cliente
    const getClientIp = (req: NextRequest): string => {
      const forwarded = req.headers.get('x-forwarded-for')
      const realIp = req.headers.get('x-real-ip')
      const cfIp = req.headers.get('cf-connecting-ip')
      
      if (forwarded) {
        return forwarded.split(',')[0].trim()
      }
      
      return realIp || cfIp || '127.0.0.1'
    }

    const clientIp = getClientIp(request)

    // Crear datos para PSE (transferencia bancaria)
    const pseData = {
      bank: "1022", // Banco por defecto (se puede cambiar)
      invoice: invoice,
      description: description,
      value: amount.toString(),
      tax: "0",
      tax_base: "0",
      currency: currency,
      type_person: "0", // 0 = persona natural, 1 = persona jurídica
      doc_type: "CC",
      doc_number: customerInfo.documento || "12345678",
      name: customerInfo.name,
      last_name: customerInfo.apellidos || customerInfo.name.split(' ')[1] || '',
      email: customerInfo.email,
      country: "CO",
      cell_phone: customerInfo.phone || "3001234567",
      ip: clientIp,
      url_response: `${process.env.NEXTAUTH_URL}/api/payment/response`,
      url_confirmation: `${process.env.NEXTAUTH_URL}/api/payment/confirmation`,
      method_confirmation: "POST", // 🔧 CORREGIDO: era "metodoconfirmacion"
      
      // Parámetros extras para metadata
      extra1: user.id,
      extra2: "membership_payment",
      extra3: "registration_flow",
      extra4: "",
      extra5: "",
      extra6: ""
    }

    console.log('📤 Sending PSE payment data:', pseData)

    // Crear registro de pago en la base de datos
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount,
        currency,
        status: 'PENDING',
        paymentMethod: 'epayco_pse',
        transactionId: invoice,
        description,
        metadata: {
          customerInfo,
          ePaycoData: pseData,
          clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      }
    })

    console.log('✅ Created payment record:', payment.id)

    // 🔧 IMPORTANTE: Usar Promise-based approach correctamente
    // El SDK de ePayco usa callbacks, no Promises nativas
    const createPSEPayment = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        ePayco.bank.create(pseData, (err: any, response: any) => {
          if (err) {
            console.error('❌ ePayco SDK error:', err)
            reject(err)
          } else {
            console.log('✅ ePayco SDK response:', response)
            resolve(response)
          }
        })
      })
    }

    // Crear el pago PSE con ePayco usando el approach correcto
    try {
      const pseResponse = await createPSEPayment()
      
      // ✅ Verificar la estructura de respuesta correcta de ePayco
      if (pseResponse && pseResponse.urlbanco) {
        // Actualizar el pago con la referencia de ePayco
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            metadata: {
              ...payment.metadata as any,
              ePaycoResponse: pseResponse
            }
          }
        })

        return NextResponse.json({
          success: true,
          payment_url: pseResponse.urlbanco,
          invoice: invoice,
          paymentId: payment.id,
          ref_payco: pseResponse.ref_payco
        })
      } else {
        console.error('❌ Invalid ePayco response structure:', pseResponse)
        
        // Actualizar el pago como fallido
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            status: 'FAILED',
            metadata: {
              ...payment.metadata as any,
              error: 'Invalid ePayco response structure',
              ePaycoResponse: pseResponse
            }
          }
        })
        
        return NextResponse.json(
          { error: 'Error creando sesión de pago PSE con ePayco' },
          { status: 500 }
        )
      }
    } catch (ePaycoError: any) {
      console.error('❌ Error creando pago PSE con ePayco:', ePaycoError)
      
      // Actualizar el pago como fallido con detalles del error
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'FAILED',
          metadata: {
            ...payment.metadata as any,
            error: ePaycoError.message || 'Unknown ePayco error',
            fullError: ePaycoError
          }
        }
      })
      
      return NextResponse.json(
        { error: 'Error creando sesión de pago PSE con ePayco' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Error en checkout ePayco:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}