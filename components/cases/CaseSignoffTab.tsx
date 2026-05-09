import { formatDate } from '@/lib/utils'
import type { CaseDetailView } from './types'
import type { ValidationError } from '@/lib/validation'

interface Props {
  caseData: CaseDetailView
  extractedDocs: CaseDetailView['documents']
  progress: { completed: number; total: number }
  validated: boolean
  validationErrors: ValidationError[]
  criticalErrors: ValidationError[]
  confirmed: boolean
  signingOff: boolean
  onConfirmedChange: (value: boolean) => void
  onSignOff: () => void
  onDownloadPackage: () => void
}

export default function CaseSignoffTab({
  caseData, extractedDocs, progress, validated, validationErrors,
  criticalErrors, confirmed, signingOff, onConfirmedChange, onSignOff, onDownloadPackage,
}: Props) {
  if (caseData.signedOffAt) {
    return (
      <div className="max-w-xl space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-7">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11l5 5 9-9" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-[17px] font-bold text-emerald-900 mb-1.5">Application Signed Off</h2>
          <p className="text-[14px] text-emerald-700 leading-relaxed mb-5">
            Signed off on {formatDate(caseData.signedOffAt)}. This package is ready for submission to IRCC or ESDC.
          </p>
          <button type="button" onClick={onDownloadPackage}
            className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v9M3.5 7l3.5 3.5 3.5-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 12h12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Download Application Package
          </button>
        </div>
      </div>
    )
  }

  const checks = [
    {
      label: 'Required documents uploaded',
      ok: progress.completed >= progress.total,
      detail: `${progress.completed} / ${progress.total} required`,
    },
    {
      label: 'AI extraction complete',
      ok: extractedDocs.length === caseData.documents.length && caseData.documents.length > 0,
      detail: `${extractedDocs.length} / ${caseData.documents.length} extracted`,
    },
    {
      label: 'Validation run',
      ok: validated,
      detail: validated ? `${validationErrors.length} issue(s) found` : 'Not yet run',
    },
    {
      label: 'No critical errors',
      ok: validated && criticalErrors.length === 0,
      detail: !validated
        ? 'Run validation first'
        : criticalErrors.length === 0
        ? 'All checks passed'
        : `${criticalErrors.length} error(s) require attention`,
    },
  ]

  return (
    <div className="max-w-xl space-y-5">
      {/* Pre-submission checklist */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-5">Pre-Submission Checklist</h2>
        <div className="space-y-2.5">
          {checks.map(({ label, ok, detail }) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${ok ? 'bg-emerald-50' : 'bg-gray-50'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                {ok
                  ? <svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1 3.5l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <div className="w-2 h-2 rounded-full bg-gray-400" />
                }
              </div>
              <div className="flex-1">
                <p className={`text-[13px] font-medium ${ok ? 'text-emerald-900' : 'text-gray-600'}`}>{label}</p>
                <p className={`text-[12px] ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical errors */}
      {validated && criticalErrors.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <h3 className="text-[13px] font-semibold text-red-900 mb-2">
            {criticalErrors.length} critical error{criticalErrors.length > 1 ? 's' : ''} flagged
          </h3>
          <ul className="space-y-1 mb-3">
            {criticalErrors.map(e => (
              <li key={e.id} className="text-[13px] text-red-700">· {e.field}: {e.message}</li>
            ))}
          </ul>
          <p className="text-[12px] text-red-500">
            You may still sign off — but by doing so you confirm you have reviewed and accept professional responsibility for these items.
          </p>
        </div>
      )}

      {/* RCIC declaration */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-2">RCIC Declaration</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
          As the authorized RCIC on this file, you confirm that you have independently reviewed all
          AI-extracted data against the original source documents, verified all pre-filled form fields,
          and exercised independent professional judgment.
        </p>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => onConfirmedChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
          <span className="text-[13px] text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
            I confirm I have reviewed all extracted data, source documents, and pre-filled form fields.
            I take professional responsibility for the accuracy and completeness of this application package
            and authorize it for submission to IRCC.
          </span>
        </label>
      </div>

      {/* Sign off button */}
      <button type="button" onClick={onSignOff} disabled={!confirmed || signingOff}
        className="w-full bg-gray-900 text-white py-3 rounded-2xl text-[14px] font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
        {signingOff
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing off…</>
          : 'Sign Off Application Package'
        }
      </button>

      <p className="text-center text-[12px] text-gray-400 leading-relaxed">
        ImmigFlow does not submit to IRCC. You submit the package yourself through the appropriate IRCC or ESDC portal.
        The RCIC always clicks submit.
      </p>
    </div>
  )
}
