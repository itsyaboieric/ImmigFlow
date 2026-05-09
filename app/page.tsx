import Link from 'next/link'
import HomeProductVisual from './HomeProductVisual'

// ── Shared primitives ─────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeOpacity="0.3"/>
      <path d="M4.5 7l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-[11px] tracking-tight">IF</span>
            </div>
            <span className="font-semibold text-gray-900 text-[15px] tracking-tight">ImmigFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
            <a href="#pricing"      className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/sign-up"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm">
              Get started →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-grid-dots opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Built for Canadian RCICs — LMIA, Work Permits, Express Entry
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6 text-balance">
            Your AI back-office
            <br />
            <span className="text-brand-600">for immigration files.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            ImmigFlow reads client documents, validates every field, and assembles
            ready-to-review LMIA and work permit packages — in under 90 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href="/sign-up"
              className="w-full sm:w-auto bg-gray-900 text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg">
              Start free trial
            </Link>
            <Link href="/sign-in"
              className="w-full sm:w-auto text-gray-600 border border-gray-200 bg-white px-7 py-3.5 rounded-xl text-[15px] font-medium hover:border-gray-300 hover:bg-gray-50 transition-all">
              Sign in to your account
            </Link>
          </div>

          {/* Social proof bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400 border-t border-gray-100 pt-8">
            {[
              'RCIC-designed',
              'Full audit trail',
              'RCIC always signs',
              'Data stored in Canada',
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scroll product visual (client component) ───────────────────────── */}
      <section id="how-it-works" className="bg-gray-50 border-y border-gray-100 py-4">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-4">
            <span className="text-xs font-semibold tracking-widest text-brand-600 uppercase">The workflow</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-3 tracking-tight text-balance">
              From documents to signed package.<br className="hidden md:block" />Scroll to see how.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              The same work that used to take 6–8 hours of copy-pasting between PDFs. Done before lunch.
            </p>
          </div>
        </div>

        <HomeProductVisual />

        <div className="max-w-6xl mx-auto px-6 py-16" />
      </section>

      {/* ── Why it matters ─────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold tracking-widest text-brand-600 uppercase">The problem</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-5 tracking-tight leading-snug text-balance">
                The bottleneck isn&apos;t the RCIC.<br />It&apos;s the data entry.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5">
                Every RCIC practice employs someone whose entire job is opening a passport, typing the
                passport number into a PDF form, opening the diploma, typing the institution name into
                a different field — for 6 to 8 hours a day.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                ImmigFlow replaces that. The AI reads every document, extracts every field, cross-validates
                everything, and hands the RCIC a complete, auditable draft to review and sign off.
              </p>
              <div className="space-y-2.5">
                {[
                  'Process files in under 90 minutes, not 6–8 hours',
                  'Catch name mismatches and expiry issues automatically',
                  'Every AI-filled field is cited back to its source document',
                  'The RCIC still reviews and signs everything — fully compliant',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3 text-gray-700 text-sm">
                    <CheckIcon />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '90 min', sub: 'Average time to a complete application package', accent: true },
                { label: '6–8 hrs', sub: 'Time the same work takes with a case worker', muted: true },
                { label: '40%', sub: 'More files per month, same headcount', accent: true },
                { label: '100%', sub: 'RCIC review and sign-off required on every package', accent: true },
              ].map(({ label, sub, accent, muted }) => (
                <div key={label}
                  className={`rounded-2xl p-6 border ${
                    muted
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-gray-200 shadow-card'
                  }`}>
                  <div className={`text-3xl font-bold tracking-tight mb-1.5 ${
                    muted ? 'text-gray-400 line-through decoration-red-400 decoration-2' : 'text-gray-900'
                  }`}>{label}</div>
                  <p className={`text-xs leading-relaxed ${muted ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust & compliance ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-brand-600 uppercase">Built for professionals</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-3 tracking-tight">
              Designed around RCIC compliance requirements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '📋',
                label: 'Full audit trail',
                desc: 'Every AI-filled field is traced to its exact source document and page.',
              },
              {
                icon: '✍️',
                label: 'RCIC always signs',
                desc: 'ImmigFlow never submits to IRCC. The licensed professional reviews and signs off on everything.',
              },
              {
                icon: '🛡️',
                label: 'Data stored in Canada',
                desc: 'All client data stays within Canadian borders. PIPEDA-compliant from day one.',
              },
              {
                icon: '⚠️',
                label: 'Confidence thresholds',
                desc: 'Any field below 90% extraction confidence is flagged red and requires manual verification.',
              },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card">
                <div className="text-2xl mb-4">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-[15px]">{label}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest text-brand-600 uppercase">Pricing</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-3 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500">
              A junior case worker costs $55,000/year fully loaded. ImmigFlow costs $1,788/year.
              <br className="hidden md:block" />
              The math takes four seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: 'Solo',
                price: '$149',
                desc: 'For a single RCIC handling a focused caseload.',
                features: ['1 RCIC user', 'Up to 15 active files', 'Full AI extraction', 'Client portal', 'Validation & checklists'],
              },
              {
                name: 'Practice',
                price: '$349',
                desc: 'For a small firm ready to scale throughput.',
                highlight: true,
                features: ['3 RCIC users', 'Unlimited active files', 'Team collaboration', 'White-label client portal', 'Priority support'],
              },
              {
                name: 'Firm',
                price: '$699',
                desc: 'For multi-consultant practices and regional firms.',
                features: ['10 RCIC users', 'Multi-location', 'Custom branding', 'API access', 'Dedicated onboarding'],
              },
            ].map(({ name, price, desc, highlight, features }) => (
              <div key={name}
                className={`rounded-2xl border p-7 relative flex flex-col ${
                  highlight
                    ? 'bg-gray-900 border-gray-800 shadow-card-lg'
                    : 'bg-white border-gray-200 shadow-card'
                }`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className={`text-sm font-semibold mb-1 ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>{name}</div>
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
                  className={`block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                    highlight
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}>
                  Get started
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            No annual commitment required in the first year. Cancel any time. No hidden fees.
          </p>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight text-balance">
            Ready to double your throughput?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Join the RCICs who process twice the files without doubling headcount.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up"
              className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-gray-800 transition-all shadow-md">
              Start free trial
            </Link>
            <Link href="/sign-in"
              className="w-full sm:w-auto text-gray-600 bg-white border border-gray-200 px-8 py-3.5 rounded-xl text-[15px] font-medium hover:border-gray-300 hover:bg-gray-50 transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-brand-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">IF</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">ImmigFlow</span>
          </div>
          <p className="text-xs text-gray-400 text-center sm:text-right">
            immigflow.io · ImmigFlow does not provide immigration advice.
            All outputs require review and sign-off by a licensed RCIC before submission to IRCC.
          </p>
        </div>
      </footer>
    </div>
  )
}
