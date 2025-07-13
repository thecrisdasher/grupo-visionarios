interface LogContext {
  userId?: string;
  paymentId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  processingTime?: number;
  error?: string;
  statusCode?: number;
  event?: string;
  success?: boolean;
  operation?: string;
  duration_ms?: number;
  field?: string;
  status?: string;
  invoice?: string;
  invoiceNumber?: string;
}

enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

class PaymentLogger {
  private formatLogMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const baseLog = {
      timestamp,
      level,
      service: 'payment-gateway',
      message,
      ...context
    };
    
    return JSON.stringify(baseLog);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const logMessage = this.formatLogMessage(level, message, context);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Specific payment flow logging methods
  paymentStarted(context: LogContext): void {
    this.info('Payment process started', {
      ...context,
      event: 'payment_started'
    });
  }

  paymentValidationFailed(error: string, context: LogContext): void {
    this.warn('Payment validation failed', {
      ...context,
      event: 'validation_failed',
      error
    });
  }

  userCreated(context: LogContext): void {
    this.info('New user created during payment', {
      ...context,
      event: 'user_created'
    });
  }

  paymentRecordCreated(context: LogContext): void {
    this.info('Payment record created in database', {
      ...context,
      event: 'payment_record_created'
    });
  }

  ePaycoRequestSent(context: LogContext): void {
    this.info('PSE payment request sent to ePayco', {
      ...context,
      event: 'epayco_request_sent'
    });
  }

  ePaycoResponseReceived(success: boolean, context: LogContext): void {
    this.info(`ePayco response received: ${success ? 'success' : 'failure'}`, {
      ...context,
      event: 'epayco_response_received',
      success
    });
  }

  paymentCompleted(context: LogContext): void {
    this.info('Payment process completed successfully', {
      ...context,
      event: 'payment_completed'
    });
  }

  paymentFailed(error: string, context: LogContext): void {
    this.error('Payment process failed', {
      ...context,
      event: 'payment_failed',
      error
    });
  }

  databaseTransactionFailed(error: string, context: LogContext): void {
    this.error('Database transaction failed', {
      ...context,
      event: 'database_transaction_failed',
      error
    });
  }

  configurationError(error: string): void {
    this.error('Payment gateway configuration error', {
      event: 'configuration_error',
      error
    });
  }

  performanceMetric(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance metric: ${operation}`, {
      ...context,
      event: 'performance_metric',
      operation,
      duration_ms: duration
    });
  }
}

export const paymentLogger = new PaymentLogger();
export type { LogContext };