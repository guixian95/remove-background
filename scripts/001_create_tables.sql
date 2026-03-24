-- Create profiles table to store user information
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  provider text, -- google, github, email
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create subscriptions table to store user subscription info
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_name text not null, -- free, pro, enterprise
  status text not null default 'active', -- active, cancelled, expired
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

-- RLS policies for subscriptions
create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions_insert_own" on public.subscriptions for insert with check (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.subscriptions for update using (auth.uid() = user_id);

-- Create payments table to store payment history
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  amount_cents integer not null,
  currency text not null default 'cny',
  status text not null, -- succeeded, pending, failed
  product_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on payments
alter table public.payments enable row level security;

-- RLS policies for payments
create policy "payments_select_own" on public.payments for select using (auth.uid() = user_id);
create policy "payments_insert_own" on public.payments for insert with check (auth.uid() = user_id);

-- Create usage table to track user usage quota
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_year text not null, -- format: YYYY-MM
  images_processed integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month_year)
);

-- Enable RLS on usage
alter table public.usage enable row level security;

-- RLS policies for usage
create policy "usage_select_own" on public.usage for select using (auth.uid() = user_id);
create policy "usage_insert_own" on public.usage for insert with check (auth.uid() = user_id);
create policy "usage_update_own" on public.usage for update using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_usage_user_id on public.usage(user_id);
create index if not exists idx_subscriptions_stripe_customer_id on public.subscriptions(stripe_customer_id);
