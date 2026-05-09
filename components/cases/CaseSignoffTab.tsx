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
  caseData,
  extractedDocs,
  progress,
  validated,
  validationErrors,
  criticalErrors,
  confirmed,
  signingOff,
  onConfirmedChange,
  onSignOff,
  onDownloadPackage,
}: Props) {
  return (
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
            type="button"
            onClick={onDownloadPackage}
            className="mt-4 bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            Download Application Package (JSON)
          </button>
        </div>
      ) : (
        <>
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
                onChange={e => onConfirmedChange(e.target.checked)}
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
            type="button"
            onClick={onSignOff}
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
  )
}
