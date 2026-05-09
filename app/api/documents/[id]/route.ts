import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { deleteUploadedFile } from '@/lib/storage'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await prisma.document.findFirst({
    where: { id: params.id },
    include: { case: { select: { userId: true } } },
  })

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.case.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    deleteUploadedFile(doc.caseId, doc.fileName)
  } catch {
    // Invalid path or missing — continue with DB delete
  }

  await prisma.document.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
