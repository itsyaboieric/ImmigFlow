import { DOCUMENT_TYPE_LABELS, formatFileSize, confidenceColor, DOC_STATUS_COLORS } from '@/lib/utils'
import type { CaseDetailView } from './types'
import { DOC_TYPE_OPTIONS } from './constants'

function parseExtracted(record: string | undefined): Record<string, unknown> | null {
  if (!record) return null
  try {
    const o = JSON.parse(record) as unknown
    return o !== null && typeof o === 'object' && !Array.isArray(o) ? (o as Record<string, unknown>) : null
  } catch { return null }
}

interface Props {
  caseData: CaseDetailView
  uploadDocType: string
  uploadFile: File | null
  uploading: boolean
  uploadError: string
  extracting: Record<string, boolean>
  onUploadDocTypeChange: (value: string) => void
  onUploadFileChange: (file: File | null) => void
  onUpload: () => void
  onExtract: (docId: string) => void
  onDeleteDocument: (docId: string) => void
}

const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"

export default function CaseDocumentsTab({
  caseData, uploadDocType, uploadFile, uploading, uploadError, extracting,
  onUploadDocTypeChange, onUploadFileChange, onUpload, onExtract, onDeleteDocument,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Upload form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-5">Upload Document</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Document Type</label>
            <select value={uploadDocType} onChange={e => onUploadDocTypeChange(e.target.value)}
              className={inputClass + ' cursor-pointer'}>
              {DOC_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">File — PDF, JPG, PNG, WebP</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={e => onUploadFileChange(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:transition-colors cursor-pointer"
            />
          </div>
          <button type="button" onClick={onUpload} disabled={!uploadFile || uploading}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
        {uploadError && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
              <circle cx="7" cy="7" r="6.5" stroke="#ef4444"/><path d="M7 4v3.5M7 9.5v.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {uploadError}
          </div>
        )}
        <p className="text-[12px] text-gray-400 mt-3">Max 4 MB. Documents are encrypted and only accessible to your account.</p>
      </div>

      {/* Document list */}
      {caseData.documents.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" className="text-gray-400">
              <path d="M10 1H3a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-7-7z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 1v7h7" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <p className="text-[14px] font-medium text-gray-600 mb-1">No documents yet</p>
          <p className="text-[13px] text-gray-400">Start by uploading the applicant&apos;s passport.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {caseData.documents.map(doc => {
            const isExtracting = extracting[doc.id]
            const parsedData = parseExtracted(doc.extractedData)
            return (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-2xl shadow-card overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  {/* File icon */}
                  <div className="w-9 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="text-gray-400">
                      <path d="M1 2a1 1 0 011-1h7l4 4v9a1 1 0 01-1 1H2a1 1 0 01-1-1V2z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                      <path d="M8 1v4h4" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[14px] text-gray-900 truncate">{doc.originalName}</span>
                      <span className="text-[12px] text-gray-400 flex-shrink-0">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] text-gray-500">{DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DOC_STATUS_COLORS[doc.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {doc.status}
                      </span>
                      {doc.confidence != null && (
                        <span className={`text-[12px] font-medium ${confidenceColor(doc.confidence)}`}>
                          {Math.round(doc.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    {doc.errorMessage && (
                      <p className="mt-1.5 text-[12px] text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5">{doc.errorMessage}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(doc.status === 'UPLOADED' || doc.status === 'ERROR') && (
                      <button type="button" onClick={() => onExtract(doc.id)} disabled={isExtracting}
                        className="text-[12px] font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap">
                        {isExtracting ? 'Extracting…' : 'Extract with AI'}
                      </button>
                    )}
                    {doc.status === 'PROCESSING' && (
                      <div className="flex items-center gap-1.5 text-[12px] text-brand-600 font-medium">
                        <div className="w-3 h-3 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                        Processing
                      </div>
                    )}
                    <button type="button" onClick={() => onDeleteDocument(doc.id)}
                      className="text-[12px] text-gray-400 hover:text-red-500 transition-colors ml-1">
                      Remove
                    </button>
                  </div>
                </div>

                {/* Extracted fields preview */}
                {parsedData && doc.status === 'EXTRACTED' && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Extracted Fields</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {Object.entries(parsedData)
                        .filter(([k]) => k !== 'confidence' && k !== 'raw_text' && k !== 'parse_error')
                        .slice(0, 12)
                        .map(([key, value]) => (
                          <div key={key} className="bg-white rounded-lg border border-gray-100 px-2.5 py-2">
                            <div className="text-[10px] text-gray-400 capitalize mb-0.5">{key.replace(/_/g, ' ')}</div>
                            <div className="text-[12px] font-medium text-gray-800 truncate">
                              {value == null || value === '' ? <span className="text-gray-300">—</span> : String(value)}
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
  )
}
