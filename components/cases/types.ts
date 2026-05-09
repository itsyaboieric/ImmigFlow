export interface CaseDocumentView {
  id: string
  documentType: string
  originalName: string
  fileName: string
  fileSize: number
  mimeType: string
  status: string
  extractedData?: string
  confidence?: number
  errorMessage?: string
  createdAt: string
}

export interface CaseDetailView {
  id: string
  title: string
  applicationType: string
  status: string
  clientName?: string
  employerName?: string
  province?: string
  nocCode?: string
  nationality?: string
  permitDuration?: number
  offeredSalary?: number
  notes?: string
  signedOffAt?: string
  createdAt: string
  updatedAt: string
  documents: CaseDocumentView[]
}
