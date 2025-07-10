import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateInvoicePDF } from '@/lib/pdf-generator'
import { sendInvoiceEmail } from '@/lib/email-service'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID de factura requerido' },
        { status: 400 }
      )
    }

    // Get invoice data with related information
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true,
        payment: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice)
    
    // Save PDF to file system or cloud storage
    // For this example, we'll encode as base64 and store in DB
    const pdfBase64 = pdfBuffer.toString('base64')
    const pdfUrl = `data:application/pdf;base64,${pdfBase64}`

    // Update invoice with PDF URL
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        pdfUrl,
        status: 'SENT'
      }
    })

    // Send email with PDF attachment
    try {
      await sendInvoiceEmail({
        to: invoice.user.email,
        customerName: invoice.user.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount.toNumber(),
        currency: invoice.currency,
        pdfBuffer
      })

      // Update email sent status
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          emailSent: true,
          emailSentAt: new Date()
        }
      })

      console.log('Invoice email sent successfully to:', invoice.user.email)
    } catch (emailError) {
      console.error('Error sending invoice email:', emailError)
      // Continue execution even if email fails
    }

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      pdfUrl: updatedInvoice.pdfUrl
    })

  } catch (error: any) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve invoice PDF
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('id')

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID de factura requerido' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { pdfUrl: true, invoiceNumber: true }
    })

    if (!invoice || !invoice.pdfUrl) {
      return NextResponse.json(
        { error: 'Factura o PDF no encontrado' },
        { status: 404 }
      )
    }

    // If it's a data URL, extract the base64 content
    if (invoice.pdfUrl.startsWith('data:application/pdf;base64,')) {
      const base64Data = invoice.pdfUrl.split(',')[1]
      const pdfBuffer = Buffer.from(base64Data, 'base64')

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Factura-${invoice.invoiceNumber}.pdf"`
        }
      })
    }

    // If it's a URL, redirect to it
    return NextResponse.redirect(invoice.pdfUrl)

  } catch (error: any) {
    console.error('Error retrieving invoice PDF:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 