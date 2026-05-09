import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { loginIpLimiter, loginEmailLimiter } from './rate-limit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const normalizedEmail = credentials.email.toLowerCase().trim()

        // Rate-limit by IP then by email to resist brute-force
        const headers = (req as { headers?: Record<string, string> }).headers ?? {}
        const forwarded = headers['x-forwarded-for']
        const ip = (forwarded ? forwarded.split(',')[0]?.trim() : headers['x-real-ip']?.trim()) ?? 'unknown'

        const ipCheck = loginIpLimiter.check(`ip:${ip}`)
        if (!ipCheck.ok) { console.warn(`[auth] Login rate-limit (IP) — ip=${ip}`); return null }

        const emailCheck = loginEmailLimiter.check(`email:${normalizedEmail}`)
        if (!emailCheck.ok) { console.warn(`[auth] Login rate-limit (email) — email=${normalizedEmail}`); return null }

        // Look up user and verify password
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name, firmName: user.firmName }
      },
    }),
  ],
  session:  { strategy: 'jwt' },
  pages:    { signIn: '/sign-in' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.firmName = user.firmName }
      return token
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id; session.user.firmName = token.firmName }
      return session
    },
  },
}
