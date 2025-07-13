import { z } from 'zod';

export const customerInfoSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z.string()
    .email('Formato de email inválido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  
  phone: z.string()
    .optional()
    .refine(
      (phone) => !phone || /^[+]?[\d\s\-()]{7,15}$/.test(phone),
      'Formato de teléfono inválido'
    ),
  
  documento: z.string()
    .optional()
    .refine(
      (doc) => !doc || /^\d{6,15}$/.test(doc),
      'El documento debe contener solo números y tener entre 6 y 15 dígitos'
    ),
  
  apellidos: z.string()
    .optional()
    .refine(
      (apellidos) => !apellidos || apellidos.length <= 100,
      'Los apellidos no pueden exceder 100 caracteres'
    )
});

export const paymentRequestSchema = z.object({
  amount: z.number()
    .positive('El monto debe ser positivo')
    .min(1000, 'El monto mínimo es $1,000 COP')
    .max(50000000, 'El monto máximo es $50,000,000 COP')
    .multipleOf(0.01, 'El monto debe tener máximo 2 decimales'),
  
  currency: z.string()
    .optional()
    .default('COP')
    .refine(
      (currency) => ['COP', 'USD'].includes(currency),
      'Moneda no soportada. Use COP o USD'
    ),
  
  description: z.string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,()]+$/, 'La descripción contiene caracteres no válidos'),
  
  customerInfo: customerInfoSchema
});

export class PaymentValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'PaymentValidationError';
  }
}

export function validatePaymentRequest(data: any) {
  try {
    return paymentRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new PaymentValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

export function validateCustomerInfo(data: any) {
  try {
    return customerInfoSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new PaymentValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

export function formatCurrency(amount: number, currency: string = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}