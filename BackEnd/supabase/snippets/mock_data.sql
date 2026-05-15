begin;
set local row_security = off;

insert into public.diary_entries (user_id, youtube_id, title, thumbnail, memo, is_public, listened_at) values
  ('08f4183e-1c31-4f32-8d8b-c56e8c7a6bcf', 'BzY9p0PTHLM', 'IU(아이유) - 밤편지', 'https://i.ytimg.com/vi/BzY9p0PTHLM/mqdefault.jpg', '비 오는 날 듣기 좋은 노래', true, now() - interval '1 day'),
  ('08f4183e-1c31-4f32-8d8b-c56e8c7a6bcf', '3JZ4pnNtyxQ', 'NewJeans - Hype Boy', 'https://i.ytimg.com/vi/3JZ4pnNtyxQ/mqdefault.jpg', '요즘 계속 듣는 중', true, now() - interval '2 days'),
  ('08f4183e-1c31-4f32-8d8b-c56e8c7a6bcf', 'GgbkDXSWiuA', 'BTS - Spring Day', 'https://i.ytimg.com/vi/GgbkDXSWiuA/mqdefault.jpg', '봄이 오면 생각나는 곡', true, now() - interval '3 days'),
  ('08f4183e-1c31-4f32-8d8b-c56e8c7a6bcf', '0-q1KafFCLU', 'BLACKPINK - How You Like That', 'https://i.ytimg.com/vi/0-q1KafFCLU/mqdefault.jpg', null, true, now() - interval '4 days'),
  ('08f4183e-1c31-4f32-8d8b-c56e8c7a6bcf', 'nYh-n7EOtMA', 'aespa - Next Level', 'https://i.ytimg.com/vi/nYh-n7EOtMA/mqdefault.jpg', '에너지 충전할 때', true, now() - interval '5 days')
on conflict do nothing;

-- 감정 태그 연결
with entries as (
  select id, title from public.diary_entries
  where youtube_id in ('BzY9p0PTHLM', '3JZ4pnNtyxQ', 'GgbkDXSWiuA', '0-q1KafFCLU', 'nYh-n7EOtMA')
),
tags as (
  select id, name from public.emotion_tags where is_system = true
)
insert into public.diary_emotion_tags (diary_id, tag_id)
select e.id, t.id from entries e, tags t
where
  (e.title like '%밤편지%' and t.name in ('그리움', '평온')) or
  (e.title like '%Hype Boy%' and t.name in ('설렘', '행복')) or
  (e.title like '%Spring Day%' and t.name in ('그리움', '위로')) or
  (e.title like '%How You Like That%' and t.name in ('신남')) or
  (e.title like '%Next Level%' and t.name in ('신남', '행복'))
on conflict do nothing;

commit;
