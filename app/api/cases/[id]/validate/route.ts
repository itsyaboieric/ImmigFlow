import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { validateCrossDocuments, generateFormFieldMapping, ExtractedDoc } from '@/lib/validation'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caseData = await prisma.case.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { documents: true },
  })

  if (!caseData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const extractedDocs: ExtractedDoc[] = caseData.documents
    .filter(d => d.status === 'EXTRACTED' && d.extractedData)
    .map(d => ({
      type: d.documentType,
      data: JSON.parse(d.extractedData!) as Record<string, unknown>,
      docId: d.id,
      fileName: d.originalName,
    }))

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
