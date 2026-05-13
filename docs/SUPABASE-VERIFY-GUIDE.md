# Supabase 로컬 DB 적용 확인 가이드

마이그레이션 작업 후 반드시 아래 방법으로 적용 여부를 확인한다.

---

## Studio SQL Editor 접속

`http://127.0.0.1:54323` → **SQL Editor**

---

## 1. 테이블 확인

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

---

## 2. RLS 활성화 확인

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

`rowsecurity = true` 여야 정상.

---

## 3. RLS 정책 확인

```sql
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename;
```

---

## 4. 함수 확인

```sql
select routine_name, routine_type
from information_schema.routines
where routine_schema = 'public'
order by routine_name;
```

---

## 5. 트리거 확인

```sql
select trigger_name, event_object_schema, event_object_table, action_timing, event_manipulation
from information_schema.triggers
order by trigger_name;
```

> 트리거는 `auth.users`에 걸리므로 Studio Triggers 메뉴(public 스키마)에서는 보이지 않는다.
> 반드시 SQL Editor로 확인할 것.

---

## 6. 시드 데이터 확인

```sql
select * from public.emotion_tags;
```

---

## 마이그레이션 적용 이력 확인

```sql
select * from supabase_migrations.schema_migrations
order by version;
```

---

## CLI로 diff 확인 (변경사항 없어야 정상)

```bash
cd BackEnd
npx supabase db diff --local
```

출력: `No schema changes found` → 정상
