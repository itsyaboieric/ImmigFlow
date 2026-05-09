'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PROVINCES } from '@/lib/utils'

const APPLICATION_TYPES = [
  {
    value: 'LMIA_HIGH_WAGE',
    label: 'LMIA — High Wage',
    desc: 'Position at or above the provincial median. Typically NOC TEER 0–3.',
  },
  {
    value: 'LMIA_LOW_WAGE',
    label: 'LMIA — Low Wage',
    desc: 'Position below the provincial median. Typically NOC TEER 4–5.',
  },
  {
    value: 'WORK_PERMIT',
    label: 'Employer-Specific Work Permit',
    desc: 'Tied to a specific employer via LMIA or exemption code.',
  },
]

const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-gray-400"
const labelClass = "block text-[13px] font-medium text-gray-700 mb-1.5"

export default function NewCasePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    applicationType: '',
    title: '',
    clientName: '',
    nationality: '',
    employerName: '',
    province: '',
    nocCode: '',
    permitDuration: '',
    offeredSalary: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setError('')
    if (!form.title.trim()) { setError('Please provide a case title.'); return }
    setLoading(true)
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Failed to create case.'); return }
    router.push(`/cases/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/dashboard" className="hover:text-gray-700 transition-colors">Cases</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">New Case</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        {/* Progress header */}
        <div className="px-8 pt-7 pb-6 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight mb-4">
            {step === 1 ? 'Select application type' : 'Case details'}
          </h1>
          <div className="flex items-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                  step > s
                    ? 'bg-emerald-500 text-white'
                    : step === s
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s
                    ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : s
                  }
                </div>
                <span className={`text-sm ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {s === 1 ? 'Application Type' : 'Details'}
                </span>
                {s < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <>
              <div className="space-y-3 mb-8">
                {APPLICATION_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => set('applicationType', type.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      form.applicationType === type.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                        form.applicationType === type.value
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-300'
                      }`}>
                        {form.applicationType === type.value && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${form.applicationType === type.value ? 'text-brand-900' : 'text-gray-800'}`}>
                          {type.label}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">{type.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => form.applicationType && setStep(2)}
                disabled={!form.applicationType}
                className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continue →
              </button>
            </>
          ) : (
            <>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    Case Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Smith / ABC Corp — LMIA 2026"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Client Name</label>
                    <input type="text" value={form.clientName} onChange={e => set('clientName', e.target.value)} className={inputClass} placeholder="John Smith" />
                  </div>
                  <div>
                    <label className={labelClass}>Client Nationality</label>
                    <input type="text" value={form.nationality} onChange={e => set('nationality', e.target.value)} className={inputClass} placeholder="India, Philippines…" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Employer Name</label>
                    <input type="text" value={form.employerName} onChange={e => set('employerName', e.target.value)} className={inputClass} placeholder="ABC Corporation Inc." />
                  </div>
                  <div>
                    <label className={labelClass}>Province</label>
                    <select value={form.province} onChange={e => set('province', e.target.value)} className={inputClass + ' cursor-pointer'}>
                      <option value="">Select province</option>
                      {PROVINCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>NOC Code</label>
                    <input type="text" value={form.nocCode} onChange={e => set('nocCode', e.target.value)} className={inputClass} placeholder="21232" />
                  </div>
                  <div>
                    <label className={labelClass}>Permit Duration (months)</label>
                    <input type="number" min="1" max="60" value={form.permitDuration} onChange={e => set('permitDuration', e.target.value)} className={inputClass} placeholder="24" />
                  </div>
                  <div>
                    <label className={labelClass}>Offered Salary (CAD/yr)</label>
                    <input type="number" value={form.offeredSalary} onChange={e => set('offeredSalary', e.target.value)} className={inputClass} placeholder="65000" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Internal Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    rows={3}
                    className={inputClass + ' resize-none'}
                    placeholder="Any relevant context for this case…"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating…' : 'Create Case →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
