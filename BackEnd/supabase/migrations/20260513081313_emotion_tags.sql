create table public.emotion_tags (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  is_system boolean not null default false,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now() not null,
  constraint system_tag_no_user check (
    (is_system = true and user_id is null) or
    (is_system = false and user_id is not null)
  )
);

alter table public.emotion_tags enable row level security;

create policy "시스템 태그 누구나 읽기"
  on public.emotion_tags
  for select
  using (is_system = true);

create policy "본인 커스텀 태그 읽기/쓰기"
  on public.emotion_tags
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
