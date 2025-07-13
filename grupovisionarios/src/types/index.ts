// User Types
export interface User {
  id: string
  name: string
  email: string
  inviteLink?: string
  statsLink?: string
  trainingLink?: string
  level?: string
  referralCode?: string
  referrerId?: string
  createdAt?: Date
  updatedAt?: Date
}

// Re-export UserReferralStructure from multilevel-system
export type { UserReferralStructure } from '@/lib/multilevel-system'

// Referral Types
export interface Referral {
  id: string
  name: string
  email: string
  joinDate: string
  status: 'active' | 'inactive' | 'pending'
  level: number
  earnings?: number
  referralsCount?: number
}

// Level Types - Updated to match database structure and component usage
export interface Level {
  id: string
  name: string
  icon: string
  color: string
  order: number
  commissionRate: number
  requirements: {
    referrals: number
    earnings: number
  }
  requirementsDescription?: string
  isActive?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

// Evaluation Types
export interface Evaluation {
  success: boolean
  currentLevel: Level
  nextLevel?: Level
  progress: {
    referrals: number
    earnings: number
  }
  canPromote: boolean
}

// Promotion Evaluation Types - Updated to match API response structure
export interface PromotionEvaluation {
  success: boolean
  currentLevel: Level
  nextLevel?: Level
  directReferrals: number
  validSecondLevelReferrals: number
  canPromote: boolean
  progress: {
    referrals: number
    earnings: number
  }
  promoted?: boolean
  message?: string
  error?: string
  missingRequirements?: string[]
  requiredStructure?: string
}

// API Response type alias
export type PromotionApiResponse = PromotionEvaluation

// Statistics Types
export interface Statistics {
  totalReferrals: number
  activeReferrals: number
  totalEarnings: number
  monthlyEarnings: number
}

// Structure Types
export interface Structure {
  success: boolean
  user: User
  statistics: Statistics
  structure: Referral[]
}

// Monthly Data Types
export interface MonthlyData {
  referrals: number
  earnings: number
  conversions: number
  newSignups: number
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Payment Types
export interface PaymentData {
  amount: number
  currency: string
  reference: string
  description: string
  buyerEmail: string
  buyerFullName: string
}

export interface PaymentResponse {
  success: boolean
  checkoutUrl?: string
  error?: string
}