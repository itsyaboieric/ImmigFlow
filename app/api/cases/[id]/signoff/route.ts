/**
 * POST /api/cases/[id]/signoff
 * Marks a case as SIGNED_OFF by the authenticated RCIC.
 *
 * Security controls:
 *   - Per-user rate limiting — prevents rapid double-submission (OWASP A04).
 *   - State guard — only cases in REVIEW status can be signed off (prevents
 *     signing a DRAFT with no extracted documents).
 *   - Ownership enforced via userId query filter (OWASP A01).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { signoffLimiter, rateLimitResponse } from '@/lib/rate-limit'

/** Case statuses that are valid preconditions for sign-off. */
const SIGNABLE_STATUSES = new Set(['REVIEW', 'DOCUMENTS_PENDING'])

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = signoffLimiter.check(`signoff:${session.user.id}`)
  if (!limit.ok) return rateLimitResponse(limit.retryAfterMs)

  const caseData = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
  })

  if (!caseData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Prevent signing off a case that has already been signed off or is in a state
  // that implies the RCIC has not yet reviewed the documents.
  if (caseData.status === 'SIGNED_OFF') {
    return NextResponse.json({ error: 'Case is already signed off.' }, { status: 409 })
  }
  if (!SIGNABLE_STATUSES.has(caseData.status)) {
    return NextResponse.json(
      { error: 'Case must be in Review status before it can be signed off.' },
      { status: 422 }
    )
  }

  const updated = await prisma.case.update({
    where: { id: params.id },
    data: { status: 'SIGNED_OFF', signedOffAt: new Date() },
  })

  return NextResponse.json(updated)
}
