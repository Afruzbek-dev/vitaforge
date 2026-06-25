-- VitaForge Payments
-- Supabase SQL Editor'da run qiling

create table if not exists payments (
  id bigint generated always as identity primary key,
  name text not null,
  plan text not null check (plan in ('starter', 'growth', 'premium')),
  receipt_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

alter table payments enable row level security;

create policy "Anyone can insert" on payments for insert with check (true);
create policy "Anyone can read" on payments for select using (true);
create policy "Anyone can update" on payments for update using (true);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', true) on conflict do nothing;
create policy "Upload receipts" on storage.objects for insert with check (bucket_id = 'receipts');
create policy "Read receipts" on storage.objects for select using (bucket_id = 'receipts');
