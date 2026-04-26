import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IF</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">ImmigFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
          Built for RCICs in Canada
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
          Your AI back-office
          <br />
          for immigration files
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          ImmigFlow reads client documents, validates data across every field, and assembles
          ready-to-review LMIA and work permit packages — so you can handle twice the caseload
          without hiring another case worker.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="bg-brand-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-brand-700 transition-colors"
          >
            Start free trial
          </Link>
          <Link
            href="/sign-in"
            className="text-gray-600 px-6 py-3 rounded-lg text-base font-medium hover:text-gray-900 transition-colors"
          >
            Sign in to your account
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            From documents to signed package in under 90 minutes
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            The same work Jordan used to spend 6–8 hours on. Done before lunch.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Open a case',
                desc: 'Select the application type — LMIA High Wage, LMIA Low Wage, or Work Permit. ImmigFlow generates a precise document checklist based on the employer province, NOC code, and applicant nationality.',
              },
              {
                step: '02',
                title: 'AI reads every document',
                desc: 'Upload passports, employment letters, diplomas, and pay stubs. Claude extracts every field into a structured case record and flags anything below 90% confidence in red.',
              },
              {
                step: '03',
                title: 'Review, sign off, submit',
                desc: 'See all validation results — name mismatches, passport expiry, wage checks. Override any field. When satisfied, sign off. The package is yours to submit to IRCC.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-4xl font-bold text-brand-100 mb-4">{step}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'RCIC-designed', sub: 'Built with practicing consultants' },
              { label: 'Full audit trail', sub: 'Every AI-filled field is cited' },
              { label: 'RCIC always signs', sub: 'You carry the professional judgment' },
              { label: 'Data stored in Canada', sub: 'PIPEDA-compliant from day one' },
            ].map(({ label, sub }) => (
              <div key={label} className="p-4">
                <div className="font-semibold text-gray-900 mb-1">{label}</div>
                <div className="text-sm text-gray-500">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Simple pricing</h2>
          <p className="text-gray-500 text-center mb-12">
            A junior case worker costs $55,000/year fully loaded. ImmigFlow costs $1,788/year.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Solo',
                price: '$149',
                features: ['1 RCIC', 'Up to 15 active files', 'Full AI document processing', 'Client portal'],
              },
              {
                name: 'Practice',
                price: '$349',
                highlight: true,
                features: ['3 RCICs', 'Unlimited files', 'Team collaboration', 'White-label portal', 'Priority support'],
              },
              {
                name: 'Firm',
                price: '$699',
                features: ['10 RCICs', 'Multi-location', 'Custom branding', 'API access', 'Dedicated onboarding'],
              },
            ].map(({ name, price, highlight, features }) => (
              <div
                key={name}
                className={`rounded-xl border p-6 ${
                  highlight
                    ? 'border-brand-500 bg-brand-600 text-white shadow-lg'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${highlight ? 'text-brand-100' : 'text-gray-500'}`}>
                  {name}
                </div>
                <div className={`text-4xl font-bold mb-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>
                  {price}
                </div>
                <div className={`text-sm mb-6 ${highlight ? 'text-brand-200' : 'text-gray-400'}`}>/month</div>
                <ul className="space-y-2">
                  {features.map(f => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${highlight ? 'text-brand-50' : 'text-gray-600'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${highlight ? 'bg-brand-500' : 'bg-brand-50 text-brand-600'}`}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`mt-6 block text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    highlight
                      ? 'bg-white text-brand-600 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">IF</span>
            </div>
            <span className="text-sm font-medium text-gray-900">ImmigFlow</span>
          </div>
          <div className="text-sm text-gray-400">
            immigflow.io · Not legal advice · RCIC sign-off required for all applications
          </div>
        </div>
      </footer>
    </div>
  )
}
