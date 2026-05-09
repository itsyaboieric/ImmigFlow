import {
  DOCUMENT_TYPE_LABELS,
  formatFileSize,
  confidenceColor,
  DOC_STATUS_COLORS,
} from '@/lib/utils'

function parseExtracted(record: string | undefined): Record<string, unknown> | null {
  if (!record) return null
  try {
    const o = JSON.parse(record) as unknown
    return o !== null && typeof o === 'object' && !Array.isArray(o) ? (o as Record<string, unknown>) : null
  } catch {
    return null
  }
}
import type { CaseDetailView } from './types'
import { DOC_TYPE_OPTIONS } from './constants'

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

export default function CaseDocumentsTab({
  caseData,
  uploadDocType,
  uploadFile,
  uploading,
  uploadError,
  extracting,
  onUploadDocTypeChange,
  onUploadFileChange,
  onUpload,
  onExtract,
  onDeleteDocument,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Upload Document</h2>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Document Type</label>
            <select
              value={uploadDocType}
              onChange={e => onUploadDocTypeChange(e.target.value)}
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
              onChange={e => onUploadFileChange(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>
          <button
            type="button"
            onClick={onUpload}
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

      {caseData.documents.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <div className="text-3xl mb-3">📄</div>
          <div className="text-gray-500 text-sm">No documents uploaded yet. Start by uploading a passport.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {caseData.documents.map(doc => {
            const isExtracting = extracting[doc.id]
            const parsedData = parseExtracted(doc.extractedData)
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
                        type="button"
                        onClick={() => onExtract(doc.id)}
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
                      type="button"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

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
  )
}
