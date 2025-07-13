# Payment Gateway Implementation

## Overview

This directory contains the refactored payment gateway implementation for Grupo Visionarios, specifically integrated with ePayco PSE (Pagos Seguros en Línea) for Colombian bank transfers.

## Architecture

### Key Components

1. **Types** (`/src/types/epayco.ts`)
   - TypeScript interfaces for all ePayco interactions
   - Strong typing for payment requests and responses
   - Custom error classes for better error handling

2. **Services** (`/src/services/epayco.service.ts`)
   - Centralized ePayco API integration
   - Configuration validation
   - Structured error handling
   - Request/response logging

3. **Validation** (`/src/lib/validation/payment.validation.ts`)
   - Zod schemas for robust input validation
   - Colombian-specific validations (phone, document formats)
   - Data sanitization utilities
   - Currency formatting

4. **Database** (`/src/lib/database/transaction.utils.ts`)
   - Atomic database operations
   - Transaction management
   - User and payment creation in single transaction
   - Payment status updates

5. **Logging** (`/src/lib/logging/payment.logger.ts`)
   - Structured JSON logging
   - Payment flow tracking
   - Performance metrics
   - Error reporting

## API Endpoints

### POST `/api/payment/checkout`

Creates a new PSE payment with ePayco.

**Request Body:**
```json
{
  "amount": 50000,
  "currency": "COP",
  "description": "Membresía Grupo Visionarios",
  "customerInfo": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "3001234567",
    "documento": "12345678",
    "apellidos": "Pérez García"
  }
}
```

**Response:**
```json
{
  "success": true,
  "payment_url": "https://secure.epayco.co/...",
  "invoice": "GV-1234567890-abc123",
  "paymentId": "cuid-payment-id",
  "ref_payco": "epayco-reference"
}
```

## Security Features

1. **Input Validation**
   - All inputs validated with Zod schemas
   - SQL injection prevention
   - XSS protection through sanitization

2. **Error Handling**
   - No sensitive data in error responses
   - Structured error logging
   - Graceful degradation

3. **Database Security**
   - Atomic transactions
   - Proper connection management
   - User data encryption (where applicable)

## Configuration

Required environment variables:

```env
EPAYCO_PUBLIC_KEY=your_public_key
EPAYCO_PRIVATE_KEY=your_private_key
EPAYCO_TEST=true|false
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://...
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Validation Errors** (400)
   - Invalid input data
   - Missing required fields
   - Format violations

2. **Configuration Errors** (503)
   - Missing ePayco credentials
   - Service unavailable

3. **Payment Errors** (500)
   - ePayco API failures
   - Database transaction failures
   - Network timeouts

## Logging

All payment operations are logged with structured data:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "service": "payment-gateway",
  "message": "Payment process started",
  "event": "payment_started",
  "userId": "user-id",
  "paymentId": "payment-id",
  "amount": 50000,
  "currency": "COP",
  "ip": "192.168.1.1",
  "processingTime": 1500
}
```

## Performance Considerations

1. **Database Transactions**
   - Atomic operations minimize lock time
   - Proper error handling prevents hanging transactions

2. **API Calls**
   - Timeout handling for external services
   - Retry logic for transient failures

3. **Logging**
   - Structured JSON for efficient parsing
   - Performance metrics tracking

## Testing

The implementation supports both test and production modes through the `EPAYCO_TEST` environment variable.

## Monitoring

Key metrics to monitor:

- Payment success rate
- Average processing time
- Error rates by type
- Database transaction times
- ePayco API response times

## Future Improvements

1. **Retry Logic**
   - Implement exponential backoff for failed requests
   - Queue system for handling high volumes

2. **Caching**
   - Cache ePayco configuration
   - Redis for session management

3. **Webhooks**
   - Implement proper webhook validation
   - Idempotency for duplicate notifications

4. **Analytics**
   - Payment funnel analysis
   - Conversion rate tracking
   - Revenue reporting