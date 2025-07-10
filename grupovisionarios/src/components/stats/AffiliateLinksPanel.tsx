'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { cn } from '@/lib/utils'
import { 
  Share2,
  Users,
  BarChart3,
  GraduationCap,
  RefreshCw,
  ExternalLink,
  Eye,
  QrCode,
  MessageCircle,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Download,
  Smartphone
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AffiliateLink {
  id: string
  type: 'invite' | 'stats' | 'training'
  title: string
  description: string
  url: string
  shortUrl?: string
  icon: React.ReactNode
  color: string
  bgColor: string
  stats?: {
    clicks: number
    conversions: number
    lastAccess?: Date
  }
}

interface AffiliateLinksData {
  inviteLink: string
  statsLink: string
  trainingLink: string
}

interface AffiliateLinksPanel extends React.HTMLAttributes<HTMLDivElement> {
  links: AffiliateLinksData
  userName: string
  onRegenerateLinks?: () => Promise<void>
  isRegenerating?: boolean
  className?: string
}

// Mock stats data - en una app real vendría de API
const mockStats = {
  invite: { clicks: 156, conversions: 12, lastAccess: new Date() },
  stats: { clicks: 89, conversions: 5, lastAccess: new Date() },
  training: { clicks: 234, conversions: 8, lastAccess: new Date() }
}

export const AffiliateLinksPanel: React.FC<AffiliateLinksPanel> = ({
  links,
  userName,
  onRegenerateLinks,
  isRegenerating = false,
  className,
  ...props
}) => {
  const [selectedLink, setSelectedLink] = useState<AffiliateLink | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const affiliateLinks: AffiliateLink[] = [
    {
      id: 'invite',
      type: 'invite',
      title: 'Enlace de Invitación',
      description: 'Invita nuevos afiliados a tu red',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://grupovisionarios.com'}/invite/${links.inviteLink}`,
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      stats: mockStats.invite
    },
    {
      id: 'stats',
      type: 'stats',
      title: 'Enlace de Estadísticas',
      description: 'Comparte tus estadísticas públicas',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://grupovisionarios.com'}/stats/${links.statsLink}`,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      stats: mockStats.stats
    },
    {
      id: 'training',
      type: 'training',
      title: 'Enlace de Capacitación',
      description: 'Acceso a tu centro de capacitación',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://grupovisionarios.com'}/training/${links.trainingLink}`,
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      stats: mockStats.training
    }
  ]

  const handleViewLink = (link: AffiliateLink) => {
    window.open(link.url, '_blank')
    toast.success(`Abriendo ${link.title}`)
  }

  const handleShareLink = (link: AffiliateLink) => {
    setSelectedLink(link)
    setShareModalOpen(true)
  }

  const handleSocialShare = async (platform: string, link: AffiliateLink) => {
    const text = `¡Únete a mi red en Grupo Visionarios! ${link.description}`
    const url = link.url

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent('Invitación a Grupo Visionarios')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
    }

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank')
      toast.success(`Compartiendo en ${platform}`)
    }
  }

  const generateQRCode = (link: AffiliateLink) => {
    // En una implementación real, se usaría una librería como qrcode
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link.url)}`
    
    // Crear un elemento para descargar
    const downloadLink = document.createElement('a')
    downloadLink.href = qrUrl
    downloadLink.download = `qr-${link.type}-${userName}.png`
    downloadLink.click()
    
    toast.success('Descargando código QR')
  }

  return (
    <>
      <Card className={cn('overflow-hidden', className)} {...props}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Tus Enlaces Únicos
            </CardTitle>
            <Button
              onClick={onRegenerateLinks}
              variant="outline"
              size="sm"
              disabled={isRegenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn(
                'w-4 h-4',
                isRegenerating && 'animate-spin'
              )} />
              {isRegenerating ? 'Regenerando...' : 'Regenerar'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {affiliateLinks.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative p-4 rounded-lg border-2 border-gray-200',
                  'hover:border-gray-300 transition-all duration-200',
                  'bg-white hover:shadow-sm'
                )}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    link.bgColor
                  )}>
                    <div className={link.color}>
                      {link.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {link.description}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  {link.stats && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {link.stats.clicks} clicks
                      </div>
                      <div className="text-xs text-gray-500">
                        {link.stats.conversions} conversiones
                      </div>
                    </div>
                  )}
                </div>

                {/* URL Display */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={link.url}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-700 truncate focus:outline-none"
                    />
                    <CopyButton
                      text={link.url}
                      variant="ghost"
                      size="sm"
                      showText={false}
                      successMessage={`${link.title} copiado`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewLink(link)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleShareLink(link)}
                    className="flex items-center gap-1"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateQRCode(link)}
                    className="flex items-center gap-1"
                  >
                    <QrCode className="w-4 h-4" />
                    QR
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-3">Resumen de Enlaces</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {affiliateLinks.reduce((sum, link) => sum + (link.stats?.clicks || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Clicks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {affiliateLinks.reduce((sum, link) => sum + (link.stats?.conversions || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Conversiones</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {affiliateLinks.length}
                </div>
                <div className="text-xs text-gray-600">Enlaces Activos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      {shareModalOpen && selectedLink && (
        <ShareModal
          link={selectedLink}
          onClose={() => {
            setShareModalOpen(false)
            setSelectedLink(null)
          }}
          onShare={handleSocialShare}
        />
      )}
    </>
  )
}

// Modal para compartir enlaces
interface ShareModalProps {
  link: AffiliateLink
  onClose: () => void
  onShare: (platform: string, link: AffiliateLink) => void
}

const ShareModal: React.FC<ShareModalProps> = ({ link, onClose, onShare }) => {
  const socialPlatforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, color: 'bg-green-500' },
    { id: 'twitter', name: 'Twitter', icon: <Twitter className="w-5 h-5" />, color: 'bg-blue-400' },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, color: 'bg-blue-700' },
    { id: 'email', name: 'Email', icon: <Mail className="w-5 h-5" />, color: 'bg-gray-600' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Compartir {link.title}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Elige cómo quieres compartir tu enlace
        </p>

        <div className="grid grid-cols-2 gap-3">
          {socialPlatforms.map((platform) => (
            <Button
              key={platform.id}
              variant="outline"
              className="flex items-center gap-2 justify-start h-12"
              onClick={() => {
                onShare(platform.id, link)
                onClose()
              }}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-white',
                platform.color
              )}>
                {platform.icon}
              </div>
              {platform.name}
            </Button>
          ))}
        </div>

        {/* URL Preview */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">URL a compartir:</p>
          <p className="text-sm text-gray-700 truncate">{link.url}</p>
        </div>
      </motion.div>
    </motion.div>
  )
} 