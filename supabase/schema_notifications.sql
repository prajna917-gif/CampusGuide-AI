-- ============================================================
-- NOTIFICATIONS TABLE + RLS
-- Run supabase/schema.sql first, then run this file in the Supabase SQL Editor.
-- schema_rooms.sql also creates this table; this file is safe to run afterward.
--
-- This migration intentionally uses idempotent table, index, and policy
-- statements so it can also repair projects where the table was never created.
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('student', 'faculty', 'admin')),
  title text not null,
  message text not null,
  type text default 'info'
    check (type in ('info', 'warning', 'success', 'error', 'room_change')),
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "notifications read own" on public.notifications;
create policy "notifications read own" on public.notifications
  for select using (
    user_id = auth.uid()
    or (
      user_id is null
      and (
        role is null
        or role = (select role from public.profiles where id = auth.uid())
      )
    )
  );

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "admin manage notifications" on public.notifications;
create policy "admin manage notifications" on public.notifications
  for all
  using (public.my_role() = 'admin')
  with check (public.my_role() = 'admin');

create index if not exists idx_notifications_user
  on public.notifications(user_id, is_read, created_at desc);

notify pgrst, 'reload schema';

-- ============================================================
-- SAMPLE SEED NOTIFICATIONS (optional, for testing)
-- Run this block to populate test data:
-- ============================================================
/*
insert into public.notifications (user_id, role, title, message, type)
values
  (null, 'student', 'Welcome to CampusGuide!', 'Navigate your campus easily using the indoor map.', 'info'),
  (null, 'faculty', 'Room Booking System Live', 'You can now request classroom changes directly from your dashboard.', 'success'),
  (null, null, 'Holiday Notice', 'College will remain closed on Oct 15th for a public holiday.', 'warning'),
  (null, 'student', 'Library Timing Update', 'Library is now open until 9 PM on weekdays.', 'info');
*/
