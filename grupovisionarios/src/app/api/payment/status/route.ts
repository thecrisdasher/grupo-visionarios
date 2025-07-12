import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoice = searchParams.get('invoice')

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice requerido' },
        { status: 400 }
      )
    }

    // Buscar el pago en la base de datos
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: invoice
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    // Devolver información del estado del pago
    return NextResponse.json({
      id: payment.id,
      invoice: payment.transactionId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      user: payment.user,
      metadata: payment.metadata
    })

  } catch (error) {
    console.error('Error verificando estado del pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 