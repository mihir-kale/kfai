create table if not exists public.alumni_dataset (
  id text primary key default 'default',
  ciphertext text not null,
  iv text not null,
  salt text not null,
  iterations integer not null default 250000,
  gzip boolean not null default true,
  version integer not null default 1,
  meta jsonb,
  updated_at timestamptz default now()
);

alter table public.alumni_dataset enable row level security;

create policy "Authenticated users can read alumni dataset"
  on public.alumni_dataset
  for select
  to authenticated
  using (true);
