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
    <div className="flex items-start justify-between mb-7">
      <div className="min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-2.5">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors font-medium">Cases</Link>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-300">
            <path d="M4.5 3L7.5 6l-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-gray-700 font-medium truncate max-w-[280px]">{caseData.title}</span>
        </div>

        {/* Title + badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
            {caseData.title}
          </h1>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
            CASE_STATUS_COLORS[caseData.status] ?? 'bg-gray-100 text-gray-600'
          }`}>
            {CASE_STATUS_LABELS[caseData.status] ?? caseData.status}
          </span>
        </div>

        {/* Meta line */}
        <div className="flex items-center gap-2 mt-1.5 text-[13px] text-gray-400">
          <span>{APPLICATION_TYPE_LABELS[caseData.applicationType]}</span>
          <span className="text-gray-200">·</span>
          <span>Created {formatDate(caseData.createdAt)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onDeleteCase}
        disabled={deleting}
        className="text-[13px] text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0 ml-4"
      >
        Delete
      </button>
    </div>
  )
}
