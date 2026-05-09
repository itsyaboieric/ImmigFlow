import { prisma } from '@/lib/db'
import type { CaseDetailView } from '@/components/cases/types'

export async function loadCaseDetailView(
  caseId: string,
  userId: string
): Promise<CaseDetailView | null> {
  const row = await prisma.case.findFirst({
    where: { id: caseId, userId },
    include: { documents: { orderBy: { createdAt: 'asc' } } },
  })
  if (!row) return null

  return {
    id: row.id,
    title: row.title,
    applicationType: row.applicationType,
    status: row.status,
    clientName: row.clientName ?? undefined,
    employerName: row.employerName ?? undefined,
    province: row.province ?? undefined,
    nocCode: row.nocCode ?? undefined,
    nationality: row.nationality ?? undefined,
    permitDuration: row.permitDuration ?? undefined,
    offeredSalary: row.offeredSalary ?? undefined,
    notes: row.notes ?? undefined,
    signedOffAt: row.signedOffAt?.toISOString() ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    documents: row.documents.map(d => ({
      id: d.id,
      documentType: d.documentType,
      originalName: d.originalName,
      fileName: d.fileName,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      status: d.status,
      extractedData: d.extractedData ?? undefined,
      confidence: d.confidence ?? undefined,
      errorMessage: d.errorMessage ?? undefined,
      createdAt: d.createdAt.toISOString(),
    })),
  }
}
