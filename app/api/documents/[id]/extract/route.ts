import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { extractDocumentData } from '@/lib/claude'
import { readUploadedFile } from '@/lib/storage'

export const maxDuration = 60

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await prisma.document.findFirst({
    where: { id: params.id },
    include: { case: { select: { userId: true } } },
  })

  if (!doc) return NextResponse.json({ error: 'Document not found.' }, { status: 404 })
  if (doc.case.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Mark as processing
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

    // Update case status if all docs extracted
    const siblings = await prisma.document.findMany({ where: { caseId: doc.caseId } })
    const allDone = siblings.every(d => d.id === params.id || d.status === 'EXTRACTED')
    if (allDone) {
      await prisma.case.update({
        where: { id: doc.caseId },
        data: { status: 'REVIEW' },
      })
    }

    return NextResponse.json({ success: true, data: result.data, confidence: result.confidence })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed'
    await prisma.document.update({
      where: { id: params.id },
      data: { status: 'ERROR', errorMessage: message },
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
