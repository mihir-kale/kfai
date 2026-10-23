# UBP Alumni Outreach

A small internal tool for **Workstream B — Employer & Industry Shift**. It lets a team filter
UNC Kenan-Flagler alumni by industry, employer, class year, and position type, then draft and
copy outreach emails built around the Workstream B interview guide.

Static site. No backend, no analytics, no third-party calls. The alumni dataset ships encrypted
inside the app and only decrypts in the browser after the team passphrase is entered.

---

## Quick start

```bash
npm install
npm run demo:data   # writes public/dataset.enc.json with 112 sample records
npm run dev
```

Demo passphrase: `ubp-demo`. All demo addresses use `example.com` and are not real.

---

## Using the real export

1. Export the **UBP Alumni Job Acceptances / Current Intern Acceptances** tab of the networking
   database as CSV (File → Save As → CSV, or download from Google Sheets).
   The overview tab alone contains no rows — the app will tell you if it parses too few records.

2. Encrypt it and write the dataset the app loads:

   ```bash
   npm run encrypt -- "Alumni Outreach SOT.csv"
   ```

   The script prompts for a passphrase (input is hidden), then prints what it detected:
   header row, matched columns, record count, email count, year range, and industry mix.

   ```bash
   # non-interactive / CI
   KFAI_PASSPHRASE='…' npm run encrypt -- export.csv --out public/dataset.enc.json
   ```

3. Build and verify:

   ```bash
   npm run build && npm run preview
   ```

4. Commit `public/dataset.enc.json` and push. Share the passphrase out of band (Signal, in
   person) — never in the repo, a GitHub issue, or the group chat with the link.

### What the parser handles

- Any column order. It looks for `Name`, `Class Year`, `Employer`, `Position Type`, `Title`,
  `Email`, `Location` (plus common variants like "Personal Email", "Company", "Job Title").
- Multiple sections in one sheet (Current Interns / Alumni / Post-Grad), including repeated
  header rows.
- Quoted cells, embedded commas and newlines, BOM, trailing blank rows.
- Duplicate rows are dropped; a stable ID is derived from name + employer + email, so outreach
  status survives re-imports.

`Industry` is derived from employer and title using a keyword map in
`shared/normalize.mjs` (IB, consulting, sales, asset/wealth, PE/VC, corporate finance,
accounting, marketing, product, operations, real estate, healthcare). If the export has its own
Industry column, that wins. To fix a misclassification, add a pattern to `EMPLOYER_RULES` or
`TITLE_RULES` and re-run `npm run encrypt`.

---

## Drafting

Eight templates, each written against the Workstream B guide rather than generic networking
language:

| Template | Use |
| --- | --- |
| Initial outreach | Full ask, three realm-specific questions, 20-minute request |
| Short ask | ~90 words for cold or high-volume sends |
| Follow-up | 5–7 days later with one new specific angle |
| Scheduling | Three proposed windows, low prep |
| Prep note | Sends the interview questions ahead of time |
| Thank you | Recap plus the curriculum question |
| Ask for a referral | For the wrong person on the right team |
| Close the loop | Last note, easy out |

Drafts adapt to the alumnus's realm. An investment banker gets asked about comps, models, and
pitchbooks; a consultant about research, benchmarking, and first-draft decks; a salesperson
about prospecting research and discovery prep. **New angle** cycles three openings, asks, and
closers so five teammates don't send identical emails.

Edits are saved per alumnus, template, and angle. **Reset** restores the generated draft.
Fill in your details under **Signing as** once — they are stored in this browser only.

The **Interview guide** button opens the full Workstream B guide, plus realm-specific probes
for whoever is selected, with a copy button.

---

## Tracking outreach

Each alumnus has a status: not contacted / drafted / sent / replied / scheduled / interviewed /
not a fit. Statuses and draft edits live in `localStorage`, so each teammate has their own
private log — there is no shared server.

**Export my log** downloads a CSV (`name, email, employer, title, class year, industry, status,
updated`) that you can merge with the team's master sheet.

Shortcuts: `/` focuses search, `Esc` closes the draft panel.

---

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`.

1. Create the repo and push.
2. Settings → Pages → Source: **GitHub Actions**.
3. Run the workflow (or push to `main`).
4. Open the Pages URL and enter the team passphrase.

The build is fully static and uses relative asset paths, so it works from a project URL
(`user.github.io/repo/`) without configuration.

---

## Security model — read this before sharing the link

- Data is encrypted at build time with **AES-256-GCM**, key derived with **PBKDF2-SHA256**
  (250,000 iterations). Only the ciphertext is committed.
- Anyone with the link **and** the passphrase can read all records. There are no accounts, no
  per-user permissions, and no audit log. Treat the passphrase as the whole security boundary
  and use a long random one.
- `noindex, nofollow` is set, but a public Pages URL is still public. Don't post it publicly.
- To rotate access: re-run `npm run encrypt` with a new passphrase and push. Old clones keep
  working until they refetch.
- The dataset is not in the git history in plaintext, but the original CSV may be in your
  workbook/Drive — restrict that separately.

If you need real access control, put this behind Cloudflare Access or host it on an internal
server with SSO instead of public Pages; the app itself needs no changes.

---

## Project layout

```
shared/normalize.mjs      CSV parsing, header detection, industry derivation
scripts/encrypt.mjs       CLI: CSV -> encrypted dataset
scripts/make-demo.mjs     CLI: generate demo dataset
src/lib/crypto.ts         Browser decryption (WebCrypto + DecompressionStream)
src/lib/drafts.ts         Realm profiles + all eight email templates
src/lib/store.ts          localStorage: sender, statuses, drafts, CSV export
src/components/           Unlock gate, filter rail, table, draft panel, guide drawer
public/dataset.enc.json   Encrypted dataset (committed on purpose)
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | TypeScript check |
| `npm run encrypt -- <csv>` | Encrypt an export into `public/dataset.enc.json` |
| `npm run demo:data` | Regenerate the 112-record demo dataset |

---

## Setup with Supabase Auth (password-gated)

1. Create a Supabase project at https://supabase.com
2. Run migrations: `npx supabase db push` or paste the SQL from `supabase/migrations/` into SQL Editor
3. Create users in Authentication → Users (email + password)
4. Get your project URL and anon key from Project Settings → API
5. Add to `.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Build and deploy. Only authenticated users can access.
