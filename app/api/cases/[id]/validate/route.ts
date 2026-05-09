/**
 * POST /api/cases/[id]/validate
 * Runs cross-document validation and generates the form-field mapping.
 *
 * Security controls:
 *   - Per-user rate limiting (OWASP A04).
 *   - Safe JSON.parse with try/catch — prevents crashes on malformed extractedData (OWASP A03).
 *   - Prototype-pollution guard: parsed value is type-checked before use (OWASP A03).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { validateCrossDocuments, generateFormFieldMapping, type ExtractedDoc } from '@/lib/validation'
import { validateLimiter, rateLimitResponse } from '@/lib/rate-limit'

/** Safe JSON parse that never throws and rejects non-object results. */
function safeParseExtracted(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = validateLimiter.check(`validate:${session.user.id}`)
  if (!limit.ok) return rateLimitResponse(limit.retryAfterMs)

  const caseData = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { documents: true },
  })

  if (!caseData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only process documents that have been successfully extracted.
  // safeParseExtracted guards against stored malformed JSON crashing the request.
  const extractedDocs: ExtractedDoc[] = caseData.documents
    .filter(d => d.status === 'EXTRACTED' && d.extractedData)
    .flatMap(d => {
      const data = safeParseExtracted(d.extractedData!)
      if (!data) {
        console.warn(`[validate] Skipping document ${d.id} — extractedData is not a valid object`)
        return []
      }
      return [{ type: d.documentType, data, docId: d.id, fileName: d.originalName }]
    })

  const errors = validateCrossDocuments(extractedDocs, {
    province: caseData.province,
    permitDuration: caseData.permitDuration,
    offeredSalary: caseData.offeredSalary,
  })

  const formMapping = generateFormFieldMapping(extractedDocs)

  await prisma.case.update({
    where: { id: params.id },
    data: { status: 'REVIEW' },
  })

  return NextResponse.json({ errors, formMapping })
}
