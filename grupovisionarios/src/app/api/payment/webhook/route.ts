import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 })
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentId: paymentIntent.id },
    include: { user: true }
  })

  if (!payment) {
    console.error('Payment not found for payment intent:', paymentIntent.id)
    return
  }

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'COMPLETED',
      transactionId: paymentIntent.id,
    }
  })

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber()

  // Create invoice record
  const invoice = await prisma.invoice.create({
    data: {
      paymentId: payment.id,
      userId: payment.userId,
      invoiceNumber,
      amount: payment.amount,
      currency: payment.currency,
      concept: payment.description || 'Pago de servicios',
      status: 'PENDING',
    }
  })

  // Trigger PDF generation and email sending
  // This will be handled by the PDF generation service
  await generateAndSendInvoice(invoice.id)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentId: paymentIntent.id }
  })

  if (!payment) {
    console.error('Payment not found for payment intent:', paymentIntent.id)
    return
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      transactionId: paymentIntent.id,
    }
  })
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  
  // Get the count of invoices for this month
  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: new Date(year, new Date().getMonth(), 1),
        lt: new Date(year, new Date().getMonth() + 1, 1)
      }
    }
  })

  const sequence = String(count + 1).padStart(4, '0')
  return `GV-${year}${month}-${sequence}`
}

async function generateAndSendInvoice(invoiceId: string) {
  try {
    // Make a request to our PDF generation endpoint
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/invoice/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invoiceId })
    })

    if (!response.ok) {
      throw new Error('Failed to generate invoice')
    }

    console.log('Invoice generation triggered for:', invoiceId)
  } catch (error) {
    console.error('Error triggering invoice generation:', error)
  }
} 