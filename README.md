# Sitebase

A crew and job management app built for small construction teams and subcontractors. Simple enough for all ages, powerful enough for everyday use on the job site.

## What It Does

- **Jobs** — Track every active job with task checklists, crew assignments, and progress bars
- **Today** — Crew picks their name and sees only their tasks for the day. No login required.
- **Admin** — PIN-protected dashboard with financials, job management, crew roster, and flagged issues
- **Client Preview** — Shareable link sent via email or text. Clients see project updates, photos, and 3D renderings in their browser. No app download needed.
- **Contractor Link** — One-time job link for subcontractors. Admin can revoke at any time.
- **Issue Flagging** — Crew or subs flag problems on the job. Admin sees and resolves them from the dashboard.

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Auth and database (in progress)

## Getting Started

**1. Clone the repo**

```bash
git clone https://github.com/YOUR_USERNAME/sitebase.git
cd sitebase
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**4. Run the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx          # Homepage
    today/            # Crew daily task view
    jobs/             # Job list with checklists
    admin/            # PIN-protected admin dashboard
    preview/[id]/     # Client-facing project preview
    sub/[jobId]/      # Subcontractor job link
  components/
    Navbar.tsx
  hooks/
    useTasks.ts       # Shared task hook (localStorage)
  lib/
    data.ts           # Job and crew data
    supabase/         # Supabase client helpers
```

## Admin Access

Default PIN: `1234`

To change it, update line 5 in `src/app/admin/page.tsx`.

## Roadmap

- [ ] Connect Supabase — real database for jobs, tasks, crew, and updates
- [ ] Financial input forms — add transactions, track per-job costs
- [ ] Change order approvals — client taps Approve/Decline on scope changes
- [ ] Invoice generation — auto-generate when final task is checked off
- [ ] Daily summary — end-of-day text to admin with job progress
- [ ] Offline support — tasks work without signal, sync when back online
