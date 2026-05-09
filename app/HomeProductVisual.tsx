'use client'

import { useEffect, useRef, useState } from 'react'

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  {
    tag: '01 — Create',
    heading: 'Open a case in seconds.',
    body: 'Select LMIA High Wage, Low Wage, or Work Permit. ImmigFlow immediately generates a dynamic document checklist — conditioned on employer province, NOC code, and applicant nationality. No generic templates.',
  },
  {
    tag: '02 — Upload',
    heading: 'AI reads every document you upload.',
    body: 'Drop a passport, job offer, and employment letters. Claude extracts every field into a structured record with confidence scores. Anything below 90% is flagged for your review.',
  },
  {
    tag: '03 — Validate',
    heading: 'Every field cross-checked automatically.',
    body: 'Name consistency across all documents. Passport expiry vs. permit duration. Offered wage vs. ESDC prevailing rate. Every inconsistency is surfaced with the exact documents that conflict.',
  },
  {
    tag: '04 — Sign Off',
    heading: 'You review. You sign. You submit.',
    body: 'See pre-filled form fields traced to their source document. Override anything. Sign off as the licensed RCIC. The package is yours — submit to IRCC the same way you always have.',
  },
]

// ── Mock UI screens ──────────────────────────────────────────────────────────

function Screen0() {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Zhang Wei — Pacific Tech Solutions</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">LMIA High Wage · Ontario · NOC 21232</p>
        </div>
        <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Pending</span>
      </div>
      <div className="h-px bg-slate-100" />
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-700">Document Checklist</span>
          <span className="text-[11px] text-slate-400">0 / 4 required</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mb-3">
          <div className="h-1 bg-brand-500 rounded-full w-0 transition-all duration-700" />
        </div>
        {['Passport', 'Job Offer Letter', 'Business Registration', 'Pay Stubs (3 months)'].map(item => (
          <div key={item} className="flex items-center gap-2 py-1.5">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 flex-shrink-0" />
            <span className="text-[11px] text-slate-500">{item}</span>
            <span className="ml-auto text-[10px] text-red-400 font-medium">Required</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Screen1() {
  const docs = [
    { name: 'passport_zhang.pdf', type: 'PASSPORT', size: '1.2 MB' },
    { name: 'job_offer_pacific.pdf', type: 'JOB OFFER', size: '0.4 MB' },
    { name: 'employment_ref.pdf', type: 'EMP. LETTER', size: '0.8 MB' },
  ]
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Zhang Wei — Pacific Tech Solutions</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">LMIA High Wage · Ontario · NOC 21232</p>
        </div>
        <span className="text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Docs Pending</span>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-1.5">
        {docs.map((doc, i) => (
          <div key={doc.name} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5"
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-7 h-8 bg-white border border-slate-200 rounded flex items-center justify-center flex-shrink-0">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <path d="M1 1h7l3 3v9H1V1z" stroke="#94a3b8" strokeWidth="1" fill="none"/>
                <path d="M7 1v3h3" stroke="#94a3b8" strokeWidth="1"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-slate-700 truncate">{doc.name}</p>
              <p className="text-[10px] text-slate-400">{doc.type} · {doc.size}</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium flex-shrink-0">UPLOADED</span>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-slate-700">Checklist Progress</span>
          <span className="text-[11px] text-slate-400">2 / 4 required</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full">
          <div className="h-1 bg-brand-500 rounded-full w-1/2 transition-all duration-700" />
        </div>
      </div>
    </div>
  )
}

function Screen2() {
  const fields = [
    { label: 'Family Name',     value: 'ZHANG',              conf: 97, src: 'passport_zhang.pdf' },
    { label: 'Given Name(s)',   value: 'WEI',                conf: 97, src: 'passport_zhang.pdf' },
    { label: 'Date of Birth',   value: '1986-08-14',         conf: 98, src: 'passport_zhang.pdf' },
    { label: 'Passport No.',    value: 'G45891022',          conf: 95, src: 'passport_zhang.pdf' },
    { label: 'Expiry Date',     value: '2029-03-21',         conf: 98, src: 'passport_zhang.pdf' },
    { label: 'Employer Name',   value: 'Pacific Tech Solutions', conf: 93, src: 'job_offer_pacific.pdf' },
    { label: 'Offered Salary',  value: '$78,000 / yr',       conf: 88, src: 'job_offer_pacific.pdf' },
  ]
  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Extracted Fields</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Source-cited from 3 documents</p>
        </div>
        <span className="text-[10px] font-medium bg-indigo-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded-full">Ready for Review</span>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-2.5 py-1.5 text-slate-500 font-medium">Field</th>
              <th className="text-left px-2.5 py-1.5 text-slate-500 font-medium">Value</th>
              <th className="text-right px-2.5 py-1.5 text-slate-500 font-medium">Conf.</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.label} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-2.5 py-1.5 text-slate-500 font-medium whitespace-nowrap">{f.label}</td>
                <td className={`px-2.5 py-1.5 font-mono font-semibold ${f.conf < 90 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {f.value}
                </td>
                <td className="px-2.5 py-1.5 text-right">
                  <span className={`font-semibold ${f.conf >= 90 ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {f.conf}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Screen3() {
  const checks = [
    { label: 'All required documents uploaded', detail: '4 of 4', ok: true },
    { label: 'AI extraction complete',          detail: '3 of 3', ok: true },
    { label: 'Cross-document validation run',  detail: 'No errors', ok: true },
    { label: 'Name consistency verified',       detail: 'All match', ok: true },
  ]
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Zhang Wei — Pacific Tech Solutions</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">LMIA High Wage · Ontario · NOC 21232</p>
        </div>
        <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Signed Off</span>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-1.5">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[11px] font-medium text-emerald-900 flex-1">{c.label}</span>
            <span className="text-[10px] text-emerald-600">{c.detail}</span>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 text-white text-center rounded-lg py-2.5 text-[11px] font-semibold tracking-wide">
        Download Application Package →
      </div>
    </div>
  )
}

const SCREENS = [Screen0, Screen1, Screen2, Screen3]

// ── Main export ───────────────────────────────────────────────────────────────

export default function HomeProductVisual() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    function onScroll() {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) return
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
      setStep(Math.min(3, Math.floor(progress * 4)))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const Screen = SCREENS[step]

  return (
    /* The section is tall enough to scroll through all 4 steps */
    <div ref={sectionRef} style={{ height: '380vh' }} className="relative">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: step text */}
            <div>
              {/* Step pill indicators */}
              <div className="flex items-center gap-2 mb-8">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!sectionRef.current) return
                      const rect = sectionRef.current.getBoundingClientRect()
                      const scrollable = rect.height - window.innerHeight
                      const targetProgress = (i + 0.5) / 4
                      window.scrollBy({ top: rect.top + targetProgress * scrollable, behavior: 'smooth' })
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === step ? 'w-8 bg-brand-600' : 'w-3 bg-gray-200 hover:bg-gray-300'
                    }`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              <div key={step} className="animate-fade-up">
                <span className="text-xs font-semibold tracking-widest text-brand-600 uppercase mb-4 block">
                  {STEPS[step].tag}
                </span>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-5 text-balance">
                  {STEPS[step].heading}
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed text-balance">
                  {STEPS[step].body}
                </p>
              </div>

              {/* Scroll hint — only on first step */}
              {step === 0 && (
                <p className="mt-10 text-sm text-gray-400 flex items-center gap-2">
                  <span className="inline-block animate-bounce">↓</span>
                  Scroll to see the full workflow
                </p>
              )}
            </div>

            {/* Right: product mockup */}
            <div className="relative">
              {/* Ambient glow */}
              <div className="absolute inset-0 -m-8 bg-brand-50/60 rounded-3xl blur-2xl pointer-events-none" />

              {/* Mock browser frame */}
              <div className="relative bg-white rounded-2xl shadow-card-lg border border-gray-200/80 overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1.5 flex items-center gap-2 max-w-xs mx-auto">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-400 flex-shrink-0">
                      <rect x="1" y="1" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                    <span className="text-[10px] text-gray-400 font-mono truncate">immigflow.io/cases/zhang-wei</span>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-brand-600 rounded-sm" />
                  </div>
                </div>

                {/* App nav bar */}
                <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-brand-600 rounded flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">IF</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-900">ImmigFlow</span>
                  </div>
                  <span className="text-gray-300 text-[11px] mx-1">/</span>
                  <span className="text-[11px] text-gray-500">Cases</span>
                  <span className="text-gray-300 text-[11px] mx-1">/</span>
                  <span className="text-[11px] text-gray-800 font-medium">Zhang Wei</span>
                </div>

                {/* Tab navigation */}
                <div className="border-b border-gray-100 px-4 flex gap-0">
                  {['Overview', 'Documents', 'Review', 'Sign Off'].map((tab, i) => (
                    <div key={tab} className={`px-3 py-2 text-[10px] font-medium border-b-2 transition-colors ${
                      i === step
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-gray-400'
                    }`}>
                      {tab}
                    </div>
                  ))}
                </div>

                {/* Screen content — transitions smoothly between steps */}
                <div key={step} className="animate-fade-in min-h-[280px]">
                  {step === 0 && <Screen0 />}
                  {step === 1 && <Screen1 />}
                  {step === 2 && <Screen2 />}
                  {step === 3 && <Screen3 />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
