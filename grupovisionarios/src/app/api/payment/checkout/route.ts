import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateUserLinks } from '@/lib/user-links'
import { generateReferralCode } from '@/lib/utils'

const ePayco = require('epayco-sdk-node')({
  apiKey: process.env.EPAYCO_PUBLIC_KEY,
  privateKey: process.env.EPAYCO_PRIVATE_KEY,
  lang: 'ES',
  test: process.env.EPAYCO_TEST === 'true'
})

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'COP', description, customerInfo } = body

    // Validate required fields
    if (!amount || !description || !customerInfo?.name || !customerInfo?.email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar que las claves de ePayco estén configuradas
    if (!process.env.EPAYCO_PUBLIC_KEY || !process.env.EPAYCO_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'ePayco no está configurado correctamente' },
        { status: 500 }
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
    }

    // Generar un invoice único para ePayco
    const invoice = `GV-${Date.now()}-${user.id.slice(-6)}`

    // Obtener IP del cliente
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') || 
                     '127.0.0.1'

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
      ip: clientIp.split(',')[0].trim(), // Usar la primera IP si hay múltiples
      url_response: `${process.env.NEXTAUTH_URL}/api/payment/response`,
      url_confirmation: `${process.env.NEXTAUTH_URL}/api/payment/confirmation`,
      metodoconfirmacion: "POST",
      
      // Parámetros extras para metadata
      extra1: user.id,
      extra2: "membership_payment",
      extra3: "registration_flow",
      extra4: "",
      extra5: "",
      extra6: ""
    }

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
          ePaycoData: pseData
        }
      }
    })

    // Crear el pago PSE con ePayco
    try {
      const pseResponse = await ePayco.bank.create(pseData)
      
      if (pseResponse.success && pseResponse.data.urlbanco) {
        return NextResponse.json({
          success: true,
          payment_url: pseResponse.data.urlbanco,
          invoice: invoice,
          paymentId: payment.id,
          ref_payco: pseResponse.data.ref_payco
        })
      } else {
        // Actualizar el pago como fallido
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' }
        })
        
        return NextResponse.json(
          { error: 'Error creando sesión de pago PSE con ePayco' },
          { status: 500 }
        )
      }
    } catch (ePaycoError: any) {
      console.error('Error creando pago PSE con ePayco:', ePaycoError)
      
      // Actualizar el pago como fallido
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      })
      
      return NextResponse.json(
        { error: 'Error creando sesión de pago PSE con ePayco' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error en checkout ePayco:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 