'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateChecklist, getChecklistProgress } from '@/lib/checklist'
import type { ValidationError, FormFieldValue } from '@/lib/validation'
import { useCaseDetail } from '@/hooks/useCaseDetail'
import type { CaseDetailView } from './types'
import type { CaseTabId } from './constants'
import CaseDetailHeader from './CaseDetailHeader'
import CaseDetailTabNav from './CaseDetailTabNav'
import CaseOverviewTab from './CaseOverviewTab'
import CaseDocumentsTab from './CaseDocumentsTab'
import CaseReviewTab from './CaseReviewTab'
import CaseSignoffTab from './CaseSignoffTab'

interface Props {
  initialCase: CaseDetailView
}

export default function CaseDetailClient({ initialCase }: Props) {
  const router = useRouter()
  const caseId = initialCase.id
  const { caseData, refresh } = useCaseDetail(caseId, initialCase)

  const [activeTab, setActiveTab] = useState<CaseTabId>('overview')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDocType, setUploadDocType] = useState('PASSPORT')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [extracting, setExtracting] = useState<Record<string, boolean>>({})
  const [validating, setValidating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [formMapping, setFormMapping] = useState<Record<string, FormFieldValue>>({})
  const [validated, setValidated] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [signingOff, setSigningOff] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const checklist = generateChecklist(caseData.applicationType, caseData.province, caseData.nationality)
  const uploadedTypes = caseData.documents.map(d => d.documentType)
  const progress = getChecklistProgress(checklist, uploadedTypes)
  const extractedDocs = caseData.documents.filter(d => d.status === 'EXTRACTED')
  const criticalErrors = validationErrors.filter(e => e.severity === 'error')

  async function handleUpload() {
    if (!uploadFile) return
    setUploadError('')
    setUploading(true)

    const fd = new FormData()
    fd.append('file', uploadFile)
    fd.append('caseId', caseId)
    fd.append('documentType', uploadDocType)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    setUploading(false)

    if (res.ok) {
      setUploadFile(null)
      await refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setUploadError(d.error ?? 'Upload failed.')
    }
  }

  async function handleExtract(docId: string) {
    setExtracting(prev => ({ ...prev, [docId]: true }))
    const res = await fetch(`/api/documents/${docId}/extract`, { method: 'POST' })
    setExtracting(prev => ({ ...prev, [docId]: false }))
    if (res.ok) {
      await refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      alert(`Extraction failed: ${d.error ?? res.status}`)
    }
  }

  async function handleDeleteDocument(docDocId: string) {
    if (!confirm('Remove this document?')) return
    await fetch(`/api/documents/${docDocId}`, { method: 'DELETE' })
    await refresh()
  }

  async function handleValidate() {
    setValidating(true)
    setValidated(false)
    const res = await fetch(`/api/cases/${caseId}/validate`, { method: 'POST' })
    setValidating(false)
    if (res.ok) {
      const d = await res.json()
      setValidationErrors(d.errors ?? [])
      setFormMapping(d.formMapping ?? {})
      setValidated(true)
      await refresh()
    } else {
      alert('Validation failed. Make sure at least one document has been extracted.')
    }
  }

  async function handleSignOff() {
    setSigningOff(true)
    const res = await fetch(`/api/cases/${caseId}/signoff`, { method: 'POST' })
    setSigningOff(false)
    if (res.ok) {
      await refresh()
      alert('Case signed off successfully. You may now submit the application package to IRCC.')
    }
  }

  async function handleDeleteCase() {
    if (!confirm(`Permanently delete "${caseData.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await fetch(`/api/cases/${caseId}`, { method: 'DELETE' })
      router.push('/dashboard')
    } finally {
      setDeleting(false)
    }
  }

  function handleDownloadPackage() {
    const docs = caseData.documents.filter(d => d.status === 'EXTRACTED')
    const pkg = {
      case: {
        id: caseData.id,
        title: caseData.title,
        applicationType: caseData.applicationType,
        clientName: caseData.clientName,
        employerName: caseData.employerName,
        province: caseData.province,
        nocCode: caseData.nocCode,
        nationality: caseData.nationality,
        permitDuration: caseData.permitDuration,
        offeredSalary: caseData.offeredSalary,
        signedOffAt: caseData.signedOffAt,
      },
      formFields: formMapping,
      validationErrors,
      documents: docs.map(d => ({
        type: d.documentType,
        originalName: d.originalName,
        extractedData: d.extractedData ? JSON.parse(d.extractedData) : null,
        confidence: d.confidence,
      })),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ImmigFlow_${caseData.title.replace(/[^a-z0-9]/gi, '_')}_package.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs: { id: CaseTabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: `Documents (${caseData.documents.length})` },
    { id: 'review', label: 'Review & Validate' },
    { id: 'signoff', label: 'Sign Off' },
  ]

  return (
    <div>
      <CaseDetailHeader caseData={caseData} deleting={deleting} onDeleteCase={handleDeleteCase} />

      <CaseDetailTabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && (
        <CaseOverviewTab
          caseData={caseData}
          checklist={checklist}
          uploadedTypes={uploadedTypes}
          progress={progress}
          onGoToDocuments={() => setActiveTab('documents')}
        />
      )}

      {activeTab === 'documents' && (
        <CaseDocumentsTab
          caseData={caseData}
          uploadDocType={uploadDocType}
          uploadFile={uploadFile}
          uploading={uploading}
          uploadError={uploadError}
          extracting={extracting}
          onUploadDocTypeChange={setUploadDocType}
          onUploadFileChange={setUploadFile}
          onUpload={handleUpload}
          onExtract={handleExtract}
          onDeleteDocument={handleDeleteDocument}
        />
      )}

      {activeTab === 'review' && (
        <CaseReviewTab
          extractedDocs={extractedDocs}
          validating={validating}
          validated={validated}
          validationErrors={validationErrors}
          formMapping={formMapping}
          onValidate={handleValidate}
        />
      )}

      {activeTab === 'signoff' && (
        <CaseSignoffTab
          caseData={caseData}
          extractedDocs={extractedDocs}
          progress={{ completed: progress.completed, total: progress.total }}
          validated={validated}
          validationErrors={validationErrors}
          criticalErrors={criticalErrors}
          confirmed={confirmed}
          signingOff={signingOff}
          onConfirmedChange={setConfirmed}
          onSignOff={handleSignOff}
          onDownloadPackage={handleDownloadPackage}
        />
      )}
    </div>
  )
}
