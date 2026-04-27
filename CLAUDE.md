# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Node.js must be on PATH — see note below)
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm start            # Run production build

# Database
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Sync schema to dev.db without migrations (dev only)
```

> Node.js is not system-installed. During this session it was bootstrapped from `/tmp/node-v20.18.1-darwin-x64/bin/`. Prefix commands with `export PATH="/tmp/node-v20.18.1-darwin-x64/bin:$PATH"` if `node`/`npm`/`npx` are not found. Running `setup.sh` installs Node.js permanently via Homebrew.

There are no tests and no lint script configured.

After any change to `prisma/schema.prisma`, run `db:generate` then `db:push`.

## Architecture

### Request flow

Every authenticated page fetches data client-side via `fetch('/api/...')`. There is no server-side data fetching in page components — the `(dashboard)/layout.tsx` only checks the session server-side to gate the route group; actual data loading happens in Client Components with `useEffect`.

### Auth

`lib/auth.ts` configures NextAuth with a credentials provider and JWT sessions (no database session table). The session callback attaches `id` and `firmName` to the JWT/session. `getServerSession(authOptions)` is called at the top of every API route to authenticate. `types/next-auth.d.ts` extends the default Session type to include these fields.

### Database

Single SQLite file (`dev.db`) managed by Prisma. Three models: `User → Case → Document`. `Document.extractedData` stores Claude's JSON output as a serialized string — parse with `JSON.parse()` before use. `Document.status` drives the UI state machine: `UPLOADED → PROCESSING → EXTRACTED | ERROR`. `Case.status` follows: `DRAFT → DOCUMENTS_PENDING → REVIEW → SIGNED_OFF`.

### AI extraction pipeline (`lib/claude.ts`)

`extractDocumentData(buffer, mimeType, documentType)` sends a file to `claude-sonnet-4-6` as either a `document` block (PDF) or `image` block (JPEG/PNG/WebP) alongside a strict JSON schema prompt. The response is regex-matched for a JSON object and parsed. If parsing fails, `confidence: 0.0` is returned with `parse_error: true` in the data. Each document type has its own prompt in `EXTRACTION_PROMPTS` — edit these to change what fields are extracted.

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

Uploaded files are written to `uploads/<caseId>/<timestamp>_<random>.<ext>` on the local filesystem (not in `public/`). The extract route reads them back with `readFileSync`. There is no file-serving API route — files are never streamed to the browser. For production, replace with cloud object storage and update both `app/api/upload/route.ts` and `app/api/documents/[id]/extract/route.ts`.

### Case detail page (`app/(dashboard)/cases/[id]/page.tsx`)

The largest file (~810 lines). Fully client-side. Manages all tab state, upload state, per-document extraction loading state (`Record<string, boolean>`), and validation/form-mapping results locally. The sign-off flow requires `confirmed` checkbox, calls `POST /api/cases/[id]/signoff`, then offers a client-side JSON download built from current state — no server-side export route exists.
