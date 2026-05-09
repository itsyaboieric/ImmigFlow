/**
 * DELETE /api/documents/[id]
 *
 * Security controls:
 *   - Per-user rate limiting (OWASP A04).
 *   - Ownership checked via case.userId join — uniform 404 for not-found and forbidden
 *     to prevent document-ID enumeration (CWE-204).
 *   - File deletion uses lib/storage.ts which validates the path before unlinking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { deleteUploadedFile } from '@/lib/storage'
import { writeLimiter, rateLimitResponse } from '@/lib/rate-limit'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = writeLimiter.check(`doc-delete:${session.user.id}`)
  if (!limit.ok) return rateLimitResponse(limit.retryAfterMs)

  const doc = await prisma.document.findFirst({
    where: { id: params.id },
    include: { case: { select: { userId: true } } },
  })

  // Uniform 404 for both 'not found' and 'not owned' (OWASP A01 / CWE-204).
  if (!doc || doc.case.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  deleteUploadedFile(doc.caseId, doc.fileName)
  await prisma.document.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
