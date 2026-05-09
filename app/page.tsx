import Link from 'next/link'
import ScrollReveal from './ScrollReveal'

// ─── Hero floating cards ──────────────────────────────────────────────────────
// Pure HTML + CSS — no client JS, animations are CSS keyframes from globals.css

function ExtractionCard() {
  return (
    <div className="card-1 absolute top-[5%] left-[2%] w-72 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-8 bg-white border border-gray-200 rounded flex items-center justify-center flex-shrink-0">
            <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
              <path d="M1 1h6.5L10 3.5V12H1V1z" stroke="#94a3b8" strokeWidth="1.1" fill="none"/>
              <path d="M6.5 1v2.5H10" stroke="#94a3b8" strokeWidth="1.1"/>
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-gray-700 truncate">passport_zhang.pdf</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0">97%</span>
      </div>
      {/* Extracted fields */}
      <div className="px-4 py-3 space-y-2">
        {[
          ['Family Name',    'ZHANG',       '0.8s'],
          ['Given Name(s)',  'WEI',         '1.05s'],
          ['Date of Birth',  '1986-08-14',  '1.25s'],
          ['Passport No.',   'G45891022',   '1.45s'],
          ['Expiry Date',    '2029-03-21',  '1.65s'],
        ].map(([label, value, delay], i) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 w-24 flex-shrink-0">{label}</span>
            <span
              className={`field-v field-v-${i + 1} text-[11px] font-semibold text-gray-800 font-mono`}
            >{value}</span>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-[10px] text-emerald-600 font-medium">Extracted · 2.4 s</span>
      </div>
    </div>
  )
}

function ValidationCard() {
  return (
    <div className="card-2 absolute bottom-[8%] right-[-4%] w-60 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.10)] border border-gray-100 z-20">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
        <span className="text-[11px] font-semibold text-gray-700">Validation Results</span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {[
          'Names consistent across docs',
          'Passport valid until 2029',
          'Salary above ESDC floor — ON',
        ].map(item => (
          <div key={item} className="flex items-start gap-2">
            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="6" height="5" viewBox="0 0 6 5" fill="none">
                <path d="M1 2.5l1.5 1.5 3-3" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[10px] text-gray-600 leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
      <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-center">
        <span className="text-[10px] font-semibold text-emerald-700">✓ No issues found</span>
      </div>
    </div>
  )
}

function CaseCard() {
  return (
    <div className="card-3 absolute top-[10%] right-[2%] w-56 bg-white rounded-2xl shadow-[0_12px_36px_rgba(79,70,229,0.10)] border border-gray-100 z-10">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-gray-800 truncate">Zhang Wei</span>
          <span className="text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">Review</span>
        </div>
        <p className="text-[10px] text-gray-400 mb-3">LMIA High Wage · Ontario</p>
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">Documents</span>
            <span className="text-[10px] font-semibold text-gray-800">4 / 5</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-1 bg-brand-500 rounded-full" style={{ width: '80%' }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500">Extracted</span>
          <span className="text-[10px] font-semibold text-emerald-600">3 / 3</span>
        </div>
      </div>
    </div>
  )
}

// ─── Feature section visual components ───────────────────────────────────────

function DocumentFlowVisual() {
  const docs = [
    { name: 'passport_zhang.pdf',   type: 'PASSPORT',     fields: ['Name: Zhang Wei', 'DOB: 1986-08-14', 'Expiry: 2029-03-21'] },
    { name: 'job_offer_pacific.pdf', type: 'JOB OFFER',   fields: ['Employer: Pacific Tech', 'Salary: $78,000/yr', 'NOC: 21232'] },
    { name: 'employment_ref.pdf',   type: 'EMP. LETTER',  fields: ['Role: Software Eng.', 'Start: Jan 2023', 'Province: ON'] },
  ]
  return (
    <div className="space-y-3">
      {docs.map((doc, i) => (
        <ScrollReveal key={doc.name} delay={(i + 1) * 80}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-4 flex items-start gap-4">
            {/* File icon */}
            <div className="w-9 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="text-gray-400">
                <path d="M1 2a1 1 0 011-1h7l4 4v9a1 1 0 01-1 1H2a1 1 0 01-1-1V2z" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M8 1v4h4" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[12px] font-semibold text-gray-700 truncate">{doc.name}</span>
                <span className="text-[9px] font-bold bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-full flex-shrink-0">{doc.type}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {doc.fields.map(f => (
                  <span key={f} className="text-[11px] text-gray-500 font-mono">{f}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-emerald-600 font-semibold whitespace-nowrap">Extracted</span>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  )
}

function ValidationVisual() {
  const checks = [
    { label: 'Name identical across passport, offer letter, and pay stubs', ok: true },
    { label: 'Passport expires March 2029 — 7 months beyond permit end', ok: true },
    { label: 'Offered salary $78,000 exceeds ESDC floor for NOC 21232 in Ontario', ok: true },
    { label: 'Employment dates cover minimum 12-month experience requirement', ok: true },
    { label: 'Offered salary not matching extracted job offer document', ok: false, warn: true },
  ]
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card-md overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-gray-900">Validation Results</span>
        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">4 passed · 1 flagged</span>
      </div>
      <div className="px-5 py-4 space-y-2.5">
        {checks.map((c, i) => (
          <ScrollReveal key={c.label} delay={(i + 1) * 80}>
            <div className={`flex items-start gap-3 px-3.5 py-2.5 rounded-xl ${
              c.warn ? 'bg-amber-50 border border-amber-100' : 'bg-emerald-50/60 border border-emerald-100'
            }`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${c.warn ? 'bg-amber-400' : 'bg-emerald-500'}`}>
                <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                  {c.warn
                    ? <path d="M3.5 1.5v2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                    : <path d="M1 3l1.5 1.5 3.5-3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  }
                </svg>
              </div>
              <span className={`text-[12px] leading-relaxed ${c.warn ? 'text-amber-800' : 'text-emerald-900'}`}>{c.label}</span>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}

function SignoffVisual() {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
          <span className="text-[13px] font-semibold text-gray-900">Pre-Filled Form Fields</span>
        </div>
        <table className="w-full text-[11px]">
          <tbody className="divide-y divide-gray-100">
            {[
              ['Family Name',       'ZHANG',            'passport.pdf',     97],
              ['Given Name(s)',     'WEI',              'passport.pdf',     97],
              ['Passport Number',   'G45891022',        'passport.pdf',     95],
              ['Employer Name',     'Pacific Tech Soln.','job_offer.pdf',   93],
              ['Job Title',         'Software Engineer', 'job_offer.pdf',   91],
              ['Offered Salary',    '$78,000 / yr',     'job_offer.pdf',    88],
            ].map(([field, value, source, conf]) => (
              <tr key={String(field)} className={Number(conf) < 90 ? 'bg-amber-50/50' : ''}>
                <td className="px-4 py-2 text-gray-500 font-medium w-32">{field}</td>
                <td className={`px-4 py-2 font-mono font-semibold ${Number(conf) < 90 ? 'text-amber-700' : 'text-gray-800'}`}>{value}</td>
                <td className="px-4 py-2 text-gray-400 hidden sm:table-cell">{source}</td>
                <td className={`px-4 py-2 text-right font-semibold ${Number(conf) >= 90 ? 'text-emerald-600' : 'text-amber-500'}`}>{conf}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-4 border-t border-gray-100 bg-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center flex-shrink-0">
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[12px] font-semibold text-emerald-800">Signed off by Jane Smith RCIC · May 9, 2026</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Fixed nav ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-[11px] tracking-tight">IF</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tight">ImmigFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing"  className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors hidden sm:block">Sign in</Link>
            <Link href="/sign-up" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-sm">
              Get started →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-14 overflow-hidden">
        {/* Soft background */}
        <div className="absolute inset-0 bg-[#F9FAFB]" />
        <div className="absolute inset-0 bg-grid-dots opacity-60" />
        {/* Ambient glow top-right */}
        <div className="absolute top-0 right-0 w-[700px] h-[600px] bg-gradient-to-bl from-brand-100/40 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-6 py-24 lg:py-0 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-center min-h-[calc(100vh-56px)]">

          {/* Left: headline */}
          <div className="lg:py-24">
            <div className="hero-badge inline-flex items-center gap-2 text-xs font-semibold bg-white border border-gray-200 shadow-sm text-gray-600 px-3 py-1.5 rounded-full mb-7">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Built for Canadian RCICs
            </div>

            <h1 className="hero-h1 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.04] tracking-[-0.03em] text-gray-900 mb-7 text-balance">
              The AI back-office
              <br />
              <span className="text-brand-600">for immigration</span>
              <br />
              <span className="text-brand-600">files.</span>
            </h1>

            <p className="hero-sub text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-lg text-balance">
              ImmigFlow reads client documents, validates every field, and assembles
              ready-to-review LMIA and work permit packages — in under 90 minutes.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-3">
              <Link href="/sign-up"
                className="bg-gray-900 text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg text-center">
                Start free trial
              </Link>
              <Link href="/sign-in"
                className="bg-white text-gray-700 border border-gray-200 px-7 py-3.5 rounded-xl text-[15px] font-medium hover:border-gray-300 hover:bg-gray-50 transition-all text-center">
                Sign in
              </Link>
            </div>

            <div className="hero-cta flex flex-wrap items-center gap-x-6 gap-y-2 mt-8">
              {['RCIC-designed', 'Full audit trail', 'Data stored in Canada'].map(item => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-gray-400">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5l2.5 2.5 5-5" stroke="#4f46e5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: floating cards */}
          <div className="relative h-[480px] hidden lg:block">
            <ExtractionCard />
            <ValidationCard />
            <CaseCard />
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 animate-bounce">
          <span className="text-xs font-medium tracking-wider uppercase">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ── Stat callout ─────────────────────────────────────────────────── */}
      <section className="py-32 bg-white border-y border-gray-100 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal className="">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-10">The time savings</p>
          </ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            <ScrollReveal delay={80}>
              <div className="text-center">
                <div className="text-7xl md:text-8xl font-bold text-gray-400 line-through decoration-red-400 decoration-[6px] leading-none mb-2 tracking-tight">
                  6–8
                </div>
                <p className="text-gray-400 text-sm font-medium">hours per file (today)</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={160}>
              <div className="text-5xl text-gray-300 font-light">→</div>
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <div className="text-center">
                <div className="text-7xl md:text-8xl font-bold text-brand-600 leading-none mb-2 tracking-tight">
                  90
                </div>
                <p className="text-gray-600 text-sm font-semibold">minutes with ImmigFlow</p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal className="mt-10" delay={320}>
            <p className="text-gray-400 text-base max-w-lg mx-auto">
              The same work Jordan spent 6–8 hours on — opening the passport, typing the number into a PDF,
              opening the diploma, typing the institution name into another field. Done before lunch.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <div id="features">

        {/* Feature 1: AI reads everything */}
        <section className="py-28 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="lg:sticky lg:top-28">
                <ScrollReveal className="">
                  <span className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-4 block">Document extraction</span>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5 text-balance">
                    AI reads every document you upload.
                  </h2>
                  <p className="text-gray-500 text-lg leading-relaxed mb-6 text-balance">
                    Passports, job offers, employment letters, pay stubs, diplomas. Claude extracts every field
                    into a structured case record with a confidence score. Anything below 90% is flagged red.
                  </p>
                  <p className="text-gray-500 leading-relaxed text-balance">
                    Every value is cited back to its exact source document. You always know where the data came from.
                  </p>
                </ScrollReveal>
              </div>
              <div>
                <DocumentFlowVisual />
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2: Cross-validation */}
        <section className="py-28 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="order-2 lg:order-1">
                <ValidationVisual />
              </div>
              <div className="order-1 lg:order-2 lg:sticky lg:top-28">
                <ScrollReveal className="">
                  <span className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-4 block">Validation</span>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5 text-balance">
                    Every field is cross-checked automatically.
                  </h2>
                  <p className="text-gray-500 text-lg leading-relaxed mb-6 text-balance">
                    Name consistency across every document. Passport expiry vs. permit duration plus six months.
                    Offered wage vs. ESDC prevailing rate for the NOC code and province.
                  </p>
                  <p className="text-gray-500 leading-relaxed text-balance">
                    Every inconsistency is flagged with the specific documents that conflict and what needs to be fixed.
                  </p>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Sign off */}
        <section className="py-28 bg-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 text-center mb-14">
            <ScrollReveal className="">
              <span className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-4 block">RCIC sign-off</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5 text-balance">
                You review. You sign. You submit.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto text-balance">
                ImmigFlow never submits to IRCC. You see every pre-filled field traced to its source document,
                override anything you want, and sign off as the licensed RCIC. The package is yours to submit.
              </p>
            </ScrollReveal>
          </div>
          <ScrollReveal className="max-w-2xl mx-auto px-6">
            <SignoffVisual />
          </ScrollReveal>
        </section>
      </div>

      {/* ── Trust / compliance ────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-3 block">Designed for licensed professionals</span>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Built around RCIC compliance requirements
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📋', label: 'Full audit trail',      desc: 'Every AI-filled field is traced to its exact source document and page number.' },
              { icon: '✍️',  label: 'RCIC always signs',    desc: 'ImmigFlow never submits to IRCC. The licensed professional reviews and signs every package.' },
              { icon: '🛡️', label: 'Data stored in Canada', desc: 'All client data stays within Canadian borders. PIPEDA-compliant from day one.' },
              { icon: '⚠️', label: '90% confidence rule',   desc: 'Fields below 90% extraction confidence are flagged red and require manual verification.' },
            ].map(({ icon, label, desc }, i) => (
              <ScrollReveal key={label} delay={(i + 1) * 80}>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full">
                  <div className="text-2xl mb-4">{icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-[14px]">{label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-3 block">Pricing</span>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Simple, transparent pricing</h2>
            <p className="text-gray-500">
              A junior case worker costs $55,000/year fully loaded. ImmigFlow costs $1,788/year.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'Solo',    price: '$149', desc: 'For a single RCIC with a focused caseload.',         features: ['1 RCIC', 'Up to 15 active files', 'Full AI extraction', 'Client portal'] },
              { name: 'Practice', price: '$349', desc: 'For a small firm ready to scale throughput.', highlight: true, features: ['3 RCICs', 'Unlimited files', 'Team collaboration', 'White-label portal', 'Priority support'] },
              { name: 'Firm',    price: '$699', desc: 'For multi-consultant practices and regional firms.', features: ['10 RCICs', 'Multi-location', 'Custom branding', 'API access', 'Dedicated onboarding'] },
            ].map(({ name, price, desc, highlight, features }, i) => (
              <ScrollReveal key={name} delay={(i + 1) * 80}>
                <div className={`rounded-2xl border p-7 flex flex-col h-full relative ${
                  highlight ? 'bg-gray-900 border-gray-800 shadow-card-lg' : 'bg-white border-gray-200 shadow-card'
                }`}>
                  {highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                      Most popular
                    </div>
                  )}
                  <div className={`text-sm font-semibold mb-0.5 ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>{name}</div>
                  <div className={`text-4xl font-bold tracking-tight mb-0.5 ${highlight ? 'text-white' : 'text-gray-900'}`}>{price}</div>
                  <div className={`text-sm mb-3 ${highlight ? 'text-gray-500' : 'text-gray-400'}`}>/month</div>
                  <p className={`text-sm mb-6 leading-relaxed ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {features.map(f => (
                      <li key={f} className={`text-sm flex items-start gap-2.5 ${highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
                          <path d="M2.5 7l3 3 6-6" stroke={highlight ? '#818cf8' : '#4f46e5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up"
                    className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      highlight ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}>
                    Get started
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal className="mt-8 text-center">
            <p className="text-sm text-gray-400">No annual commitment in year one. Cancel any time.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollReveal className="">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4 text-balance">
              Ready to double your throughput?
            </h2>
            <p className="text-gray-500 mb-8 text-lg text-balance">
              Join the RCICs processing twice the files without doubling headcount.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/sign-up"
                className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-gray-800 transition-all shadow-md">
                Start free trial
              </Link>
              <Link href="/sign-in"
                className="w-full sm:w-auto text-gray-600 bg-white border border-gray-200 px-8 py-3.5 rounded-xl text-[15px] font-medium hover:bg-gray-50 transition-all">
                Sign in
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-brand-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">IF</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">ImmigFlow</span>
          </div>
          <p className="text-xs text-gray-400 text-center sm:text-right">
            immigflow.io · ImmigFlow does not provide immigration advice. All outputs require RCIC review and sign-off before submission to IRCC.
          </p>
        </div>
      </footer>
    </div>
  )
}
