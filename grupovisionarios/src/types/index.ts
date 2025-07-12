// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'affiliate'
  referralCode: string
  referredBy?: string
  phone?: string
  avatar?: string
  isActive: boolean
  levelId: string
  level?: Level
  createdAt: Date
  updatedAt: Date
}

// Level types for the new multilevel system
export interface Level {
  id: string
  name: string
  order: number
  commissionRate: number
  requirementsDescription: string
  color: string
  icon: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Level promotion types
export interface LevelPromotion {
  id: string
  userId: string
  fromLevelId?: string
  toLevelId: string
  promotedAt: Date
  reason: string
  directReferrals: number
  validStructure: boolean
  fromLevel?: Level
  toLevel: Level
}

// Referral types
export interface Referral {
  id: string
  referrerId: string
  referredId: string
  level: number
  commission: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  createdAt: Date
  updatedAt: Date
  referrer?: User
  referred?: User
}

// New multilevel system types
export interface UserReferralStructure {
  id: string
  name: string
  email: string
  level: {
    id: string
    name: string
    order: number
    color: string
    icon: string
  }
  directReferrals: UserReferralStructure[]
  referralCount: number
  isActive: boolean
  joinDate: Date
}

export interface PromotionEvaluation {
  canPromote: boolean
  currentLevel: number
  nextLevel?: number
  directReferrals: number
  validSecondLevelReferrals: number
  requiredStructure: string
  missingRequirements?: string[]
}

export interface ReferralStats {
  totalReferrals: number
  directReferrals: number
  indirectReferrals: number
  totalCommissions: number
  pendingCommissions: number
  paidCommissions: number
  currentLevel: Level
  nextLevel?: Level
  canPromote: boolean
  promotionProgress: number
}

// Legacy types - keeping for backward compatibility
export interface UserLevel {
  name: string
  color: string
  minReferrals?: number
  maxReferrals?: number
  commissionRate: number
  benefits?: string[]
}

export interface PaymentStatus {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  paymentMethod: string
  stripePaymentId?: string
  createdAt: Date
}

export interface InvoiceData {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  concept: string
  pdfUrl?: string
  emailSent: boolean
  dueDate?: Date
  paidAt?: Date
  createdAt: Date
}

export interface AffiliateStats {
  totalReferrals: number
  monthlyReferrals: number
  totalCommissions: number
  pendingCommissions: number
  currentLevel: Level
  nextLevel?: Level
  nextLevelProgress: number
  recentReferrals: Referral[]
  commissionHistory: CommissionHistory[]
  promotionHistory: LevelPromotion[]
  canPromote: boolean
}

export interface CommissionHistory {
  id: string
  amount: number
  type: 'referral' | 'bonus' | 'penalty'
  description: string
  status: 'pending' | 'paid'
  createdAt: Date
}

// Dashboard types
export interface DashboardStats {
  user: User
  stats: AffiliateStats
  structure: UserReferralStructure
  evaluation: PromotionEvaluation
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ReferralApiResponse extends ApiResponse {
  referralCreated?: boolean
  promoted?: boolean
  newLevel?: Level
  referrer?: {
    id: string
    name: string
    level: Level
    totalReferrals: number
  }
}

export interface StructureApiResponse extends ApiResponse {
  user?: {
    id: string
    name: string
    email: string
    level: Level
    isActive: boolean
    joinDate: Date
  }
  structure?: UserReferralStructure[]
  statistics?: {
    directReferrals: number
    totalReferrals: number
    activeReferrals: number
    maxDepth: number
    hasThreeDirects: boolean
    directsWithThree: number
    isValid3x3: boolean
  }
  validation?: {
    canPromote: boolean
    requirements: {
      directReferrals: {
        required: number
        current: number
        met: boolean
      }
      secondLevelReferrals: {
        required: number
        current: number
        met: boolean
      }
    }
  }
}

export interface PromotionApiResponse extends ApiResponse {
  promoted?: boolean
  promotion?: {
    fromLevel: Level
    toLevel: Level
    promotedAt: Date
    reason: string
  }
  updatedUserInfo?: any
  evaluation?: PromotionEvaluation
  progress?: {
    percentage: number
    directReferrals: {
      current: number
      required: number
      percentage: number
    }
    validStructure: {
      current: number
      required: number
      percentage: number
    }
  }
  requirements?: {
    met: boolean
    missing: string[]
    description: string
  }
}

// Component prop types
export interface LevelDisplayProps {
  level: Level
  showIcon?: boolean
  showName?: boolean
  showProgress?: boolean
  className?: string
}

export interface ReferralTreeProps {
  structure: UserReferralStructure
  maxDepth?: number
  interactive?: boolean
  onNodeClick?: (node: UserReferralStructure) => void
}

export interface PromotionProgressProps {
  evaluation: PromotionEvaluation
  currentLevel: Level
  nextLevel?: Level
  showDetails?: boolean
}

// Company values types
export interface Value {
  id: string
  title: string
  description: string
  content: string
  imageUrl: string
  videoUrl: string
  order: number
  isActive: boolean
} 