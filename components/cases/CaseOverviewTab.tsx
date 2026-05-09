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

export default function CaseOverviewTab({
  caseData,
  checklist,
  uploadedTypes,
  progress,
  onGoToDocuments,
}: Props) {
  return (
    <div className="space-y-6">
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

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Document Checklist</h2>
          <div className="text-sm text-gray-500">
            {progress.completed}/{progress.total} required
          </div>
        </div>

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
          type="button"
          onClick={onGoToDocuments}
          className="mt-4 text-sm text-brand-600 hover:underline font-medium"
        >
          Upload documents →
        </button>
      </div>
    </div>
  )
}
