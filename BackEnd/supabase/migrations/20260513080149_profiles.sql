create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default now() not null
);

alter table public.profiles enable row level security;

create policy "본인 프로필 읽기/쓰기"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "타인 프로필 읽기"
  on public.profiles
  for select
  using (true);

-- 신규 회원 가입 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
