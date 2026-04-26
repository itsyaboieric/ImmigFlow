import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caseData = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { documents: { orderBy: { createdAt: 'asc' } } },
  })

  if (!caseData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(caseData)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.case.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.status && { status: body.status }),
      ...(body.clientName !== undefined && { clientName: body.clientName }),
      ...(body.employerName !== undefined && { employerName: body.employerName }),
      ...(body.province !== undefined && { province: body.province }),
      ...(body.nocCode !== undefined && { nocCode: body.nocCode }),
      ...(body.nationality !== undefined && { nationality: body.nationality }),
      ...(body.permitDuration !== undefined && { permitDuration: body.permitDuration ? parseInt(body.permitDuration) : null }),
      ...(body.offeredSalary !== undefined && { offeredSalary: body.offeredSalary ? parseFloat(body.offeredSalary) : null }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.case.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
