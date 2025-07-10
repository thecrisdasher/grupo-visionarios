import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function generateReferralCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function calculateCommission(amount: number, level: number): number {
  const commissionRates = {
    1: 0.30, // 30% para referidos directos
    2: 0.15, // 15% para segundo nivel
    3: 0.10, // 10% para tercer nivel
  }
  
  return amount * (commissionRates[level as keyof typeof commissionRates] || 0)
}

export function getUserLevel(referrals: number): {
  level: string
  color: string
  nextLevel?: string
  progress?: number
} {
  if (referrals >= 50) {
    return { level: 'AVANZADO', color: 'accent' }
  } else if (referrals >= 20) {
    return {
      level: 'INTERMEDIO',
      color: 'secondary',
      nextLevel: 'AVANZADO',
      progress: Math.min((referrals - 20) / 30 * 100, 100)
    }
  } else {
    return {
      level: 'BÁSICO',
      color: 'primary',
      nextLevel: 'INTERMEDIO',
      progress: Math.min(referrals / 20 * 100, 100)
    }
  }
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function generateWhatsAppLink(
  phoneNumber: string,
  message: string,
  referralCode?: string
): string {
  const baseUrl = 'https://wa.me/'
  const phone = phoneNumber.replace(/\D/g, '') // Remove non-numeric characters
  let finalMessage = message
  
  if (referralCode) {
    finalMessage += ` Mi código de referido es: ${referralCode}`
  }
  
  const encodedMessage = encodeURIComponent(finalMessage)
  return `${baseUrl}${phone}?text=${encodedMessage}`
} 