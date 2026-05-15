-- diary_entries
create table public.diary_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  youtube_id text not null,
  title text not null,
  thumbnail text not null,
  memo text,
  is_public boolean not null default false,
  listened_at timestamp with time zone not null,
  created_at timestamp with time zone default now() not null
);

alter table public.diary_entries enable row level security;

create policy "본인 기록 전체 접근"
  on public.diary_entries
  for all
  using (auth.uid() = user_id);

create policy "공개 기록 조회"
  on public.diary_entries
  for select
  using (is_public = true);

-- diary_emotion_tags
create table public.diary_emotion_tags (
  diary_id uuid references public.diary_entries(id) on delete cascade,
  tag_id uuid references public.emotion_tags(id) on delete cascade,
  primary key (diary_id, tag_id)
);

alter table public.diary_emotion_tags enable row level security;

create policy "diary 소유자 접근"
  on public.diary_emotion_tags
  for all
  using (
    exists (
      select 1 from public.diary_entries
      where id = diary_id and user_id = auth.uid()
    )
  );

create policy "공개 diary 태그 조회"
  on public.diary_emotion_tags
  for select
  using (
    exists (
      select 1 from public.diary_entries
      where id = diary_id and is_public = true
    )
  );

-- recommendations
create table public.recommendations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tag_ids uuid[] not null,
  youtube_id text not null,
  title text not null,
  created_at timestamp with time zone default now() not null
);

alter table public.recommendations enable row level security;

create policy "본인 추천 기록 접근"
  on public.recommendations
  for all
  using (auth.uid() = user_id);
