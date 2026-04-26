import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { unlinkSync } from 'fs'
import { join } from 'path'

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
    const filePath = join(process.cwd(), 'uploads', doc.caseId, doc.fileName)
    unlinkSync(filePath)
  } catch {
    // File may not exist, continue
  }

  await prisma.document.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
