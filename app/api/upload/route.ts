/**
 * POST /api/upload — upload a document file to a case.
 *
 * Security controls:
 *   1. Per-user rate limiting — prevents disk exhaustion (OWASP A04).
 *   2. documentType allowlist via Zod schema (OWASP A03).
 *   3. File size enforced server-side before processing (OWASP A04).
 *   4. MIME type validated by magic bytes (file content), NOT the client-declared type.
 *      The client's File.type field is user-controlled and trivially spoofed (CWE-434).
 *   5. File extension derived from magic-byte-confirmed MIME type, not the original filename.
 *   6. File name generated server-side — the original name is stored only as metadata.
 *   7. Ownership of the target case is verified before writing to disk (OWASP A01).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MAX_UPLOAD_BYTES, saveUploadedFile } from '@/lib/storage'
import { validateFileContent, detectMimeType } from '@/lib/magic-bytes'
import { uploadLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { DocumentTypeSchema } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

/** Map from confirmed MIME type to a clean file extension (server-controlled). */
const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── 1. Rate limit — by user ID to prevent disk exhaustion ────────────────
  const limit = uploadLimiter.check(`upload:${session.user.id}`)
  if (!limit.ok) {
    console.warn(`[upload] Rate limit hit — userId=${session.user.id} ip=${getClientIp(req)}`)
    return rateLimitResponse(limit.retryAfterMs)
  }

  // ── 2. Parse form fields ──────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const caseId = (formData.get('caseId') as string | null)?.trim()
  const documentTypeRaw = formData.get('documentType') as string | null

  if (!file || !caseId || !documentTypeRaw) {
    return NextResponse.json({ error: 'Missing file, caseId, or documentType.' }, { status: 400 })
  }

  // ── 3. Validate documentType against allowlist ────────────────────────────
  const docTypeResult = DocumentTypeSchema.safeParse(documentTypeRaw)
  if (!docTypeResult.success) {
    return NextResponse.json({ error: 'Invalid document type.' }, { status: 400 })
  }
  const documentType = docTypeResult.data

  // ── 4. Read file bytes and enforce size cap ───────────────────────────────
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (buffer.length === 0) {
    return NextResponse.json({ error: 'File is empty.' }, { status: 400 })
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File must be ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB or smaller.` },
      { status: 413 }
    )
  }

  // ── 5. Magic-byte validation — confirm actual file type from content ───────
  // This catches MIME-type spoofing: e.g. an .exe with type='application/pdf'.
  const allowedMimes = Object.keys(MIME_TO_EXT)
  const declaredMime = file.type

  if (!allowedMimes.includes(declaredMime)) {
    return NextResponse.json(
      { error: 'Only PDF, JPEG, PNG, and WebP files are supported.' },
      { status: 400 }
    )
  }

  if (!validateFileContent(buffer, declaredMime)) {
    const detectedMime = detectMimeType(buffer)
    const msg =
      detectedMime && detectedMime !== declaredMime
        ? `File content does not match the declared type (detected: ${detectedMime}).`
        : 'File content could not be verified. Ensure the file is not corrupted or renamed.'
    return NextResponse.json({ error: msg }, { status: 415 })
  }

  // ── 6. Derive extension from the verified MIME type (not from filename) ───
  const ext = MIME_TO_EXT[declaredMime]!

  // ── 7. Verify case ownership before writing to disk ───────────────────────
  const caseRecord = await prisma.case.findFirst({
    where: { id: caseId, userId: session.user.id },
  })
  if (!caseRecord) return NextResponse.json({ error: 'Case not found.' }, { status: 404 })

  // ── 8. Save to disk ───────────────────────────────────────────────────────
  let fileName: string
  try {
    fileName = saveUploadedFile(caseId, buffer, ext)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to save file.'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // ── 9. Persist document record ────────────────────────────────────────────
  const doc = await prisma.document.create({
    data: {
      caseId,
      documentType,
      fileName,
      originalName: file.name.slice(0, 500), // cap length stored in DB
      fileSize: buffer.length,
      mimeType: declaredMime,
      status: 'UPLOADED',
    },
  })

  if (caseRecord.status === 'DRAFT') {
    await prisma.case.update({ where: { id: caseId }, data: { status: 'DOCUMENTS_PENDING' } })
  }

  return NextResponse.json(doc, { status: 201 })
}
