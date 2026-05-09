import { APPLICATION_TYPE_LABELS, PROVINCES } from '@/lib/utils'
import type { CaseDetailView } from './types'
import type { ChecklistItem } from '@/lib/checklist'

interface Props {
  caseData: CaseDetailView
  checklist: ChecklistItem[]
  uploadedTypes: string[]
  progress: { completed: number; total: number; percentage: number }
  onGoToDocuments: () => void
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</dt>
      <dd className="text-[14px] text-gray-900">{value ?? <span className="text-gray-300">—</span>}</dd>
    </div>
  )
}

export default function CaseOverviewTab({ caseData, checklist, uploadedTypes, progress, onGoToDocuments }: Props) {
  return (
    <div className="space-y-5">
      {/* Case info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-5">Case Information</h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Application Type" value={APPLICATION_TYPE_LABELS[caseData.applicationType]} />
          <InfoField label="Client Name"      value={caseData.clientName} />
          <InfoField label="Nationality"      value={caseData.nationality} />
          <InfoField label="Employer"         value={caseData.employerName} />
          <InfoField label="Province"         value={PROVINCES.find(p => p.value === caseData.province)?.label ?? caseData.province} />
          <InfoField label="NOC Code"         value={caseData.nocCode} />
          <InfoField label="Permit Duration"  value={caseData.permitDuration ? `${caseData.permitDuration} months` : undefined} />
          <InfoField label="Offered Salary"   value={caseData.offeredSalary ? `$${caseData.offeredSalary.toLocaleString()} / yr` : undefined} />
        </dl>
        {caseData.notes && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</dt>
            <dd className="text-sm text-gray-600 leading-relaxed">{caseData.notes}</dd>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[13px] font-semibold text-gray-900">Document Checklist</h2>
          <span className="text-[12px] font-medium text-gray-500">{progress.completed} / {progress.total} required</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${progress.percentage === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="space-y-2">
          {checklist.map(item => {
            const uploaded = uploadedTypes.includes(item.documentType)
            const doc = caseData.documents.find(d => d.documentType === item.documentType)
            return (
              <div key={item.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
                uploaded ? 'bg-emerald-50/60 border-emerald-100' : item.required ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-gray-100'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  uploaded ? 'bg-emerald-500' : item.required ? 'bg-gray-200' : 'bg-gray-100'
                }`}>
                  {uploaded
                    ? <svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1 3.5l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <span className={`text-[8px] font-bold ${item.required ? 'text-gray-500' : 'text-gray-400'}`}>{item.required ? '!' : '?'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[13px] font-medium ${uploaded ? 'text-emerald-800' : 'text-gray-700'}`}>{item.label}</span>
                    {item.required && !uploaded && <span className="text-[10px] font-semibold text-red-400">Required</span>}
                    {!item.required && !uploaded && <span className="text-[10px] text-gray-400">Optional</span>}
                  </div>
                  {item.notes && !uploaded && <p className="text-[12px] text-gray-400 mt-0.5">{item.notes}</p>}
                  {doc && (
                    <p className="text-[12px] text-emerald-600 mt-0.5 font-medium">
                      {doc.originalName}
                      {doc.status === 'EXTRACTED' && ` · Extracted (${Math.round((doc.confidence ?? 0) * 100)}% conf.)`}
                      {doc.status === 'PROCESSING' && ' · Processing…'}
                      {doc.status === 'UPLOADED' && ' · Not yet extracted'}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {progress.completed < progress.total && (
          <button type="button" onClick={onGoToDocuments}
            className="mt-5 text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            Upload documents →
          </button>
        )}
      </div>
    </div>
  )
}
