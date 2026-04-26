# ImmigFlow

AI back-office for Canadian immigration consultants (RCICs). Upload client documents, let Claude extract every field, catch inconsistencies automatically, and produce a signed, ready-to-review application package — in under 90 minutes instead of 6–8 hours.

---

## What it does

| Step | What happens |
|---|---|
| **1. Open a case** | Select LMIA High Wage, LMIA Low Wage, or Employer-Specific Work Permit |
| **2. Dynamic checklist** | Platform generates a document checklist based on province, NOC code, and client nationality |
| **3. Upload documents** | Passport, job offer letter, employment letters, pay stubs, business registration (PDF or image) |
| **4. AI extraction** | Claude reads each document and returns structured JSON — name, DOB, passport number, salary, dates, etc. |
| **5. Cross-validation** | Checks name consistency across all documents, passport expiry vs. permit duration, ESDC wage floor by province |
| **6. Form pre-fill review** | See every IRCC form field mapped to its extracted value, source document, and confidence score. Fields below 90% confidence are flagged red |
| **7. Sign off** | RCIC reviews, confirms professional responsibility, signs off. Download the application package |

The RCIC always submits to IRCC. ImmigFlow prepares the package — it does not touch the government portal.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Backend | Next.js API routes |
| Database | Prisma ORM · SQLite (local) |
| Auth | NextAuth.js · JWT sessions · credentials provider |
| AI | Anthropic Claude claude-sonnet-4-6 · structured JSON extraction |
| File storage | Local filesystem (`/uploads`) |

---

## Getting started

### Prerequisites

- macOS or Linux
- An [Anthropic API key](https://console.anthropic.com)

### 1 — Clone the repo

```bash
git clone https://github.com/itsyaboieric/ImmigFlow.git
cd ImmigFlow
```

### 2 — Set up environment variables

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

Then add:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="any-random-32-character-string"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```

> Generate a secure `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

### 3 — Install and run

**Option A — automated setup script (installs Node.js via Homebrew if needed):**

```bash
bash setup.sh
```

**Option B — manual (if Node.js is already installed):**

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open **http://localhost:3000**

---

## Project structure

```
├── app/
│   ├── (auth)/              # Sign in / Sign up pages
│   ├── (dashboard)/         # Protected dashboard, case list, case detail
│   └── api/                 # API routes
│       ├── auth/            # NextAuth + registration
│       ├── cases/           # Case CRUD, validate, sign-off
│       ├── documents/       # Delete, extract with AI
│       └── upload/          # File upload handler
├── components/              # Shared UI components
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── checklist.ts         # Dynamic document checklist rules
│   ├── claude.ts            # Anthropic SDK wrapper + extraction prompts
│   ├── db.ts                # Prisma client singleton
│   ├── utils.ts             # Labels, colours, formatters
│   └── validation.ts        # Cross-document validation logic
├── prisma/
│   └── schema.prisma        # User, Case, Document models
├── types/
│   └── next-auth.d.ts       # Session type extensions
└── uploads/                 # Uploaded files (gitignored)
```

---

## Document types supported

| Document | Extracted fields |
|---|---|
| Passport | Full name, DOB, passport number, expiry, issuing country, nationality, sex |
| Job Offer Letter | Employer, job title, NOC code, start/end date, location, salary |
| Employment Reference Letter | Employer, employee name, role, dates, location, salary |
| Pay Stub | Employer, employee, pay period, gross/net pay |
| Diploma / Degree | Institution, graduate name, credential, field of study, graduation date |
| Business Registration | Business name, registration number, jurisdiction |

---

## Validation checks

- **Name consistency** — flags if the applicant's name differs across any two documents
- **Passport expiry** — must be valid for the full permit duration plus 6 months
- **Wage floor** — offered salary checked against ESDC minimum wage for the province
- **Employment date continuity** — warns if multiple reference letters have gaps

---

## Application types

| Type | Key requirements |
|---|---|
| LMIA — High Wage | Passport, signed job offer, business registration, 3× pay stubs, employment references |
| LMIA — Low Wage | Same as high wage; BC employers additionally need WorkBC registration |
| Employer-Specific Work Permit | Passport, job offer with LMIA number, employment references |

---

## Important notes

- **ImmigFlow is not a legal advice tool.** It fills forms for licensed RCICs who review and sign everything.
- **The RCIC always submits.** ImmigFlow never touches IRCC or ESDC portals.
- **AI output is always a draft.** Every extracted field is traceable to its source document. Fields below 90% confidence require manual confirmation.
- All client data stays local by default. For production, replace local file storage and SQLite with cloud equivalents (e.g. Supabase + S3).

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path, e.g. `file:./dev.db` |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing |
| `NEXTAUTH_URL` | Yes | App base URL, e.g. `http://localhost:3000` |
| `ANTHROPIC_API_KEY` | Yes (for AI) | Key from console.anthropic.com |

---

## License

MIT
