import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

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

  // Save file to uploads directory
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop() ?? 'bin'
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const uploadDir = join(process.cwd(), 'uploads', caseId)

  mkdirSync(uploadDir, { recursive: true })
  writeFileSync(join(uploadDir, fileName), buffer)

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
