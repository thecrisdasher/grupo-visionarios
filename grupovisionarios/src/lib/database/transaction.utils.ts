import { PrismaClient } from '@prisma/client';

export class DatabaseTransactionManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async executeInTransaction<T>(
    operation: (tx: any) => Promise<T>
  ): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      try {
        return await operation(tx);
      } catch (error) {
        console.error('[Database] Transaction failed:', error);
        throw error;
      }
    });
  }

  async createUserAndPayment(
    userData: {
      email: string;
      name: string;
      phone?: string;
      referralCode: string;
      inviteLink: string;
      statsLink: string;
      trainingLink: string;
    },
    paymentData: {
      amount: number;
      currency: string;
      transactionId: string;
      description: string;
      metadata: any;
    }
  ) {
    return await this.executeInTransaction(async (tx) => {
      // Check if user already exists
      let user = await tx.user.findUnique({
        where: { email: userData.email }
      });

      if (!user) {
        // Create new user
        user = await tx.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            phone: userData.phone || null,
            password: '', // Will be set during proper registration
            referralCode: userData.referralCode,
            inviteLink: userData.inviteLink,
            statsLink: userData.statsLink,
            trainingLink: userData.trainingLink,
            isActive: false, // Mark as inactive until proper registration
          }
        });
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'PENDING',
          paymentMethod: 'epayco_pse',
          transactionId: paymentData.transactionId,
          description: paymentData.description,
          metadata: paymentData.metadata,
        }
      });

      return { user, payment };
    });
  }

  async updatePaymentStatus(
    paymentId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED',
    metadata?: any
  ) {
    return await this.executeInTransaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          ...(metadata && { metadata }),
          updatedAt: new Date(),
        },
        include: {
          user: true,
        }
      });

      // If payment is completed, activate user and handle referrals
      if (status === 'COMPLETED' && !payment.user.isActive) {
        await tx.user.update({
          where: { id: payment.userId },
          data: {
            isActive: true,
            updatedAt: new Date(),
          }
        });

        // TODO: Handle referral commissions here
        // This would involve finding the referrer and creating referral records
      }

      return payment;
    });
  }

  async findPaymentByTransaction(transactionId: string) {
    return await this.prisma.payment.findFirst({
      where: { transactionId },
      include: {
        user: true,
      }
    });
  }

  async createPaymentWithUser(
    userId: string,
    paymentData: {
      amount: number;
      currency: string;
      transactionId: string;
      description: string;
      metadata: any;
    }
  ) {
    return await this.prisma.payment.create({
      data: {
        userId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'PENDING',
        paymentMethod: 'epayco_pse',
        transactionId: paymentData.transactionId,
        description: paymentData.description,
        metadata: paymentData.metadata,
      }
    });
  }
}