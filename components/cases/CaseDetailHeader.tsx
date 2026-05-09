import Link from 'next/link'
import { CASE_STATUS_COLORS, CASE_STATUS_LABELS, APPLICATION_TYPE_LABELS, formatDate } from '@/lib/utils'
import type { CaseDetailView } from './types'

interface Props {
  caseData: CaseDetailView
  deleting: boolean
  onDeleteCase: () => void
}

export default function CaseDetailHeader({ caseData, deleting, onDeleteCase }: Props) {
  return (
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
        type="button"
        onClick={onDeleteCase}
        disabled={deleting}
        className="text-sm text-red-500 hover:text-red-700 transition-colors"
      >
        Delete case
      </button>
    </div>
  )
}
