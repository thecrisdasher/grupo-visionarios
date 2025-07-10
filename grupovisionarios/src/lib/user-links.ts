// Types and utility helpers for generating and working with user-specific links that are used across the application.

export interface UserLinks {
  /** Slug (not full URL) that identifies the invite page */
  inviteLink: string
  /** Slug (not full URL) that identifies the public stats page */
  statsLink: string
  /** Slug (not full URL) that identifies the training page */
  trainingLink: string
}

/**
 * Converts an arbitrary string into a URL-friendly slug.
 */
function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with –
    .replace(/[^a-z0-9\-]/g, '') // Remove all non-alphanumeric chars except -
    .replace(/\-+/g, '-') // Replace multiple – with single –
}

/**
 * Generates a cryptographically-unsafe but sufficiently unique random string
 * that we can append to a slug so that two users with the same name don't end
 * up with identical links.
 */
function randomSuffix(length: number = 6): string {
  return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * Generates the three link slugs (invite, stats, training) that we persist in
 * the database. These are NOT full URLs – the caller must prepend the correct
 * pathname later (e.g. /invite/). The function is used in several API routes.
 */
export function generateUserLinks(userName: string, _userId: string): UserLinks {
  const base = slugify(userName)
  const suffix = randomSuffix()

  return {
    inviteLink: `${base}-${suffix}`,
    statsLink: `${base}-${randomSuffix()}`,
    trainingLink: `${base}-${randomSuffix()}`,
  }
}

/**
 * Builds full, absolute URLs for each of the three pages given a set of user
 * link slugs. It relies on the NEXT_PUBLIC_APP_URL environment variable to
 * know where the Next.js site is hosted (falls back to an empty string so that
 * the links are relative when the env variable is missing, e.g. during local
 * development).
 */
export function generateFullUserUrls(links: UserLinks) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  return {
    inviteUrl: `${baseUrl}/invite/${links.inviteLink}`,
    statsUrl: `${baseUrl}/stats/${links.statsLink}`,
    trainingUrl: `${baseUrl}/training/${links.trainingLink}`,
  }
}

export type ShareableLink = {
  /** What type of link this is so that the UI can decide wording/icons */
  type: 'invite' | 'stats' | 'training'
  /** Title that shows up when the link is shared */
  title: string
  /** Short description used in social shares */
  description: string
  /** The URL that should be copied/opened */
  url: string
}

/**
 * Returns an array with user-friendly objects that the frontend can use for
 * share buttons/social media. The wording is in Spanish because the platform
 * is Spanish-speaking.
 */
export function createShareableLinks(links: UserLinks, userName: string): ShareableLink[] {
  const { inviteUrl, statsUrl, trainingUrl } = generateFullUserUrls(links)

  return [
    {
      type: 'invite',
      title: 'Únete a Grupo Visionarios',
      description: `¡Hola! ${userName} te invita a unirte a nuestra comunidad.`,
      url: inviteUrl,
    },
    {
      type: 'stats',
      title: 'Mira mis estadísticas en Grupo Visionarios',
      description: `Conoce mi progreso y resultados dentro de la plataforma.`,
      url: statsUrl,
    },
    {
      type: 'training',
      title: 'Capacitación en Grupo Visionarios',
      description: `Accede al centro de capacitación que he preparado para ti.`,
      url: trainingUrl,
    },
  ]
} 