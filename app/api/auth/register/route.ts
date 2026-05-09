import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerLimiter } from '@/lib/rate-limit'

function clientKey(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim() || 'unknown'
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const limit = registerLimiter.check(clientKey(req))
    if (!limit.ok) {
      const retrySec = Math.max(1, Math.ceil(limit.retryAfterMs / 1000))
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again in a minute.' },
        { status: 429, headers: { 'Retry-After': String(retrySec) } }
      )
    }

    const { name, email, firmName, password } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), firmName, password: hashed },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
