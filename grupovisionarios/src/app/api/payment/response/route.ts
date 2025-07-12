import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros que envía ePayco en la respuesta
    const ref_payco = searchParams.get('ref_payco')
    const state = searchParams.get('x_cod_response') || searchParams.get('state')
    const response_reason = searchParams.get('x_response_reason_text') || searchParams.get('response_reason')
    const invoice = searchParams.get('x_id_invoice') || searchParams.get('invoice')
    const amount = searchParams.get('x_amount') || searchParams.get('amount')
    const userId = searchParams.get('x_extra1') || searchParams.get('extra1')

    console.log('Respuesta de ePayco:', {
      ref_payco,
      state,
      response_reason,
      invoice,
      amount,
      userId
    })

    // Verificar que tenemos los datos mínimos necesarios
    if (!invoice) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/register?error=payment-error`)
    }

    // Buscar el pago en la base de datos
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: invoice
      }
    })

    if (!payment) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/register?error=payment-not-found`)
    }

    // Verificar el estado del pago
    if (state === '1' || state === 'Aceptada') {
      // Pago exitoso - redirigir al formulario de registro para completar
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/register?step=complete&payment_success=true&invoice=${invoice}`
      )
    } else if (state === '2' || state === 'Rechazada') {
      // Pago rechazado
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/register?error=payment-rejected&reason=${encodeURIComponent(response_reason || 'Pago rechazado')}`
      )
    } else if (state === '3' || state === 'Pendiente') {
      // Pago pendiente
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/register?error=payment-pending&reason=${encodeURIComponent(response_reason || 'Pago pendiente de confirmación')}`
      )
    } else {
      // Estado desconocido o error
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/register?error=payment-error&reason=${encodeURIComponent(response_reason || 'Error en el proceso de pago')}`
      )
    }

  } catch (error) {
    console.error('Error procesando respuesta de ePayco:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/register?error=server-error`)
  }
}

// También manejar POST en caso de que ePayco envíe por POST
export async function POST(request: NextRequest) {
  return GET(request)
} 