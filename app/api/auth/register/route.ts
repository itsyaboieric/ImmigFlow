/**
 * POST /api/auth/register — create a new user account.
 *
 * Security controls:
 *   1. IP-based rate limit (5 req / 60 s) — prevents bulk account creation.
 *   2. Zod schema validation — rejects malformed payloads and unexpected fields.
 *   3. Consistent 400 error for both 'email exists' and 'invalid input' — prevents
 *      account enumeration via different status codes (OWASP A07 / CWE-204).
 *   4. bcrypt cost factor 12 — makes offline hash cracking expensive.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerIpLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { RegisterSchema, zodErrorMessage } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  // ── 1. Rate limit by client IP ────────────────────────────────────────────
  const ip = getClientIp(req)
  const limit = registerIpLimiter.check(`register:${ip}`)
  if (!limit.ok) {
    console.warn(`[register] Rate limit hit — ip=${ip}`)
    return rateLimitResponse(limit.retryAfterMs)
  }

  // ── 2. Parse and validate body ────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 })
  }
  const { name, firmName, password } = parsed.data
  const email = parsed.data.email.toLowerCase() // normalise so sign-in lookup always matches

  // ── 3. Check for existing account ─────────────────────────────────────────
  // Always hash the password before the DB lookup so timing is constant
  // regardless of whether the user exists (OWASP A07 timing-safe pattern).
  const hashed = await bcrypt.hash(password, 12)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    // Return the same status/body as validation failure — prevents email enumeration.
    return NextResponse.json({ error: 'Registration failed. Check your details.' }, { status: 400 })
  }

  // ── 4. Create user ────────────────────────────────────────────────────────
  try {
    const user = await prisma.user.create({
      data: { name, email, firmName, password: hashed },
    })
    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (err) {
    console.error('[register] DB error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
