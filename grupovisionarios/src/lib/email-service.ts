import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface InvoiceEmailData {
  to: string
  customerName: string
  invoiceNumber: string
  amount: number
  currency: string
  pdfBuffer: Buffer
}

// Email configuration
const getEmailConfig = (): EmailConfig => {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  }
}

// Create transporter
const createTransporter = () => {
  const config = getEmailConfig()
  return nodemailer.createTransport(config)
}

export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<void> {
  try {
    const transporter = createTransporter()

    // Format amount
    const formattedAmount = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: data.currency,
      minimumFractionDigits: 0
    }).format(data.amount)

    // Email HTML template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura - Grupo Visionarios</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #3B82F6;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #3B82F6;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #6B7280;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #1F2937;
            }
            .invoice-details {
                background-color: #F3F4F6;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
            }
            .detail-label {
                font-weight: 600;
                color: #374151;
            }
            .detail-value {
                color: #1F2937;
            }
            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #3B82F6;
                text-align: center;
                padding: 15px;
                background-color: #EBF8FF;
                border-radius: 6px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #E5E7EB;
                color: #6B7280;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background-color: #3B82F6;
                color: #ffffff;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
            }
            .success-badge {
                background-color: #10B981;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                display: inline-block;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">GRUPO VISIONARIOS</div>
                <div class="subtitle">Tu factura está lista</div>
            </div>
            
            <div class="content">
                <div class="greeting">¡Hola ${data.customerName}!</div>
                
                <div class="success-badge">✓ PAGO CONFIRMADO</div>
                
                <p>Gracias por tu pago. Hemos procesado exitosamente tu transacción y tu factura electrónica está lista.</p>
                
                <div class="invoice-details">
                    <div class="detail-row">
                        <span class="detail-label">Número de Factura:</span>
                        <span class="detail-value">${data.invoiceNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha:</span>
                        <span class="detail-value">${new Date().toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Estado:</span>
                        <span class="detail-value" style="color: #10B981; font-weight: 600;">PAGADO</span>
                    </div>
                </div>
                
                <div class="amount">
                    Total Pagado: ${formattedAmount}
                </div>
                
                <p>Tu factura se encuentra adjunta en este correo en formato PDF. Puedes descargarla y guardarla para tus registros.</p>
                
                <p>Si tienes alguna pregunta sobre esta factura o necesitas asistencia, no dudes en contactarnos:</p>
                
                <ul>
                    <li><strong>Email:</strong> support@grupovisionarios.com</li>
                    <li><strong>WhatsApp:</strong> +57 (320) 727-7421</li>
                    <li><strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                <p><strong>Grupo Visionarios S.A.S.</strong><br>
                Calle 123 #45-67, Bogotá, Colombia<br>
                NIT: 123.456.789-0</p>
            </div>
        </div>
    </body>
    </html>
    `

    // Plain text version
    const textTemplate = `
    GRUPO VISIONARIOS - Factura Electrónica
    
    ¡Hola ${data.customerName}!
    
    ✓ PAGO CONFIRMADO
    
    Gracias por tu pago. Hemos procesado exitosamente tu transacción.
    
    Detalles de la factura:
    - Número de Factura: ${data.invoiceNumber}
    - Fecha: ${new Date().toLocaleDateString('es-CO')}
    - Total Pagado: ${formattedAmount}
    - Estado: PAGADO
    
    Tu factura se encuentra adjunta en formato PDF.
    
    Para cualquier consulta:
    - Email: support@grupovisionarios.com
    - WhatsApp: +57 (320) 727-7421
    
    Grupo Visionarios S.A.S.
    NIT: 123.456.789-0
    `

    // Email options
    const mailOptions = {
      from: {
        name: 'Grupo Visionarios',
        address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@grupovisionarios.com'
      },
      to: data.to,
      subject: `Factura ${data.invoiceNumber} - Pago Confirmado`,
      text: textTemplate,
      html: htmlTemplate,
      attachments: [
        {
          filename: `Factura-${data.invoiceNumber}.pdf`,
          content: data.pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log('Invoice email sent successfully:', info.messageId)

  } catch (error) {
    console.error('Error sending invoice email:', error)
    throw new Error('Failed to send invoice email')
  }
}

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('Email service connection verified successfully')
    return true
  } catch (error) {
    console.error('Email service connection failed:', error)
    return false
  }
}

// Send welcome email
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: {
        name: 'Grupo Visionarios',
        address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@grupovisionarios.com'
      },
      to,
      subject: '¡Bienvenido a Grupo Visionarios!',
      html: `
        <h2>¡Bienvenido ${name}!</h2>
        <p>Gracias por unirte a Grupo Visionarios. Estamos emocionados de tenerte en nuestro equipo.</p>
        <p>Pronto recibirás más información sobre cómo empezar.</p>
        <p>¡Saludos!<br>Equipo Grupo Visionarios</p>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Welcome email sent successfully to:', to)
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw new Error('Failed to send welcome email')
  }
} 