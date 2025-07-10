import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#3B82F6',
    paddingBottom: 15
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6'
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'bold'
  },
  value: {
    fontSize: 12,
    color: '#1F2937'
  },
  itemsTable: {
    marginTop: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#D1D5DB'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#E5E7EB'
  },
  tableCol: {
    flex: 1,
    fontSize: 11
  },
  tableColHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151'
  },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalBox: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 5,
    minWidth: 200
  },
  totalLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  totalAmount: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6B7280',
    borderTop: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10
  },
  paymentInfo: {
    backgroundColor: '#F0FDF4',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    borderLeft: 4,
    borderLeftColor: '#22C55E'
  },
  paymentStatus: {
    fontSize: 12,
    color: '#166534',
    fontWeight: 'bold'
  }
})

interface InvoiceData {
  id: string
  invoiceNumber: string
  amount: any // Prisma Decimal
  currency: string
  concept: string
  createdAt: Date
  user: {
    name: string
    email: string
    phone?: string | null
  }
  payment: {
    transactionId?: string | null
    createdAt: Date
  }
}

const InvoiceDocument: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>GRUPO VISIONARIOS</Text>
            <Text style={styles.invoiceNumber}>NIT: 123.456.789-0</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>No. {data.invoiceNumber}</Text>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Empresa</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Razón Social:</Text>
            <Text style={styles.value}>Grupo Visionarios S.A.S.</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>Calle 123 #45-67, Bogotá, Colombia</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>+57 (320) 727-7421</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>facturacion@grupovisionarios.com</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{data.user.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.user.email}</Text>
          </View>
          {data.user.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{data.user.phone}</Text>
            </View>
          )}
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles de la Factura</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Emisión:</Text>
            <Text style={styles.value}>{formatDate(data.createdAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Pago:</Text>
            <Text style={styles.value}>{formatDate(data.payment.createdAt)}</Text>
          </View>
          {data.payment.transactionId && (
            <View style={styles.row}>
              <Text style={styles.label}>ID de Transacción:</Text>
              <Text style={styles.value}>{data.payment.transactionId}</Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.itemsTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableColHeader}>Descripción</Text>
            <Text style={styles.tableColHeader}>Cantidad</Text>
            <Text style={styles.tableColHeader}>Valor Unitario</Text>
            <Text style={styles.tableColHeader}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>{data.concept}</Text>
            <Text style={styles.tableCol}>1</Text>
            <Text style={styles.tableCol}>{formatAmount(data.amount.toNumber(), data.currency)}</Text>
            <Text style={styles.tableCol}>{formatAmount(data.amount.toNumber(), data.currency)}</Text>
          </View>
        </View>

        {/* Payment Status */}
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentStatus}>✓ PAGADO - Esta factura ha sido pagada exitosamente</Text>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL PAGADO</Text>
            <Text style={styles.totalAmount}>{formatAmount(data.amount.toNumber(), data.currency)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Gracias por confiar en Grupo Visionarios. Esta factura ha sido generada electrónicamente.
          {'\n'}Para cualquier consulta, contacte: support@grupovisionarios.com
        </Text>
      </Page>
    </Document>
  )
}

export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  try {
    const pdfBuffer = await renderToBuffer(<InvoiceDocument data={invoiceData} />)
    return pdfBuffer
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
} 