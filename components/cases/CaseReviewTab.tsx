import { DOCUMENT_TYPE_LABELS, confidenceColor, confidenceBg } from '@/lib/utils'
import type { CaseDetailView } from './types'
import type { ValidationError, FormFieldValue } from '@/lib/validation'

function parseExtractedRecord(record: string | undefined): Record<string, unknown> | null {
  if (!record) return null
  try {
    const o = JSON.parse(record) as unknown
    return o !== null && typeof o === 'object' && !Array.isArray(o) ? (o as Record<string, unknown>) : null
  } catch { return null }
}

interface Props {
  extractedDocs: CaseDetailView['documents']
  validating: boolean
  validated: boolean
  validationErrors: ValidationError[]
  formMapping: Record<string, FormFieldValue>
  onValidate: () => void
}

export default function CaseReviewTab({ extractedDocs, validating, validated, validationErrors, formMapping, onValidate }: Props) {
  return (
    <div className="space-y-5">
      {/* Validation trigger */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[13px] font-semibold text-gray-900 mb-1">Cross-Document Validation</h2>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Checks name consistency across documents, passport expiry vs. permit duration, and offered wage vs. ESDC prevailing rate.
            </p>
          </div>
          <button type="button" onClick={onValidate} disabled={validating || extractedDocs.length === 0}
            className="px-5 py-2.5 bg-gray-900 text-white text-[13px] rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex-shrink-0">
            {validating
              ? <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Validating…</span>
              : 'Run Validation'
            }
          </button>
        </div>
        {extractedDocs.length === 0 && (
          <div className="mt-4 text-[13px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            Extract at least one document before running validation.
          </div>
        )}
      </div>

      {/* Validation results */}
      {validated && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-5 flex items-center gap-2">
            Validation Results
            {validationErrors.length === 0 && (
              <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All checks passed</span>
            )}
          </h2>

          {validationErrors.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-emerald-900 mb-1">No issues found</p>
              <p className="text-[13px] text-gray-400">All checks passed. Proceed to sign off.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {validationErrors.map(err => (
                <div key={err.id} className={`px-4 py-3.5 rounded-xl border ${
                  err.severity === 'error' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      err.severity === 'error' ? 'bg-red-500' : 'bg-amber-400'
                    }`}>
                      <span className="text-white text-[10px] font-bold">{err.severity === 'error' ? '✗' : '!'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          err.severity === 'error' ? 'text-red-600' : 'text-amber-600'
                        }`}>{err.severity}</span>
                        <span className="text-[13px] font-semibold text-gray-900">{err.field}</span>
                      </div>
                      <p className={`text-[13px] ${err.severity === 'error' ? 'text-red-800' : 'text-amber-800'}`}>{err.message}</p>
                      {err.resolution && (
                        <p className="text-[12px] text-gray-500 mt-1.5">Resolution: {err.resolution}</p>
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
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-1">Pre-Filled Form Fields</h2>
          <p className="text-[13px] text-gray-500 mb-5">
            Values extracted from source documents and mapped to IRCC form fields.
            Fields below 90% confidence are highlighted — verify these manually.
          </p>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Form Field</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Extracted Value</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Source</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Conf.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(formMapping).map(([field, { value, source, confidence }]) => (
                  <tr key={field} className={confidence < 0.9 ? 'bg-amber-50/50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-700">{field}</td>
                    <td className={`px-4 py-3 font-mono text-[12px] ${confidence < 0.9 ? 'text-amber-700 font-semibold' : 'text-gray-900'}`}>
                      {value || <span className="text-gray-300 font-sans">—</span>}
                      {confidence < 0.9 && <span className="ml-2 text-amber-500 font-sans text-[10px] font-semibold">Verify</span>}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-400 truncate hidden md:table-cell max-w-[160px]">{source}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[12px] font-semibold ${confidenceColor(confidence)}`}>
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

      {/* Raw extraction audit */}
      {extractedDocs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-1">Extraction Audit Log</h2>
          <p className="text-[12px] text-gray-400 mb-5">
            Full record of every AI-extracted field and the document it came from.
          </p>
          <div className="space-y-4">
            {extractedDocs.map(doc => {
              const data = parseExtractedRecord(doc.extractedData)
              if (!data) return (
                <div key={doc.id} className="border border-amber-100 rounded-xl p-4 bg-amber-50 text-[13px] text-amber-800">
                  Could not read extraction data for <span className="font-medium">{doc.originalName}</span>.
                </div>
              )
              return (
                <div key={doc.id} className={`border rounded-xl p-4 ${confidenceBg(doc.confidence ?? 0)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold text-[13px] text-gray-900">{doc.originalName}</span>
                      <span className="ml-2 text-[11px] text-gray-400">{DOCUMENT_TYPE_LABELS[doc.documentType]}</span>
                    </div>
                    <span className={`text-[12px] font-semibold ${confidenceColor(doc.confidence ?? 0)}`}>
                      {Math.round((doc.confidence ?? 0) * 100)}% confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(data)
                      .filter(([k]) => k !== 'confidence' && k !== 'raw_text' && k !== 'parse_error')
                      .map(([key, value]) => (
                        <div key={key} className="bg-white/80 rounded-lg border border-white px-2.5 py-2">
                          <div className="text-[10px] text-gray-400 capitalize mb-0.5">{key.replace(/_/g, ' ')}</div>
                          <div className="text-[12px] font-medium text-gray-800 break-words">
                            {value == null || value === '' ? <span className="text-gray-300">—</span> : String(value)}
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
