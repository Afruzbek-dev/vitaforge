-- VitaForge Chat System
-- chat_rooms va chat_messages tables

create table if not exists chat_rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  gym_id bigint references gyms(id) on delete cascade,
  type text not null default 'group' check (type in ('group', 'direct')),
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references chat_rooms(id) on delete cascade not null,
  sender_id uuid not null,
  content text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_chat_messages_room on chat_messages(room_id, created_at);
create index idx_chat_rooms_gym on chat_rooms(gym_id);

-- RLS
alter table chat_rooms enable row level security;
alter table chat_messages enable row level security;

create policy "Authenticated can read rooms" on chat_rooms for select using (auth.uid() is not null);
create policy "Authenticated can insert rooms" on chat_rooms for insert with check (auth.uid() is not null);
create policy "Authenticated can read messages" on chat_messages for select using (auth.uid() is not null);
create policy "Authenticated can insert messages" on chat_messages for insert with check (auth.uid() = sender_id);

-- Enable realtime
alter publication supabase_realtime add table chat_messages;
