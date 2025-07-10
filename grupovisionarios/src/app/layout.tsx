import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import dynamic from 'next/dynamic'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'
import '@/styles/globals.css'
import { WhatsAppFloat } from '@/components/ui'
import { Toaster } from 'react-hot-toast'

// Cargar ThemeWrapper solo en el cliente para evitar errores de hidratación
const ThemeWrapper = dynamic(() => import('@/components/ThemeWrapper'), {
  ssr: false,
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: {
    default: 'Grupo Visionarios - Marketing de Afiliados',
    template: '%s | Grupo Visionarios'
  },
  description: 'Plataforma profesional de marketing de afiliados multinivel. Únete a nuestra red de visionarios y construye tu futuro financiero.',
  keywords: [
    'marketing de afiliados',
    'multinivel',
    'grupo visionarios',
    'ingresos pasivos',
    'oportunidad de negocio',
    'red de mercadeo'
  ],
  authors: [{ name: 'Grupo Visionarios' }],
  creator: 'Grupo Visionarios',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://grupovisionarios.com',
    title: 'Grupo Visionarios - Marketing de Afiliados',
    description: 'Plataforma profesional de marketing de afiliados multinivel.',
    siteName: 'Grupo Visionarios',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Grupo Visionarios'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grupo Visionarios - Marketing de Afiliados',
    description: 'Plataforma profesional de marketing de afiliados multinivel.',
    images: ['/images/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  verification: {
    google: 'google-verification-code',
    yandex: 'yandex-verification-code'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <SessionProviderWrapper>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </SessionProviderWrapper>
        <WhatsAppFloat />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
} 