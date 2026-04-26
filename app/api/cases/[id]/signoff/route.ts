import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caseData = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
  })

  if (!caseData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.case.update({
    where: { id: params.id },
    data: { status: 'SIGNED_OFF', signedOffAt: new Date() },
  })

  return NextResponse.json(updated)
}
