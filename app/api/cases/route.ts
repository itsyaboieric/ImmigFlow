/**
 * GET  /api/cases — list cases for the authenticated user.
 * POST /api/cases — create a new case.
 *
 * Security controls:
 *   - Per-user rate limiting on writes (OWASP A04).
 *   - Zod schema validation with .strict() to reject unexpected fields (OWASP A03 / ASVS 5.1.4).
 *   - All numeric fields coerced and range-checked server-side.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeLimiter, rateLimitResponse } from '@/lib/rate-limit'
import { CreateCaseSchema, zodErrorMessage } from '@/lib/schemas'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cases = await prisma.case.findMany({
    where: { userId: session.user.id },
    include: { documents: { select: { id: true, status: true, documentType: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Rate limit by user ID ────────────────────────────────────────────────
  const limit = writeLimiter.check(`case-create:${session.user.id}`)
  if (!limit.ok) return rateLimitResponse(limit.retryAfterMs)

  // ── Validate body ────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = CreateCaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 })
  }

  const {
    title, applicationType, clientName, employerName, province,
    nocCode, nationality, permitDuration, offeredSalary, notes,
  } = parsed.data

  const newCase = await prisma.case.create({
    data: {
      title,
      applicationType,
      clientName,
      employerName,
      province,
      nocCode,
      nationality,
      permitDuration: permitDuration ?? null,
      offeredSalary: offeredSalary ?? null,
      notes,
      userId: session.user.id,
      status: 'DRAFT',
    },
  })

  return NextResponse.json(newCase, { status: 201 })
}
