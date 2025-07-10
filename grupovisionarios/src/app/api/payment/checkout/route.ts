import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { generateUserLinks } from '@/lib/user-links'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
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

    // Convert amount to cents for Stripe (COP doesn't use decimals)
    const stripeAmount = currency === 'COP' ? Math.round(amount) : Math.round(amount * 100)

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

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: currency.toLowerCase(),
      description,
      metadata: {
        userId: user.id,
        userEmail: customerInfo.email,
        userName: customerInfo.name,
      },
      receipt_email: customerInfo.email,
    })

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount,
        currency,
        status: 'PENDING',
        paymentMethod: 'card',
        stripePaymentId: paymentIntent.id,
        description,
        metadata: {
          customerInfo,
          stripeAmount
        }
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id
    })

  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Helper function to generate referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
} 