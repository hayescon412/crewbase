# CrewBase

> Built because small construction crews were running jobs on group texts and gut feeling. CrewBase gives a 3–10 person crew the same coordination tools that enterprise platforms charge $500/month for — without the complexity that makes those platforms useless in the field.

A full-stack crew and job management app for small construction teams and subcontractors. Simple enough for a 60-year-old framer, powerful enough to run 5 active jobs at once.

## Why It Exists

Every big construction management platform — BuilderTrend, Procore, CoConstruct — is built for companies with office staff and project managers. They require every sub to create an account, every client to download an app, and every admin to sit through onboarding training.

The actual market — small residential crews doing $300k–$2M a year — doesn't have that. They have a group text, a whiteboard, and a lot of missed calls.

CrewBase is built for that crew.

## What It Does

**For the admin (owner/GC)**
- **Jobs** — Full job management: task checklists, crew assignments, materials tracking, change orders, photo log, invoice generation
- **Financials** — Transaction tracking with 6-month P&L chart, expense breakdown by category, per-job cost linking
- **Crew** — Roster management with roles, contact info, and per-job assignments
- **Schedule** — Weekly view of who's on which job each day
- **Flags** — Issues raised by crew or subs land here. Admin resolves them from the dashboard.
- **Subcontractors** — Profile directory with availability status
- **Admins** — Multi-admin support with individual 4-digit PINs and role levels

**For the crew**
- **Today view** — Crew picks their name, sees only their jobs for the day, checks off tasks. No login, no download.
- **Contractor link** — Unique URL per job for subs. Admin generates it, sub opens it in any browser.

**For the client**
- **Client preview link** — Shareable URL sent via text or email. Shows project progress, crew updates, photos, material selections, and pending change orders. Client approves or declines change orders directly from the link. No app, no account, no friction.

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, server components
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — PostgreSQL database + file storage
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) — Google Fonts

## Getting Started

**1. Clone the repo**

```bash
git clone https://github.com/hayescon412/crewbase.git
cd crewbase
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**4. Run the database schema**

Open `supabase/schema.sql` and run it in your Supabase SQL Editor. Then create a public storage bucket named `photos`.

**5. (Optional) Load demo data**

Run `supabase/seed.sql` in the SQL Editor to populate realistic sample jobs, crew, transactions, and client updates.

**6. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx              # Homepage
    today/                # Crew daily task view
    jobs/                 # Job list with task checklists
    admin/                # PIN-protected admin dashboard
    preview/[id]/         # Client-facing project preview
    sub/[jobId]/          # Subcontractor job view
  components/
    Navbar.tsx
    admin/
      AdminDashboard.tsx  # 7-tab admin layout
      FinancialsTab.tsx   # P&L chart + transactions
      JobsTab.tsx         # Full job management
      CrewTab.tsx
      ScheduleTab.tsx
      FlagsTab.tsx
      SubsTab.tsx
      AdminsTab.tsx
  lib/
    db.ts                 # All Supabase query functions
    types.ts              # TypeScript interfaces
    supabase/             # Supabase client helpers
supabase/
  schema.sql              # Full database schema
  seed.sql                # Demo data for screenshots/testing
```

## Security Notes

This project is in active development. Known limitations and their status:

- **Row Level Security** — RLS is enabled on all tables with open `allow_all` policies. Per-user policies are on the roadmap as proper auth is introduced.
- **Admin PIN** — Currently stored as plaintext in the `admins` table. Moving to a hashed value (bcrypt) and eventually replacing with Supabase Auth is a planned next step.
- **Environment variables** — Supabase URL and anon key are stored in `.env.local` which is gitignored. The anon key is intentionally public-facing; no `service_role` key is used client-side.
- **Client and contractor links** — These are unauthenticated by design. Security is through obscurity (UUID-based job IDs). Token-based expiry is on the roadmap.

## Roadmap

- [ ] Replace PIN auth with Supabase Auth (email/password or magic link)
- [ ] Move admin PIN to hashed storage
- [ ] Tighten RLS policies per user/role
- [ ] Token expiry on contractor and client links
- [ ] Weekly schedule templates ("copy last week")
- [ ] Per-crew permanent links (`/today/[name]`) — no name picker
- [ ] SMS notifications via Twilio — daily job summary to crew
- [ ] Multi-company GC coordination layer — shared project timeline across sub companies
- [ ] Public business page — shareable portfolio of completed work and ratings
- [ ] Offline support — tasks work without signal, sync on reconnect

## About

Built by [Hayes McNutt](https://github.com/hayescon412) — a builder who got tired of watching small crews run million-dollar jobs out of a group text.
