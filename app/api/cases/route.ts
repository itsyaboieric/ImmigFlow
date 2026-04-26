import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cases = await prisma.case.findMany({
    where: { userId: session.user.id },
    include: { documents: { select: { id: true, status: true, documentType: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    title,
    applicationType,
    clientName,
    employerName,
    province,
    nocCode,
    nationality,
    permitDuration,
    offeredSalary,
    notes,
  } = body

  if (!title || !applicationType) {
    return NextResponse.json({ error: 'Title and application type are required.' }, { status: 400 })
  }

  const newCase = await prisma.case.create({
    data: {
      title,
      applicationType,
      clientName,
      employerName,
      province,
      nocCode,
      nationality,
      permitDuration: permitDuration ? parseInt(permitDuration) : null,
      offeredSalary: offeredSalary ? parseFloat(offeredSalary) : null,
      notes,
      userId: session.user.id,
      status: 'DRAFT',
    },
  })

  return NextResponse.json(newCase, { status: 201 })
}
