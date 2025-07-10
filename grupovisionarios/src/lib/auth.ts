import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Correo', type: 'email', placeholder: 'correo@example.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }
        // Buscar usuario por email
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Copiar información relevante del token a la sesión
        (session.user as any).role = token.role
        if (token.sub) {
          (session.user as any).id = token.sub
        }
        if (token.email) {
          session.user.email = token.email as string
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // After sign-in redirect according to role
      if (url.startsWith('/')) return url
      if (url.includes('/admin')) return url
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper para obtener la sesión en el servidor
import { getServerSession } from 'next-auth'
export const getServerAuthSession = () => getServerSession(authOptions) 