/**
 * POST /api/documents/[id]/extract — run Claude AI extraction on a document.
 *
 * Security controls:
 *   - Per-user rate limiting (STRICT: 10/min) — each call hits the Anthropic API.
 *     This is the primary guard against runaway API cost (OWASP A04).
 *   - Ownership enforced via case.userId join — users cannot extract other users' docs.
 *   - documentType is re-validated inside lib/claude.ts against an allowlist.
 *   - maxDuration limits the Vercel function timeout (defence against hung requests).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { extractDocumentData } from '@/lib/claude'
import { readUploadedFile } from '@/lib/storage'
import { extractLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Strict per-user rate limit — each request costs money ────────────────
  const limit = extractLimiter.check(`extract:${session.user.id}`)
  if (!limit.ok) {
    console.warn(
      `[extract] Rate limit hit — userId=${session.user.id} ip=${getClientIp(req)}`
    )
    return rateLimitResponse(limit.retryAfterMs)
  }

  // ── Fetch document and verify ownership via the case join ─────────────────
  const doc = await prisma.document.findFirst({
    where: { id: params.id },
    include: { case: { select: { userId: true } } },
  })

  // Uniform 404 for 'not found' and 'forbidden' — prevents document-ID enumeration.
  if (!doc || doc.case.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Mark as processing before the async Claude call so the UI can show progress.
  await prisma.document.update({
    where: { id: params.id },
    data: { status: 'PROCESSING', errorMessage: null },
  })

  try {
    const buffer = readUploadedFile(doc.caseId, doc.fileName)
    const result = await extractDocumentData(buffer, doc.mimeType, doc.documentType)

    await prisma.document.update({
      where: { id: params.id },
      data: {
        status: 'EXTRACTED',
        extractedData: JSON.stringify(result.data),
        confidence: result.confidence,
        errorMessage: null,
      },
    })

    // Promote case to REVIEW when every sibling document is now EXTRACTED.
    const siblings = await prisma.document.findMany({ where: { caseId: doc.caseId } })
    const allDone = siblings.every(d => d.status === 'EXTRACTED')
    if (allDone) {
      await prisma.case.update({ where: { id: doc.caseId }, data: { status: 'REVIEW' } })
    }

    return NextResponse.json({ success: true, data: result.data, confidence: result.confidence })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed'
    console.error(`[extract] Error for doc=${params.id}:`, message)
    await prisma.document.update({
      where: { id: params.id },
      data: { status: 'ERROR', errorMessage: message },
    })
    return NextResponse.json({ error: 'Extraction failed. Please try again.' }, { status: 500 })
  }
}
