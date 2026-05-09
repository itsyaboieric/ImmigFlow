import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { loginIpLimiter, loginEmailLimiter } from './rate-limit'

/** Client IP for login rate limiting (App Router passes Request-style headers). */
function clientIpFromAuthorizeReq(req: unknown): string {
  if (!req || typeof req !== 'object' || !('headers' in req)) return 'unknown'
  const headers = (req as { headers: Headers }).headers
  if (!headers || typeof headers.get !== 'function') return 'unknown'
  const xf = headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim() ?? 'unknown'
  return headers.get('x-real-ip')?.trim() ?? 'unknown'
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
        const ip = clientIpFromAuthorizeReq(req)

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
      // Persist fields from authorize() — JWT only receives `user` on first sign-in.
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.firmName = user.firmName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.email = token.email ?? ''
        session.user.name = token.name
        session.user.firmName = token.firmName
      }
      return session
    },
  },
}
