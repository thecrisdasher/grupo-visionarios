import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Confirmación webhook de ePayco:', body)

    // Extraer datos del webhook de ePayco
    const {
      x_cod_response,
      x_ref_payco,
      x_id_invoice,
      x_amount,
      x_currency_code,
      x_extra1: userId,
      x_extra2: paymentType,
      x_extra3: flow,
      x_response_reason_text,
      x_transaction_state
    } = body

    // Verificar que tenemos los datos esenciales
    if (!x_id_invoice) {
      console.error('Webhook inválido: falta x_id_invoice')
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    // Buscar el pago en la base de datos
    let payment = await prisma.payment.findFirst({
      where: {
        transactionId: x_id_invoice
      }
    })

    if (!payment) {
      console.error(`Pago no encontrado para invoice: ${x_id_invoice}`)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Determinar el nuevo estado basado en la respuesta de ePayco
    let newStatus: string
    let shouldCompleteRegistration = false

    switch (x_cod_response) {
      case '1':
      case 1:
        newStatus = 'COMPLETED'
        shouldCompleteRegistration = true
        break
      case '2':
      case 2:
        newStatus = 'FAILED'
        break
      case '3':
      case 3:
        newStatus = 'PENDING'
        break
      case '4':
      case 4:
        newStatus = 'FAILED'
        break
      default:
        newStatus = 'FAILED'
        break
    }

    // Actualizar el pago en la base de datos
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus as any,
        metadata: {
          ...payment.metadata as any,
          ePaycoResponse: body,
          confirmedAt: new Date().toISOString()
        }
      }
    })

    // Si el pago fue exitoso y es para registro de membresía, procesar el registro
    if (shouldCompleteRegistration && paymentType === 'membership_payment') {
      try {
        // Aquí podrías agregar lógica adicional para completar el registro automáticamente
        // Por ahora, solo actualizamos los metadatos para indicar que está listo para completar
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            metadata: {
              ...payment.metadata as any,
              readyForRegistration: true,
              paymentConfirmed: true
            }
          }
        })
        
        console.log(`Pago confirmado exitosamente para el usuario ${userId}, invoice: ${x_id_invoice}`)
      } catch (registrationError) {
        console.error('Error procesando registro después del pago:', registrationError)
      }
    }

    // Responder a ePayco con un 200 para confirmar que recibimos el webhook
    return NextResponse.json({ 
      status: 'success',
      message: 'Webhook processed successfully',
      invoice: x_id_invoice,
      payment_status: newStatus
    })

  } catch (error) {
    console.error('Error procesando confirmación de ePayco:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// ePayco también puede enviar webhooks por GET en algunos casos
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Convertir parámetros GET a formato similar al POST
  const webhookData = {
    x_cod_response: searchParams.get('x_cod_response'),
    x_ref_payco: searchParams.get('x_ref_payco'),
    x_id_invoice: searchParams.get('x_id_invoice'),
    x_amount: searchParams.get('x_amount'),
    x_currency_code: searchParams.get('x_currency_code'),
    x_extra1: searchParams.get('x_extra1'),
    x_extra2: searchParams.get('x_extra2'),
    x_extra3: searchParams.get('x_extra3'),
    x_response_reason_text: searchParams.get('x_response_reason_text'),
    x_transaction_state: searchParams.get('x_transaction_state')
  }

  // Crear un request simulado para reutilizar la lógica POST
  const simulatedRequest = {
    json: async () => webhookData
  } as NextRequest

  return POST(simulatedRequest)
} 