import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { generateReferralCode } from '@/lib/utils'
import { generateUserLinks } from '@/lib/user-links'
import { sendWelcomeEmail } from '@/lib/email-service'

const completeRegistrationSchema = z.object({
  // Datos del afiliado (usando solo los campos disponibles en el schema actual)
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  documento: z.string().min(6),
  departamento: z.string().min(2),
  ciudad: z.string().min(2),
  nacimiento: z.date(),
  genero: z.string().min(1),
  referidoPor: z.string().optional(),
  password: z.string().min(8),
  
  // Datos del heredero (opcional) - se guardará en metadata del payment por ahora
  tieneHeredero: z.boolean(),
  heredero: z.object({
    nombre: z.string().optional(),
    documento: z.string().optional(),
    relacion: z.string().optional(),
    contacto: z.string().optional()
  }).optional(),

  // Datos del pago de ePayco
  paymentData: z.object({
    invoice: z.string(),
    ref_payco: z.string().optional(),
    amount: z.number(),
    currency: z.string()
  })
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = completeRegistrationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { 
      name, 
      email, 
      phone, 
      documento, 
      departamento, 
      ciudad, 
      nacimiento, 
      genero, 
      referidoPor, 
      password,
      tieneHeredero,
      heredero,
      paymentData
    } = parsed.data

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 })
    }

    // Validar referido si se proporciona
    let referrerUser = null
    if (referidoPor) {
      referrerUser = await prisma.user.findUnique({ 
        where: { referralCode: referidoPor } 
      })
      if (!referrerUser) {
        return NextResponse.json({ error: 'Código de referido inválido' }, { status: 400 })
      }
    }

    // Hash de la contraseña
    const hashedPassword = await hash(password, 10)

    // Generar código de referido y enlaces únicos
    const referralCode = generateReferralCode()
    const userLinks = generateUserLinks(name, '')

    // Obtener el primer nivel del sistema
    const firstLevel = await prisma.level.findFirst({
      where: { order: 1 }
    })

    // Preparar datos adicionales para guardar en metadata
    const additionalData = {
      documento,
      departamento,
      ciudad,
      nacimiento: nacimiento.toISOString(),
      genero,
      heredero: tieneHeredero ? heredero : null
    }

    // Crear usuario y datos relacionados en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear usuario con campos básicos (que existen en el schema actual)
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          referralCode,
          referredBy: referrerUser?.id,
          role: 'AFFILIATE',
          
          // Enlaces únicos
          inviteLink: userLinks.inviteLink,
          statsLink: userLinks.statsLink,
          trainingLink: userLinks.trainingLink,
          
          // Asignar primer nivel
          levelId: firstLevel?.id
        },
      })

      // 2. Registrar el pago con datos adicionales en metadata
      await tx.payment.create({
        data: {
          userId: user.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'COMPLETED',
          paymentMethod: 'epayco',
          transactionId: paymentData.invoice,
          description: 'Membresía Única - Grupo Visionarios',
          metadata: {
            membershipPayment: true,
            registrationComplete: true,
            // Guardar datos adicionales del afiliado que no están en el schema actual
            ...additionalData
          }
        }
      })

      // 3. Crear referido si hay referrer
      if (referrerUser) {
        await tx.referral.create({
          data: {
            referrerId: referrerUser.id,
            referredId: user.id,
            level: 1,
            commission: 0, // Se calculará después
            status: 'APPROVED'
          }
        })

        // Actualizar contadores del referrer
        await tx.user.update({
          where: { id: referrerUser.id },
          data: {
            directReferralsCount: {
              increment: 1
            }
          }
        })
      }

      return user
    })

    // Enviar email de bienvenida (sin esperar)
    try {
      await sendWelcomeEmail(email, name)
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // No fallar el registro por error de email
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Afiliación completada exitosamente',
      userId: result.id
    })

  } catch (error) {
    console.error('[COMPLETE_REGISTRATION_ERROR]', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
} 