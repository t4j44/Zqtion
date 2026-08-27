create extension if not exists pgcrypto;

create table if not exists public.website_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 3 and 160),
  company text,
  service text not null,
  details text not null check (char_length(details) between 30 and 4000),
  budget text,
  source text not null default 'zqtion.com',
  user_agent text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'qualified', 'closed'))
);

alter table public.website_inquiries enable row level security;

-- No public policies are created. The server-only service role inserts inquiries.
-- Read and update access should remain limited to authenticated internal tooling.

create index if not exists website_inquiries_created_at_idx
  on public.website_inquiries (created_at desc);
