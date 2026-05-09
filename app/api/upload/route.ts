import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MAX_UPLOAD_BYTES, saveUploadedFile } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const caseId = formData.get('caseId') as string | null
  const documentType = formData.get('documentType') as string | null

  if (!file || !caseId || !documentType) {
    return NextResponse.json({ error: 'Missing file, caseId, or documentType.' }, { status: 400 })
  }

  // Verify case belongs to user
  const caseRecord = await prisma.case.findFirst({
    where: { id: caseId, userId: session.user.id },
  })
  if (!caseRecord) return NextResponse.json({ error: 'Case not found.' }, { status: 404 })

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only PDF, JPEG, PNG, and WebP files are supported.' },
      { status: 400 }
    )
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File must be ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB or smaller.` },
      { status: 413 }
    )
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  let fileName: string
  try {
    fileName = saveUploadedFile(caseId, buffer, ext)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to save file.'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const doc = await prisma.document.create({
    data: {
      caseId,
      documentType,
      fileName,
      originalName: file.name,
      fileSize: buffer.length,
      mimeType: file.type,
      status: 'UPLOADED',
    },
  })

  // Update case status
  if (caseRecord.status === 'DRAFT') {
    await prisma.case.update({
      where: { id: caseId },
      data: { status: 'DOCUMENTS_PENDING' },
    })
  }

  return NextResponse.json(doc, { status: 201 })
}
