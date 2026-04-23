-- ============================================================
-- SITEBASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Jobs
create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  trade text,
  status text default 'Active',
  client_name text,
  client_email text,
  value numeric default 0,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  text text not null,
  done boolean default false,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- Crew members
create table if not exists crew (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- Job <-> Crew assignments
create table if not exists job_crew (
  job_id uuid references jobs(id) on delete cascade,
  crew_id uuid references crew(id) on delete cascade,
  primary key (job_id, crew_id)
);

-- Transactions (financials)
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete set null,
  description text not null,
  amount numeric not null,
  type text not null,       -- 'income' | 'expense'
  category text,            -- Labor, Materials, Equipment, Client Payment, etc.
  date date default current_date,
  receipt_url text,
  created_at timestamptz default now()
);

-- Flags (issues)
create table if not exists flags (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  job_name text,
  flagged_by text,
  text text not null,
  resolved boolean default false,
  created_at timestamptz default now()
);

-- Client updates (messages + photos sent to client preview)
create table if not exists client_updates (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  message text,
  photo_url text,
  photo_name text,
  sent_by text,
  created_at timestamptz default now()
);

-- Materials per job
create table if not exists materials (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  name text not null,
  qty text,
  status text default 'needed',  -- needed | ordered | on_site
  created_at timestamptz default now()
);

-- Change orders
create table if not exists change_orders (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  description text not null,
  amount numeric default 0,
  status text default 'pending',  -- pending | approved | declined
  created_at timestamptz default now()
);

-- Client ratings
create table if not exists ratings (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  score integer check (score >= 1 and score <= 5),
  comment text,
  created_at timestamptz default now()
);

-- Crew schedule
create table if not exists schedules (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  crew_id uuid references crew(id) on delete cascade,
  date date not null,
  created_at timestamptz default now()
);

-- Subcontractor profiles
create table if not exists sub_profiles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  trade text,
  phone text,
  email text,
  bio text,
  availability text default 'available',  -- available | busy | unavailable
  created_at timestamptz default now()
);

-- Admins (multi-admin support)
create table if not exists admins (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  pin text not null,
  role text default 'admin',  -- admin | manager
  created_at timestamptz default now()
);

-- Photo log
create table if not exists photos (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  task_id uuid references tasks(id) on delete set null,
  url text not null,
  caption text,
  taken_by text,
  created_at timestamptz default now()
);

-- Invoices
create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  amount numeric not null,
  line_items jsonb default '[]',
  status text default 'draft',  -- draft | sent | paid
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- ── Seed default admin ───────────────────────────────────────
insert into admins (name, pin, role) values ('Owner', '1234', 'admin')
on conflict do nothing;

-- ── Storage bucket for photos ────────────────────────────────
-- After running this schema, go to Storage in your Supabase
-- dashboard and create a public bucket called: photos
