-- Enable needed extension (safe if already present)
create extension if not exists pgcrypto;

-- Timestamp trigger function (idempotent)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  organization_id uuid,
  first_name text,
  last_name text,
  email text,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Drop existing policies to avoid conflicts, then recreate
drop policy if exists "Profiles: users can view their own profile" on public.profiles;
drop policy if exists "Profiles: users can insert their own profile" on public.profiles;
drop policy if exists "Profiles: users can update their own profile" on public.profiles;
drop policy if exists "Profiles: users can delete their own profile" on public.profiles;

-- Policies for profiles
create policy "Profiles: users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Profiles: users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Profiles: users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Profiles: users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- Trigger
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- CAMPAIGNS
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  name text not null,
  objective text not null,
  status text not null default 'draft',
  budget numeric not null default 0,
  start_date date,
  end_date date,
  location_targeting jsonb not null default '{}'::jsonb,
  audience_targeting jsonb not null default '{}'::jsonb,
  ad_copy text,
  cta_button text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_campaigns_created_by on public.campaigns(created_by);
create index if not exists idx_campaigns_org on public.campaigns(organization_id);

alter table public.campaigns enable row level security;

-- Drop existing policies to avoid conflicts, then recreate
drop policy if exists "Campaigns: view own or org campaigns" on public.campaigns;
drop policy if exists "Campaigns: insert by creator within org" on public.campaigns;
drop policy if exists "Campaigns: update own or org campaigns" on public.campaigns;
drop policy if exists "Campaigns: delete own or org campaigns" on public.campaigns;

-- Policies for campaigns
create policy "Campaigns: view own or org campaigns"
  on public.campaigns for select
  using (
    created_by = auth.uid()
    or (
      organization_id is not null and organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Campaigns: insert by creator within org"
  on public.campaigns for insert
  with check (
    created_by = auth.uid()
    and (
      organization_id is null or organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Campaigns: update own or org campaigns"
  on public.campaigns for update
  using (
    created_by = auth.uid()
    or (
      organization_id is not null and organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  )
  with check (
    created_by = auth.uid()
    or (
      organization_id is not null and organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Campaigns: delete own or org campaigns"
  on public.campaigns for delete
  using (
    created_by = auth.uid()
    or (
      organization_id is not null and organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  );

-- Trigger
drop trigger if exists trg_campaigns_updated_at on public.campaigns;
create trigger trg_campaigns_updated_at
before update on public.campaigns
for each row execute function public.update_updated_at_column();

-- JOBS
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'open',
  organization_id uuid,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_created_by on public.jobs(created_by);
create index if not exists idx_jobs_org on public.jobs(organization_id);

alter table public.jobs enable row level security;

-- Drop existing policies to avoid conflicts, then recreate
drop policy if exists "Jobs: view own or org jobs" on public.jobs;
drop policy if exists "Jobs: insert by creator within org" on public.jobs;
drop policy if exists "Jobs: update own or org jobs" on public.jobs;
drop policy if exists "Jobs: delete own or org jobs" on public.jobs;

-- Policies for jobs
create policy "Jobs: view own or org jobs"
  on public.jobs for select
  using (
    created_by = auth.uid()
    or (
      organization_id is not null and organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Jobs: insert by creator within org"
  on public.jobs for insert
  with check (
    created_by = auth.uid()
    and (
      organization_id is null or organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Jobs: update own or org jobs"
  on public.jobs for update
  using (
    created_by = auth.uid()
    or (
      organization_id is not null and organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  )
  with check (
    created_by = auth.uid()
    or (
      organization_id is not null and organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Jobs: delete own or org jobs"
  on public.jobs for delete
  using (
    created_by = auth.uid()
    or (
      organization_id is not null and organization_id in (
        select organization_id from public.profiles where user_id = auth.uid()
      )
    )
  );

-- Trigger
drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at
before update on public.jobs
for each row execute function public.update_updated_at_column();

-- METRICS
create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null,
  date date not null default (now()::date),
  spend numeric not null default 0,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  leads bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_metrics_campaign on public.metrics(campaign_id);

alter table public.metrics enable row level security;

-- Drop existing policies to avoid conflicts, then recreate
drop policy if exists "Metrics: view via campaign access" on public.metrics;
drop policy if exists "Metrics: insert via campaign access" on public.metrics;
drop policy if exists "Metrics: update via campaign access" on public.metrics;
drop policy if exists "Metrics: delete via campaign access" on public.metrics;

-- Policies for metrics (access via related campaign ownership/org)
create policy "Metrics: view via campaign access"
  on public.metrics for select
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
        and (
          c.created_by = auth.uid()
          or (
            c.organization_id is not null and c.organization_id in (
              select organization_id from public.profiles where user_id = auth.uid()
            )
          )
        )
    )
  );

create policy "Metrics: insert via campaign access"
  on public.metrics for insert
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
        and (
          c.created_by = auth.uid()
          or (
            c.organization_id is not null and c.organization_id in (
              select organization_id from public.profiles where user_id = auth.uid()
            )
          )
        )
    )
  );

create policy "Metrics: update via campaign access"
  on public.metrics for update
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
        and (
          c.created_by = auth.uid()
          or (
            c.organization_id is not null and c.organization_id in (
              select organization_id from public.profiles where user_id = auth.uid()
            )
          )
        )
    )
  )
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
        and (
          c.created_by = auth.uid()
          or (
            c.organization_id is not null and c.organization_id in (
              select organization_id from public.profiles where user_id = auth.uid()
            )
          )
        )
    )
  );

create policy "Metrics: delete via campaign access"
  on public.metrics for delete
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
        and (
          c.created_by = auth.uid()
          or (
            c.organization_id is not null and c.organization_id in (
              select organization_id from public.profiles where user_id = auth.uid()
            )
          )
        )
    )
  );