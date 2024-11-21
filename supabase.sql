-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Create Database Types
create type customer_type as enum ('VIP', 'Consumer', 'Business');

-- Create staff table first
create table public.staff (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  ready_timestamp timestamptz not null default now(),
  serving_customer uuid,
  serving_start_time timestamptz,
  on_lunch boolean default false,
  lunch_start_time timestamptz
);

-- Create customers table
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact text not null,
  notes text,
  customer_type customer_type not null,
  category text not null,
  timestamp timestamptz not null default now(),
  assigned_staff uuid references public.staff(id),
  served_timestamp timestamptz,
  appearance jsonb
);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.staff enable row level security;

-- Create policies
create policy "Enable all access" on public.customers for all using (true);
create policy "Enable all access" on public.staff for all using (true);

-- Enable realtime
alter publication supabase_realtime add table customers;
alter publication supabase_realtime add table staff;