import { DOCUMENT_TYPE_LABELS, confidenceColor, confidenceBg } from '@/lib/utils'

function parseExtractedRecord(record: string | undefined): Record<string, unknown> | null {
  if (!record) return null
  try {
    const o = JSON.parse(record) as unknown
    return o !== null && typeof o === 'object' && !Array.isArray(o) ? (o as Record<string, unknown>) : null
  } catch {
    return null
  }
}
import type { CaseDetailView } from './types'
import type { ValidationError, FormFieldValue } from '@/lib/validation'

interface Props {
  extractedDocs: CaseDetailView['documents']
  validating: boolean
  validated: boolean
  validationErrors: ValidationError[]
  formMapping: Record<string, FormFieldValue>
  onValidate: () => void
}

export default function CaseReviewTab({
  extractedDocs,
  validating,
  validated,
  validationErrors,
  formMapping,
  onValidate,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-semibold text-gray-900">Cross-Document Validation</h2>
            <p className="text-sm text-gray-500 mt-1">
              Checks name consistency, passport expiry, wage compliance, and date continuity across all extracted documents.
            </p>
          </div>
          <button
            type="button"
            onClick={onValidate}
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

      {extractedDocs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Source Data — Full Extraction Audit</h2>
          <p className="text-xs text-gray-500 mb-4">
            Every AI-filled field below cites its exact source document. This is your audit log.
          </p>

          <div className="space-y-4">
            {extractedDocs.map(doc => {
              const data = parseExtractedRecord(doc.extractedData)
              if (!data)
                return (
                  <div key={doc.id} className="border border-amber-200 rounded-lg p-4 bg-amber-50 text-sm text-amber-900">
                    Could not read stored extraction JSON for{' '}
                    <span className="font-medium">{doc.originalName}</span>.
                  </div>
                )
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
  )
}
