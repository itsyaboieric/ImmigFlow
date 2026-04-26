'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  APPLICATION_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  DOC_STATUS_COLORS,
  PROVINCES,
  formatDate,
  formatFileSize,
  confidenceColor,
  confidenceBg,
} from '@/lib/utils'
import { generateChecklist, getChecklistProgress } from '@/lib/checklist'
import type { ValidationError, FormFieldValue } from '@/lib/validation'

type Tab = 'overview' | 'documents' | 'review' | 'signoff'

const DOC_TYPE_OPTIONS = [
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'JOB_OFFER', label: 'Job Offer Letter' },
  { value: 'EMPLOYMENT_LETTER', label: 'Employment Reference Letter' },
  { value: 'PAY_STUB', label: 'Pay Stub' },
  { value: 'DIPLOMA', label: 'Diploma / Degree / Certificate' },
  { value: 'BUSINESS_REG', label: 'Business Registration' },
  { value: 'OTHER', label: 'Other Document' },
]

interface Document {
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

interface Case {
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
  documents: Document[]
}

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDocType, setUploadDocType] = useState('PASSPORT')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Extract state
  const [extracting, setExtracting] = useState<Record<string, boolean>>({})

  // Validate state
  const [validating, setValidating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [formMapping, setFormMapping] = useState<Record<string, FormFieldValue>>({})
  const [validated, setValidated] = useState(false)

  // Sign off state
  const [confirmed, setConfirmed] = useState(false)
  const [signingOff, setSigningOff] = useState(false)

  // Delete case
  const [deleting, setDeleting] = useState(false)

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/cases/${caseId}`)
    if (res.ok) {
      const data: Case = await res.json()
      setCaseData(data)
    } else if (res.status === 404) {
      router.push('/dashboard')
    }
    setLoading(false)
  }, [caseId, router])

  useEffect(() => { refresh() }, [refresh])

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
      const d = await res.json()
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
      const d = await res.json()
      alert(`Extraction failed: ${d.error}`)
    }
  }

  async function handleDeleteDocument(docId: string) {
    if (!confirm('Remove this document?')) return
    await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
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
    if (!confirm(`Permanently delete "${caseData?.title}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/cases/${caseId}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  function handleDownloadPackage() {
    if (!caseData) return
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

  if (loading || !caseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading case...</div>
      </div>
    )
  }

  const checklist = generateChecklist(caseData.applicationType, caseData.province, caseData.nationality)
  const uploadedTypes = caseData.documents.map(d => d.documentType)
  const progress = getChecklistProgress(checklist, uploadedTypes)
  const extractedDocs = caseData.documents.filter(d => d.status === 'EXTRACTED')
  const criticalErrors = validationErrors.filter(e => e.severity === 'error')
  const canSignOff = confirmed && (criticalErrors.length === 0 || !validated)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: `Documents (${caseData.documents.length})` },
    { id: 'review', label: 'Review & Validate' },
    { id: 'signoff', label: 'Sign Off' },
  ]

  return (
    <div>
      {/* Breadcrumb & header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">Cases</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{caseData.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CASE_STATUS_COLORS[caseData.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {CASE_STATUS_LABELS[caseData.status] ?? caseData.status}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {APPLICATION_TYPE_LABELS[caseData.applicationType]} · Created {formatDate(caseData.createdAt)}
          </div>
        </div>
        <button
          onClick={handleDeleteCase}
          disabled={deleting}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Delete case
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* === OVERVIEW TAB === */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Case info grid */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Case Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Application Type', value: APPLICATION_TYPE_LABELS[caseData.applicationType] },
                { label: 'Client Name', value: caseData.clientName },
                { label: 'Nationality', value: caseData.nationality },
                { label: 'Employer', value: caseData.employerName },
                { label: 'Province', value: PROVINCES.find(p => p.value === caseData.province)?.label ?? caseData.province },
                { label: 'NOC Code', value: caseData.nocCode },
                { label: 'Permit Duration', value: caseData.permitDuration ? `${caseData.permitDuration} months` : undefined },
                { label: 'Offered Salary', value: caseData.offeredSalary ? `$${caseData.offeredSalary.toLocaleString()}/yr` : undefined },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</div>
                  <div className="text-sm text-gray-900 mt-0.5">{value ?? <span className="text-gray-300">—</span>}</div>
                </div>
              ))}
            </div>
            {caseData.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Notes</div>
                <div className="text-sm text-gray-700">{caseData.notes}</div>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Document Checklist</h2>
              <div className="text-sm text-gray-500">
                {progress.completed}/{progress.total} required
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full mb-5">
              <div
                className="h-2 bg-brand-500 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <div className="space-y-2">
              {checklist.map(item => {
                const uploaded = uploadedTypes.includes(item.documentType)
                const doc = caseData.documents.find(d => d.documentType === item.documentType)
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      uploaded ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      uploaded ? 'bg-green-500 text-white' : item.required ? 'bg-gray-300 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {uploaded ? '✓' : item.required ? '!' : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${uploaded ? 'text-green-800' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                        {item.required && !uploaded && (
                          <span className="text-xs text-red-500 font-medium">Required</span>
                        )}
                        {!item.required && (
                          <span className="text-xs text-gray-400">Optional</span>
                        )}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-gray-500 mt-0.5">{item.notes}</div>
                      )}
                      {doc && (
                        <div className="text-xs text-green-700 mt-0.5">
                          {doc.originalName} · {doc.status === 'EXTRACTED' ? `Extracted (${Math.round((doc.confidence ?? 0) * 100)}% confidence)` : doc.status}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setActiveTab('documents')}
              className="mt-4 text-sm text-brand-600 hover:underline font-medium"
            >
              Upload documents →
            </button>
          </div>
        </div>
      )}

      {/* === DOCUMENTS TAB === */}
      {activeTab === 'documents' && (
        <div className="space-y-5">
          {/* Upload form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Upload Document</h2>

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Document Type</label>
                <select
                  value={uploadDocType}
                  onChange={e => setUploadDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {DOC_TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">File (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>
              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className="px-5 py-2 bg-brand-600 text-white text-sm rounded-lg font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>

            {uploadError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {uploadError}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">
              Maximum file size: 4 MB. All documents are stored securely and only accessible to your account.
            </p>
          </div>

          {/* Document list */}
          {caseData.documents.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
              <div className="text-3xl mb-3">📄</div>
              <div className="text-gray-500 text-sm">No documents uploaded yet. Start by uploading a passport.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {caseData.documents.map(doc => {
                const isExtracting = extracting[doc.id]
                const parsedData = doc.extractedData ? JSON.parse(doc.extractedData) as Record<string, unknown> : null
                return (
                  <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 truncate">{doc.originalName}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{formatFileSize(doc.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${DOC_STATUS_COLORS[doc.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {doc.status}
                          </span>
                          {doc.confidence !== undefined && doc.confidence !== null && (
                            <span className={`text-xs font-medium ${confidenceColor(doc.confidence)}`}>
                              {Math.round(doc.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        {doc.errorMessage && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                            Error: {doc.errorMessage}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(doc.status === 'UPLOADED' || doc.status === 'ERROR') && (
                          <button
                            onClick={() => handleExtract(doc.id)}
                            disabled={isExtracting}
                            className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {isExtracting ? 'Extracting...' : 'Extract with AI'}
                          </button>
                        )}
                        {doc.status === 'PROCESSING' && (
                          <span className="text-xs text-blue-600 font-medium">Processing...</span>
                        )}
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Extracted data preview */}
                    {parsedData && doc.status === 'EXTRACTED' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Extracted Fields</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(parsedData)
                            .filter(([k]) => k !== 'confidence' && k !== 'raw_text')
                            .slice(0, 12)
                            .map(([key, value]) => (
                              <div key={key} className="bg-gray-50 rounded px-2 py-1.5">
                                <div className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</div>
                                <div className="text-xs font-medium text-gray-800 truncate">
                                  {value === null || value === undefined ? '—' : String(value)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* === REVIEW TAB === */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* Validate button */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-semibold text-gray-900">Cross-Document Validation</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Checks name consistency, passport expiry, wage compliance, and date continuity across all extracted documents.
                </p>
              </div>
              <button
                onClick={handleValidate}
                disabled={validating || extractedDocs.length === 0}
                className="px-5 py-2 bg-brand-600 text-white text-sm rounded-lg font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {validating ? 'Validating...' : 'Run Validation'}
              </button>
            </div>
            {extractedDocs.length === 0 && (
              <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Extract at least one document before running validation.
              </div>
            )}
          </div>

          {/* Validation results */}
          {validated && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Validation Results
                {validationErrors.length === 0 && (
                  <span className="ml-2 text-sm font-normal text-green-600">· All checks passed</span>
                )}
              </h2>

              {validationErrors.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm text-green-700 font-medium">No validation issues found</div>
                  <div className="text-xs text-gray-500 mt-1">All checks passed. Proceed to sign off.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {validationErrors.map(err => (
                    <div
                      key={err.id}
                      className={`p-4 rounded-lg border ${
                        err.severity === 'error'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-lg flex-shrink-0 ${err.severity === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
                          {err.severity === 'error' ? '✗' : '⚠'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold uppercase tracking-wide ${err.severity === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                              {err.severity}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{err.field}</span>
                          </div>
                          <p className={`text-sm ${err.severity === 'error' ? 'text-red-800' : 'text-yellow-800'}`}>
                            {err.message}
                          </p>
                          {err.resolution && (
                            <p className="text-xs text-gray-600 mt-1.5 italic">
                              Resolution: {err.resolution}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form field mapping */}
          {Object.keys(formMapping).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-1">Pre-Filled Form Fields</h2>
              <p className="text-sm text-gray-500 mb-4">
                AI-extracted values mapped to IRCC form fields. Red fields are below 90% confidence and require manual verification.
              </p>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide w-1/4">Form Field</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide w-1/3">Extracted Value</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide w-1/4">Source Document</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(formMapping).map(([field, { value, source, confidence }], i) => (
                      <tr key={field} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${confidence < 0.9 ? 'bg-red-50/60' : ''}`}>
                        <td className="px-4 py-2.5 font-medium text-gray-700">{field}</td>
                        <td className={`px-4 py-2.5 font-mono text-xs ${confidence < 0.9 ? 'text-red-700 font-semibold' : 'text-gray-900'}`}>
                          {value || <span className="text-gray-300">—</span>}
                          {confidence < 0.9 && <span className="ml-2 text-red-500 text-xs font-sans">⚠ Verify</span>}
                        </td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs truncate max-w-0">{source}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`text-xs font-medium ${confidenceColor(confidence)}`}>
                            {Math.round(confidence * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw extracted data per document */}
          {extractedDocs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Source Data — Full Extraction Audit</h2>
              <p className="text-xs text-gray-500 mb-4">
                Every AI-filled field below cites its exact source document. This is your audit log.
              </p>

              <div className="space-y-4">
                {extractedDocs.map(doc => {
                  const data = JSON.parse(doc.extractedData!) as Record<string, unknown>
                  return (
                    <div key={doc.id} className={`border rounded-lg p-4 ${confidenceBg(doc.confidence ?? 0)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-medium text-sm text-gray-900">{doc.originalName}</span>
                          <span className="ml-2 text-xs text-gray-500">{DOCUMENT_TYPE_LABELS[doc.documentType]}</span>
                        </div>
                        <span className={`text-xs font-semibold ${confidenceColor(doc.confidence ?? 0)}`}>
                          Overall confidence: {Math.round((doc.confidence ?? 0) * 100)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(data)
                          .filter(([k]) => k !== 'confidence' && k !== 'raw_text' && k !== 'parse_error')
                          .map(([key, value]) => (
                            <div key={key} className="bg-white/80 rounded px-2.5 py-2 border border-white">
                              <div className="text-xs text-gray-400 capitalize mb-0.5">{key.replace(/_/g, ' ')}</div>
                              <div className="text-xs font-medium text-gray-800 break-words">
                                {value === null || value === undefined || value === '' ? <span className="text-gray-300">—</span> : String(value)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === SIGN OFF TAB === */}
      {activeTab === 'signoff' && (
        <div className="max-w-2xl space-y-5">
          {caseData.signedOffAt ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="text-2xl mb-2">✅</div>
              <h2 className="font-bold text-green-900 text-lg mb-1">Application Signed Off</h2>
              <p className="text-green-800 text-sm">
                You signed off this application package on {formatDate(caseData.signedOffAt)}.
                The package is ready for submission to IRCC.
              </p>
              <button
                onClick={handleDownloadPackage}
                className="mt-4 bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
              >
                Download Application Package (JSON)
              </button>
            </div>
          ) : (
            <>
              {/* Pre-submission checklist */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Pre-Submission Checklist</h2>
                <div className="space-y-2">
                  {[
                    {
                      label: 'Required documents uploaded',
                      ok: progress.completed >= progress.total,
                      detail: `${progress.completed}/${progress.total} required documents`,
                    },
                    {
                      label: 'AI extraction complete',
                      ok: extractedDocs.length === caseData.documents.length && caseData.documents.length > 0,
                      detail: `${extractedDocs.length}/${caseData.documents.length} documents extracted`,
                    },
                    {
                      label: 'Validation run',
                      ok: validated,
                      detail: validated ? `${validationErrors.length} issue(s) found` : 'Not yet run',
                    },
                    {
                      label: 'No critical errors',
                      ok: validated && criticalErrors.length === 0,
                      detail: validated
                        ? criticalErrors.length === 0
                          ? 'All checks passed'
                          : `${criticalErrors.length} critical error(s) require attention`
                        : 'Run validation first',
                    },
                  ].map(({ label, ok, detail }) => (
                    <div key={label} className={`flex items-center gap-3 p-3 rounded-lg ${ok ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ok ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                        {ok ? '✓' : '○'}
                      </span>
                      <div>
                        <div className={`text-sm font-medium ${ok ? 'text-green-900' : 'text-gray-600'}`}>{label}</div>
                        <div className={`text-xs ${ok ? 'text-green-700' : 'text-gray-400'}`}>{detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical errors warning */}
              {validated && criticalErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <div className="font-semibold text-red-900 mb-2">
                    {criticalErrors.length} critical error{criticalErrors.length > 1 ? 's' : ''} must be reviewed
                  </div>
                  <ul className="space-y-1">
                    {criticalErrors.map(e => (
                      <li key={e.id} className="text-sm text-red-700">· {e.field}: {e.message}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-600 mt-3">
                    You may still sign off, but you confirm you have reviewed and accept responsibility for these items.
                  </p>
                </div>
              )}

              {/* RCIC declaration */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-3">RCIC Declaration</h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  As the authorized RCIC on this file, you confirm that you have reviewed all AI-extracted
                  data against the original documents, verified the completed form fields, and exercised
                  independent professional judgment regarding this application.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={e => setConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-800">
                    I confirm I have reviewed all extracted data, all source documents, and the pre-filled
                    form fields for this application. I take professional responsibility for the accuracy and
                    completeness of this package and authorize it for submission to IRCC.
                  </span>
                </label>
              </div>

              <button
                onClick={handleSignOff}
                disabled={!confirmed || signingOff}
                className="w-full bg-brand-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {signingOff ? 'Signing off...' : 'Sign Off Application Package'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                ImmigFlow does not submit to IRCC. After sign-off, you submit the package yourself through
                the appropriate IRCC or ESDC portal. The RCIC always clicks submit.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
