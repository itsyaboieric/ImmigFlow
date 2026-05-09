/**
 * GET    /api/cases/[id]
 * PATCH  /api/cases/[id]
 * DELETE /api/cases/[id]
 *
 * Security controls:
 *   - Per-user rate limiting on writes (OWASP A04).
 *   - Zod schema validation on PATCH body — prevents mass-assignment and type confusion.
 *   - Ownership enforced via userId filter on every query (OWASP A01).
 *   - Uniform 404 for both 'not found' and 'not owned' — prevents case-ID enumeration (CWE-204).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { removeCaseUploadDirectory } from '@/lib/storage'
import { writeLimiter, rateLimitResponse } from '@/lib/rate-limit'
import { UpdateCaseSchema, zodErrorMessage } from '@/lib/schemas'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // userId scoped in the query — the DB never returns rows owned by other users.
  const caseData = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { documents: { orderBy: { createdAt: 'asc' } } },
  })

  if (!caseData) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(caseData)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = writeLimiter.check(`case-patch:${session.user.id}`)
  if (!limit.ok) return rateLimitResponse(limit.retryAfterMs)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = UpdateCaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 })
  }

  // Confirm ownership before writing — uniform 404 prevents row-existence leakage.
  const existing = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { title, status, clientName, employerName, province, nocCode,
          nationality, permitDuration, offeredSalary, notes } = parsed.data

  const updated = await prisma.case.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(status !== undefined && { status }),
      ...(clientName !== undefined && { clientName }),
      ...(employerName !== undefined && { employerName }),
      ...(province !== undefined && { province }),
      ...(nocCode !== undefined && { nocCode }),
      ...(nationality !== undefined && { nationality }),
      ...(permitDuration !== undefined && { permitDuration: permitDuration ?? null }),
      ...(offeredSalary !== undefined && { offeredSalary: offeredSalary ?? null }),
      ...(notes !== undefined && { notes }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = writeLimiter.check(`case-delete:${session.user.id}`)
  if (!limit.ok) return rateLimitResponse(limit.retryAfterMs)

  const existing = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.case.delete({ where: { id: params.id } })
  removeCaseUploadDirectory(params.id)
  return NextResponse.json({ success: true })
}
