/**
 * NextAuth configuration.
 * Credentials provider with JWT sessions (no DB session table).
 *
 * Security notes:
 *   - Login attempts are rate-limited per IP and per email address to resist brute-force.
 *   - The session JWT is signed with NEXTAUTH_SECRET (validated at startup in lib/env.ts).
 *   - Both 'wrong password' and 'no such user' return null so the response is
 *     indistinguishable — prevents email enumeration via timing (OWASP A05).
 *   - Rate-limit breaches are logged as warnings; the response is still null (auth failure)
 *     rather than a new error shape so callers cannot fingerprint which path was hit.
 */

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
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // ── Rate limiting (OWASP A07) ────────────────────────────────────────
        // Extract IP from headers (NextAuth passes a plain object, not NextRequest).
        const forwarded = (req as { headers?: Record<string, string> }).headers?.['x-forwarded-for']
        const ip = forwarded
          ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])?.trim() ?? 'unknown'
          : (req as { headers?: Record<string, string> }).headers?.['x-real-ip']?.trim() ?? 'unknown'

        const normalizedEmail = credentials.email.toLowerCase().trim()

        const ipResult = loginIpLimiter.check(`ip:${ip}`)
        if (!ipResult.ok) {
          console.warn(`[auth] Login rate-limit (IP) hit — ip=${ip}`)
          // Return null (auth failure) — do not expose that rate limiting was triggered.
          return null
        }

        const emailResult = loginEmailLimiter.check(`email:${normalizedEmail}`)
        if (!emailResult.ok) {
          console.warn(`[auth] Login rate-limit (email) hit — email=${normalizedEmail}`)
          return null
        }

        // ── Constant-time lookup so timing doesn't reveal whether the email exists ─
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

        // Always run bcrypt even when the user doesn't exist to preserve timing parity.
        const dummyHash = '$2b$12$invalidhashpaddingtomimicbcryptruntime0000000000000000000'
        const isValid = await bcrypt.compare(
          credentials.password,
          user?.password ?? dummyHash
        )

        if (!user || !isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          firmName: user.firmName,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/sign-in' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.firmName = user.firmName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.firmName = token.firmName
      }
      return session
    },
  },
}
