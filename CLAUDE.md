# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Node.js must be on PATH — see note below)
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm start            # Run production build

# Database
npm run db:generate      # Regenerate Prisma client after schema changes
npm run db:push          # Sync schema to dev.db without migrations (solo dev convenience)
npm run db:migrate       # Create / apply migrations in dev (`prisma migrate dev`)
npm run db:migrate:deploy # Apply pending migrations (`prisma migrate deploy`, CI/prod)

# Quality
npm run lint   # ESLint (`next lint`)
npm run test   # Vitest unit tests (`tests/*.test.ts`)
```

If `dev.db` already exists from historic `db:push` use only, baseline migrations once: `npx prisma migrate resolve --applied 20260509120000_baseline`

After any change to `prisma/schema.prisma`, run `db:generate`, then prefer `db:migrate` over `db:push`.

> Node.js is not system-installed. During this session it was bootstrapped from `/tmp/node-v20.18.1-darwin-x64/bin/`. Prefix commands with `export PATH="/tmp/node-v20.18.1-darwin-x64/bin:$PATH"` if `node`/`npm`/`npx` are not found. Running `setup.sh` installs Node.js permanently via Homebrew.

## Architecture

### Request flow

`(dashboard)/layout.tsx` checks the session server-side. Most dashboard pages fetch via `fetch('/api/...')` in Client Components. The **case detail** route (`cases/[id]`) additionally loads initial case HTML on the server through `lib/server/load-case-detail.ts`; the interactive shell is still `components/cases/CaseDetailClient.tsx`.

### Auth

`lib/auth.ts` configures NextAuth with a credentials provider and JWT sessions (no database session table). The session callback attaches `id` and `firmName` to the JWT/session. `getServerSession(authOptions)` is called at the top of every API route to authenticate. `types/next-auth.d.ts` extends the default Session type to include these fields.

### Database

Single SQLite file (`dev.db`) managed by Prisma. Three models: `User → Case → Document`. `Document.extractedData` stores Claude's JSON output as a serialized string — parse with `JSON.parse()` before use. `Document.status` drives the UI state machine: `UPLOADED → PROCESSING → EXTRACTED | ERROR`. `Case.status` follows: `DRAFT → DOCUMENTS_PENDING → REVIEW → SIGNED_OFF`.

### AI extraction pipeline (`lib/claude.ts`)

`extractDocumentData(buffer, mimeType, documentType)` sends a file to `claude-sonnet-4-6` as either a `document` block (PDF) or `image` block (JPEG/PNG/WebP) alongside a strict JSON schema prompt. The textual response is parsed with `lib/parse-json-block.ts` (fences-aware, tries successive balanced `{...}` candidates). If parsing fails, `confidence: 0.0` is returned with `parse_error: true` in the data. Each document type has its own prompt in `EXTRACTION_PROMPTS` — edit these to change what fields are extracted.

### Validation and form mapping (`lib/validation.ts`)

`validateCrossDocuments(docs, caseInfo)` runs pure checks on extracted data:
- Name consistency: extracts the "name" field per document type (keyed differently per type — `full_name` for passport, `applicant_name` for job offer, `employee_name` for others, `graduate_name` for diploma) and checks pairwise overlap.
- Passport expiry: compares `expiry_date` against today and against `permitEnd + 6 months` if `caseInfo.permitDuration` is set.
- Wage floor: hardcoded annual minimums per province (ON, BC, AB, QC, SK, MB, NS, NB) compared to `annual_salary` from the extracted offer doc, falling back to `caseInfo.offeredSalary` (manually entered on the case) if no offer doc has been extracted yet.

`generateFormFieldMapping(docs)` maps extracted fields to human-readable IRCC form field labels for the review UI. JOB_OFFER takes precedence over EMPLOYMENT_LETTER for employer/job fields.

Both functions are called server-side in `app/api/cases/[id]/validate/route.ts` and their results returned to the client as JSON.

### Checklist (`lib/checklist.ts`)

`generateChecklist(applicationType, province, nationality)` returns a flat list of `ChecklistItem` with required/optional flags. Rules are hardcoded — BC adds a WorkBC registration item, non-US nationalities add a biometrics reminder. The checklist is computed client-side in the case detail page (not stored in the DB) and compared against `document.documentType` values already uploaded.

### File storage

`lib/storage.ts` owns read/write/delete paths under `uploads/<caseId>/` (still local disk for MVP). Hard cap `MAX_UPLOAD_BYTES` (4 MB) is enforced server-side at upload time. Case deletion removes orphaned files (`removeCaseUploadDirectory`). Swap `storage` internals for cloud object storage in production.

There is no file-serving API route — files are never streamed to the browser.

### Case detail UI

`app/(dashboard)/cases/[id]/page.tsx` (server shell) wraps `components/cases/CaseDetailClient.tsx`. Tab bodies live under `components/cases/*Tab.tsx`; client refresh still uses `/api/cases/[id]` after uploads and extraction.

The sign-off flow requires `confirmed` checkbox, calls `POST /api/cases/[id]/signoff`, then offers a client-side JSON download built from current state — no server-side export route exists.
