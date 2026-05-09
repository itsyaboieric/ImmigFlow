'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { APPLICATION_TYPE_LABELS, CASE_STATUS_LABELS, CASE_STATUS_COLORS, formatDate } from '@/lib/utils'

interface CaseDoc { id: string; status: string; documentType: string }
interface Case {
  id: string; title: string; applicationType: string; status: string
  clientName?: string; employerName?: string; province?: string
  createdAt: string; updatedAt: string; documents: CaseDoc[]
}

// Status dot color for the case list row indicator
const STATUS_DOT: Record<string, string> = {
  DRAFT:             'bg-gray-300',
  DOCUMENTS_PENDING: 'bg-amber-400',
  REVIEW:            'bg-brand-500',
  SIGNED_OFF:        'bg-emerald-500',
}

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(data => { setCases(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = {
    total:     cases.length,
    active:    cases.filter(c => !['SIGNED_OFF', 'DRAFT'].includes(c.status)).length,
    signedOff: cases.filter(c => c.status === 'SIGNED_OFF').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-3.5 h-3.5 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
          Loading cases…
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Cases</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {cases.length === 0 ? 'No cases yet' : `${cases.length} total · ${stats.active} active`}
          </p>
        </div>
        <Link
          href="/cases/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New Case
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Total Cases', value: stats.total,     color: 'text-gray-900' },
          { label: 'Active',      value: stats.active,    color: 'text-brand-600' },
          { label: 'Signed Off',  value: stats.signedOff, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-card">
            <div className={`text-2xl font-bold ${color} tracking-tight`}>{value}</div>
            <div className="text-[13px] text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Cases list */}
      {cases.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center shadow-card">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400">
              <rect x="2" y="3" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 7h6M5 10h6M5 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 2v4h4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 2l4 4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1.5">No cases yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Create your first case to start processing immigration files with AI.
          </p>
          <Link
            href="/cases/new"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Create first case
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Case</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Updated</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {cases.map(c => {
              const extracted = c.documents.filter(d => d.status === 'EXTRACTED').length
              const total = c.documents.length
              return (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[c.status] ?? 'bg-gray-300'}`} />

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-[14px] text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                        {c.title}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        CASE_STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'
                      }`}>
                        {CASE_STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-400 flex-wrap">
                      <span>{APPLICATION_TYPE_LABELS[c.applicationType] ?? c.applicationType}</span>
                      {c.clientName && <><span className="text-gray-200">·</span><span>{c.clientName}</span></>}
                      {c.employerName && <><span className="text-gray-200">·</span><span>{c.employerName}</span></>}
                      {c.province && <><span className="text-gray-200">·</span><span>{c.province}</span></>}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] text-gray-500 mb-0.5">
                      {total > 0
                        ? <span className={extracted === total && total > 0 ? 'text-emerald-600 font-medium' : ''}>{extracted}/{total} extracted</span>
                        : <span className="text-gray-400">No documents</span>
                      }
                    </div>
                    <div className="text-[11px] text-gray-400">{formatDate(c.updatedAt)}</div>
                  </div>

                  {/* Chevron */}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0">
                    <path d="M5.5 3.5L9 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
