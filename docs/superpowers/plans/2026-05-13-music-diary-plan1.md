# 음악 다이어리 Plan 1 — Foundation + Core Diary

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 → 감정 태그 선택 → YouTube 검색 → 다이어리 기록 저장/조회까지 동작하는 MVP를 만든다.

**Architecture:** Next.js App Router + Supabase(Auth/Postgres) + YouTube Data API v3. YouTube API 호출은 서버 사이드 API Route에서만 수행하며, Supabase CLI + Docker로 로컬 개발 환경을 구성한다.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Supabase JS v2, @supabase/ssr, Jest, React Testing Library

---

## 파일 구조 (생성/수정 대상)

```
music-diary/                          ← Next.js 루트
├── .env.local                        ← 환경변수 (gitignore)
├── middleware.ts                     ← 인증 미들웨어
├── supabase/
│   ├── config.toml
│   └── migrations/
│       ├── 20260513000001_profiles.sql
│       ├── 20260513000002_emotion_tags.sql
│       └── 20260513000003_diary.sql
├── src/
│   ├── types/
│   │   └── database.types.ts         ← supabase gen types 결과
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ← 브라우저 클라이언트
│   │   │   └── server.ts             ← 서버 클라이언트
│   │   └── youtube.ts                ← YouTube API 유틸
│   ├── components/
│   │   ├── EmotionTagSelector.tsx    ← 감정 태그 선택 UI
│   │   ├── EmotionTagSelector.test.tsx
│   │   ├── DiaryCard.tsx             ← 타임라인 카드
│   │   ├── DiaryCard.test.tsx
│   │   └── YoutubeSearchPanel.tsx    ← YouTube 검색 UI
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx                  ← 랜딩/로그인
│       ├── error.tsx
│       ├── auth/
│       │   └── callback/route.ts     ← OAuth 콜백
│       ├── api/
│       │   └── youtube/
│       │       └── search/
│       │           ├── route.ts      ← YouTube 검색 API Route
│       │           └── route.test.ts
│       └── (protected)/
│           ├── layout.tsx            ← 인증 체크 레이아웃
│           └── diary/
│               ├── page.tsx          ← 타임라인
│               ├── new/
│               │   └── page.tsx      ← 새 기록 작성
│               └── [id]/
│                   └── page.tsx      ← 상세 보기
```

---

## Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `music-diary/` (프로젝트 루트)
- Create: `music-diary/package.json` (자동 생성)
- Create: `music-diary/.env.local`

- [ ] **Step 1: Next.js 앱 생성**

```bash
npx create-next-app@latest music-diary \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint
cd music-diary
```

- [ ] **Step 2: 필수 패키지 설치**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D supabase jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom ts-jest @types/jest
```

- [ ] **Step 3: Jest 설정 파일 생성**

`jest.config.ts` 파일 생성:

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

`jest.setup.ts` 파일 생성:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: package.json에 test 스크립트 추가**

`package.json`의 scripts에 추가:

```json
"test": "jest",
"test:watch": "jest --watch",
"types:gen": "supabase gen types --local > src/types/database.types.ts"
```

- [ ] **Step 5: .env.local 생성**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase start 후 출력되는 anon key>
SUPABASE_SERVICE_ROLE_KEY=<supabase start 후 출력되는 service_role key>
YOUTUBE_API_KEY=<YouTube Data API v3 키>
```

- [ ] **Step 6: .gitignore에 .env.local 확인**

`.gitignore`에 `.env.local`이 포함되어 있는지 확인 (create-next-app이 자동 추가함).

- [ ] **Step 7: 커밋**

```bash
git init
git add -A
git commit -m "chore: initialize Next.js project with Supabase and Jest"
```

---

## Task 2: Supabase CLI 로컬 환경 구성

**Files:**
- Create: `supabase/config.toml` (자동 생성)

- [ ] **Step 1: Supabase 초기화**

```bash
npx supabase init
```

- [ ] **Step 2: Docker Desktop 실행 확인**

Docker Desktop이 실행 중인지 확인 후:

```bash
npx supabase start
```

성공 시 출력 예시:
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-...
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] **Step 3: .env.local에 출력된 키 입력**

출력된 `anon key`와 `service_role key`를 `.env.local`에 복사.

- [ ] **Step 4: 커밋**

```bash
git add supabase/config.toml
git commit -m "chore: add Supabase CLI config"
```

---

## Task 3: DB 마이그레이션 — profiles & auth trigger

**Files:**
- Create: `supabase/migrations/20260513000001_profiles.sql`

- [ ] **Step 1: 마이그레이션 파일 생성**

```bash
npx supabase migration new profiles
```

- [ ] **Step 2: 마이그레이션 SQL 작성**

`supabase/migrations/20260513000001_profiles.sql`:

```sql
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
```

- [ ] **Step 3: 마이그레이션 로컬 적용**

```bash
npx supabase db push --local
```

Expected: "Applying migration 20260513000001_profiles.sql... done"

- [ ] **Step 4: 커밋**

```bash
git add supabase/migrations/
git commit -m "feat: add profiles table and auth trigger migration"
```

---

## Task 4: DB 마이그레이션 — emotion_tags & seed

**Files:**
- Create: `supabase/migrations/20260513000002_emotion_tags.sql`
- Create: `supabase/seed.sql`

- [ ] **Step 1: 마이그레이션 파일 생성**

```bash
npx supabase migration new emotion_tags
```

- [ ] **Step 2: 마이그레이션 SQL 작성**

`supabase/migrations/20260513000002_emotion_tags.sql`:

```sql
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
```

- [ ] **Step 3: seed.sql 작성**

`supabase/seed.sql`:

```sql
insert into public.emotion_tags (name, is_system, user_id) values
  ('행복', true, null),
  ('설렘', true, null),
  ('평온', true, null),
  ('우울', true, null),
  ('그리움', true, null),
  ('신남', true, null),
  ('외로움', true, null),
  ('위로', true, null);
```

- [ ] **Step 4: 마이그레이션 + 시드 적용**

```bash
npx supabase db push --local
npx supabase db seed
```

- [ ] **Step 5: 커밋**

```bash
git add supabase/migrations/ supabase/seed.sql
git commit -m "feat: add emotion_tags table and system seed data"
```

---

## Task 5: DB 마이그레이션 — diary_entries, diary_emotion_tags, recommendations + RLS

**Files:**
- Create: `supabase/migrations/20260513000003_diary.sql`

- [ ] **Step 1: 마이그레이션 파일 생성**

```bash
npx supabase migration new diary
```

- [ ] **Step 2: 마이그레이션 SQL 작성**

`supabase/migrations/20260513000003_diary.sql`:

```sql
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

create policy "본인 다이어리 전체 접근"
  on public.diary_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "타인 공개 다이어리 읽기"
  on public.diary_entries
  for select
  using (is_public = true);

-- 다이어리 ↔ 감정태그 (다대다)
create table public.diary_emotion_tags (
  diary_id uuid references public.diary_entries(id) on delete cascade,
  tag_id uuid references public.emotion_tags(id) on delete cascade,
  primary key (diary_id, tag_id)
);

alter table public.diary_emotion_tags enable row level security;

create policy "본인 다이어리 태그 전체 접근"
  on public.diary_emotion_tags
  for all
  using (
    exists (
      select 1 from public.diary_entries
      where id = diary_id and user_id = auth.uid()
    )
  );

create policy "공개 다이어리 태그 읽기"
  on public.diary_emotion_tags
  for select
  using (
    exists (
      select 1 from public.diary_entries
      where id = diary_id and is_public = true
    )
  );

-- 추천 기록
create table public.recommendations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tag_ids uuid[] not null,
  youtube_id text not null,
  title text not null,
  created_at timestamp with time zone default now() not null
);

alter table public.recommendations enable row level security;

create policy "본인 추천 기록 전체 접근"
  on public.recommendations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- [ ] **Step 3: 마이그레이션 적용**

```bash
npx supabase db push --local
```

Expected: "Applying migration 20260513000003_diary.sql... done"

- [ ] **Step 4: 커밋**

```bash
git add supabase/migrations/
git commit -m "feat: add diary_entries, diary_emotion_tags, recommendations migrations with RLS"
```

---

## Task 6: TypeScript 타입 생성 & Supabase 클라이언트 설정

**Files:**
- Create: `src/types/database.types.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: TypeScript 타입 자동 생성**

```bash
npm run types:gen
```

`src/types/database.types.ts`가 생성됨. (Supabase가 스키마 기반으로 자동 생성)

- [ ] **Step 2: 브라우저 클라이언트 생성**

`src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: 서버 클라이언트 생성**

`src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 4: 커밋**

```bash
git add src/types/ src/lib/
git commit -m "feat: add Supabase client setup and TypeScript types"
```

---

## Task 7: 인증 미들웨어 & Auth 콜백

**Files:**
- Create: `middleware.ts`
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: 미들웨어 작성**

`middleware.ts` (프로젝트 루트):

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = request.nextUrl.pathname.startsWith('/diary') ||
    request.nextUrl.pathname.startsWith('/explore')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 2: OAuth 콜백 라우트 작성**

`src/app/auth/callback/route.ts`:

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/diary`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
```

- [ ] **Step 3: 커밋**

```bash
git add middleware.ts src/app/auth/
git commit -m "feat: add auth middleware and OAuth callback route"
```

---

## Task 8: 랜딩/로그인 페이지

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: 루트 레이아웃 수정**

`src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '음악 다이어리',
  description: '감정에 맞는 음악을 기록하세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: 랜딩 페이지 작성**

`src/app/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/diary')

  async function signInWithGoogle() {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (data.url) redirect(data.url)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">음악 다이어리</h1>
        <p className="text-gray-400 text-lg">오늘의 감정에 맞는 음악을 기록하세요</p>
      </div>
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex items-center gap-3 bg-white text-gray-900 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
        >
          Google로 시작하기
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 3: .env.local에 SITE_URL 추가**

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 4: Supabase 대시보드에서 Google OAuth 설정**

Supabase 로컬 Studio (`http://127.0.0.1:54323`) → Authentication → Providers → Google 활성화  
Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성 후 Client ID, Client Secret 입력  
Redirect URL: `http://127.0.0.1:54321/auth/v1/callback`

- [ ] **Step 5: 커밋**

```bash
git add src/app/
git commit -m "feat: add landing/login page with Google OAuth"
```

---

## Task 9: Protected Layout & 다이어리 타임라인 뼈대

**Files:**
- Create: `src/app/(protected)/layout.tsx`
- Create: `src/app/(protected)/diary/page.tsx`

- [ ] **Step 1: Protected 레이아웃 작성**

`src/app/(protected)/layout.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex justify-between items-center py-4 mb-6 border-b border-gray-800">
        <Link href="/diary" className="text-xl font-bold">음악 다이어리</Link>
        <nav className="flex items-center gap-4">
          <Link href="/explore" className="text-gray-400 hover:text-white text-sm">탐색</Link>
          <Link href="/diary/new" className="bg-indigo-600 hover:bg-indigo-500 text-sm px-4 py-2 rounded-full">
            + 기록
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-gray-400 hover:text-white text-sm">로그아웃</button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: 다이어리 타임라인 페이지 뼈대**

`src/app/(protected)/diary/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import DiaryCard from '@/components/DiaryCard'
import Link from 'next/link'

export default async function DiaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from('diary_entries')
    .select(`
      *,
      diary_emotion_tags (
        emotion_tags ( id, name )
      )
    `)
    .eq('user_id', user!.id)
    .order('listened_at', { ascending: false })

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg mb-4">아직 기록이 없어요</p>
        <Link href="/diary/new" className="text-indigo-400 hover:text-indigo-300">
          첫 번째 음악을 기록해보세요 →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => (
        <DiaryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/\(protected\)/
git commit -m "feat: add protected layout and diary timeline page"
```

---

## Task 10: EmotionTagSelector 컴포넌트 (TDD)

**Files:**
- Create: `src/components/EmotionTagSelector.tsx`
- Create: `src/components/EmotionTagSelector.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/components/EmotionTagSelector.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import EmotionTagSelector from './EmotionTagSelector'

const mockTags = [
  { id: '1', name: '행복', is_system: true, user_id: null, created_at: '' },
  { id: '2', name: '우울', is_system: true, user_id: null, created_at: '' },
  { id: '3', name: '설렘', is_system: true, user_id: null, created_at: '' },
]

describe('EmotionTagSelector', () => {
  it('태그 목록을 렌더링한다', () => {
    render(<EmotionTagSelector tags={mockTags} selected={[]} onChange={() => {}} />)
    expect(screen.getByText('행복')).toBeInTheDocument()
    expect(screen.getByText('우울')).toBeInTheDocument()
    expect(screen.getByText('설렘')).toBeInTheDocument()
  })

  it('태그 클릭 시 onChange가 선택된 태그 id 배열로 호출된다', () => {
    const onChange = jest.fn()
    render(<EmotionTagSelector tags={mockTags} selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('행복'))
    expect(onChange).toHaveBeenCalledWith(['1'])
  })

  it('이미 선택된 태그 클릭 시 선택 해제된다', () => {
    const onChange = jest.fn()
    render(<EmotionTagSelector tags={mockTags} selected={['1']} onChange={onChange} />)
    fireEvent.click(screen.getByText('행복'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('최대 3개까지만 선택 가능하다', () => {
    const onChange = jest.fn()
    render(<EmotionTagSelector tags={mockTags} selected={['1', '2', '3']} onChange={onChange} />)
    const tags = [
      { id: '4', name: '평온', is_system: true, user_id: null, created_at: '' },
    ]
    render(<EmotionTagSelector tags={[...mockTags, ...tags]} selected={['1', '2', '3']} onChange={onChange} />)
    fireEvent.click(screen.getAllByText('평온')[0])
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- EmotionTagSelector
```

Expected: FAIL — "Cannot find module './EmotionTagSelector'"

- [ ] **Step 3: 컴포넌트 구현**

`src/components/EmotionTagSelector.tsx`:

```tsx
import type { Database } from '@/types/database.types'

type EmotionTag = Database['public']['Tables']['emotion_tags']['Row']

interface Props {
  tags: EmotionTag[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function EmotionTagSelector({ tags, selected, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      if (selected.length >= 3) return
      onChange([...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              isSelected
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-600 text-gray-400 hover:border-gray-400'
            }`}
          >
            {tag.name}
          </button>
        )
      })}
      {selected.length >= 3 && (
        <p className="text-xs text-gray-500 w-full mt-1">최대 3개까지 선택 가능합니다</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- EmotionTagSelector
```

Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/components/EmotionTagSelector.tsx src/components/EmotionTagSelector.test.tsx
git commit -m "feat: add EmotionTagSelector component with tests"
```

---

## Task 11: YouTube 검색 API Route (TDD)

**Files:**
- Create: `src/lib/youtube.ts`
- Create: `src/app/api/youtube/search/route.ts`
- Create: `src/app/api/youtube/search/route.test.ts`

- [ ] **Step 1: YouTube 유틸 작성**

`src/lib/youtube.ts`:

```ts
export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
}

export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set')

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'video')
  url.searchParams.set('videoCategoryId', '10') // Music
  url.searchParams.set('maxResults', '10')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) {
    if (res.status === 403) throw new Error('QUOTA_EXCEEDED')
    throw new Error('YOUTUBE_API_ERROR')
  }

  const data = await res.json()
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
  }))
}
```

- [ ] **Step 2: 실패하는 테스트 작성**

`src/app/api/youtube/search/route.test.ts`:

```ts
import { GET } from './route'
import * as youtube from '@/lib/youtube'

jest.mock('@/lib/youtube')

const mockVideos = [
  { id: 'abc123', title: '테스트 곡', thumbnail: 'https://img.jpg', channelTitle: '가수' },
]

describe('GET /api/youtube/search', () => {
  it('query 파라미터로 YouTube 검색 결과를 반환한다', async () => {
    jest.spyOn(youtube, 'searchYouTube').mockResolvedValue(mockVideos)
    const req = new Request('http://localhost/api/youtube/search?q=행복한+노래')
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual(mockVideos)
  })

  it('q 파라미터가 없으면 400을 반환한다', async () => {
    const req = new Request('http://localhost/api/youtube/search')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('할당량 초과 시 429를 반환한다', async () => {
    jest.spyOn(youtube, 'searchYouTube').mockRejectedValue(new Error('QUOTA_EXCEEDED'))
    const req = new Request('http://localhost/api/youtube/search?q=test')
    const res = await GET(req)
    expect(res.status).toBe(429)
  })
})
```

- [ ] **Step 3: 테스트 실패 확인**

```bash
npm test -- route.test
```

Expected: FAIL — "Cannot find module './route'"

- [ ] **Step 4: API Route 구현**

`src/app/api/youtube/search/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { searchYouTube } from '@/lib/youtube'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ error: '검색어를 입력해주세요' }, { status: 400 })
  }

  try {
    const videos = await searchYouTube(q)
    return NextResponse.json(videos)
  } catch (error) {
    if (error instanceof Error && error.message === 'QUOTA_EXCEEDED') {
      return NextResponse.json({ error: '잠시 후 다시 시도해주세요' }, { status: 429 })
    }
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다' }, { status: 500 })
  }
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
npm test -- route.test
```

Expected: PASS (3 tests)

- [ ] **Step 6: 커밋**

```bash
git add src/lib/youtube.ts src/app/api/youtube/
git commit -m "feat: add YouTube search API route with tests"
```

---

## Task 12: DiaryCard 컴포넌트 (TDD)

**Files:**
- Create: `src/components/DiaryCard.tsx`
- Create: `src/components/DiaryCard.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/components/DiaryCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import DiaryCard from './DiaryCard'

const mockEntry = {
  id: 'entry-1',
  user_id: 'user-1',
  youtube_id: 'abc123',
  title: '봄날 - BTS',
  thumbnail: 'https://img.jpg',
  memo: '오늘 기분이 좋았다',
  is_public: false,
  listened_at: '2026-05-13T10:00:00Z',
  created_at: '2026-05-13T10:00:00Z',
  diary_emotion_tags: [
    { emotion_tags: { id: '1', name: '행복' } },
  ],
}

describe('DiaryCard', () => {
  it('곡 제목을 렌더링한다', () => {
    render(<DiaryCard entry={mockEntry} />)
    expect(screen.getByText('봄날 - BTS')).toBeInTheDocument()
  })

  it('감정 태그를 렌더링한다', () => {
    render(<DiaryCard entry={mockEntry} />)
    expect(screen.getByText('행복')).toBeInTheDocument()
  })

  it('메모를 렌더링한다', () => {
    render(<DiaryCard entry={mockEntry} />)
    expect(screen.getByText('오늘 기분이 좋았다')).toBeInTheDocument()
  })

  it('비공개 상태를 표시한다', () => {
    render(<DiaryCard entry={mockEntry} />)
    expect(screen.getByText('비공개')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test -- DiaryCard
```

Expected: FAIL

- [ ] **Step 3: 컴포넌트 구현**

`src/components/DiaryCard.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'

interface DiaryEntryWithTags {
  id: string
  youtube_id: string
  title: string
  thumbnail: string
  memo: string | null
  is_public: boolean
  listened_at: string
  diary_emotion_tags: {
    emotion_tags: { id: string; name: string } | null
  }[]
}

interface Props {
  entry: DiaryEntryWithTags
}

export default function DiaryCard({ entry }: Props) {
  const tags = entry.diary_emotion_tags
    .map((det) => det.emotion_tags)
    .filter(Boolean)

  const date = new Date(entry.listened_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <Link href={`/diary/${entry.id}`}>
      <article className="flex gap-4 p-4 rounded-xl bg-gray-900 hover:bg-gray-800 transition">
        <Image
          src={entry.thumbnail}
          alt={entry.title}
          width={80}
          height={60}
          className="rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate">{entry.title}</h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {entry.is_public ? '공개' : '비공개'}
            </span>
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {tags.map((tag) => (
              <span key={tag!.id} className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                {tag!.name}
              </span>
            ))}
          </div>
          {entry.memo && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{entry.memo}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">{date}</p>
        </div>
      </article>
    </Link>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- DiaryCard
```

Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/components/DiaryCard.tsx src/components/DiaryCard.test.tsx
git commit -m "feat: add DiaryCard component with tests"
```

---

## Task 13: 새 다이어리 기록 작성 페이지

**Files:**
- Create: `src/components/YoutubeSearchPanel.tsx`
- Create: `src/app/(protected)/diary/new/page.tsx`

- [ ] **Step 1: YouTubeSearchPanel 컴포넌트 작성**

`src/components/YoutubeSearchPanel.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { YouTubeVideo } from '@/lib/youtube'

interface Props {
  onSelect: (video: YouTubeVideo) => void
}

export default function YoutubeSearchPanel({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<YouTubeVideo[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'empty'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function search() {
    if (!query.trim()) return
    setStatus('loading')
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)
      if (res.status === 429) {
        setErrorMsg('잠시 후 다시 시도해주세요')
        setStatus('error')
        return
      }
      if (!res.ok) throw new Error()
      const data: YouTubeVideo[] = await res.json()
      setResults(data)
      setStatus(data.length === 0 ? 'empty' : 'idle')
    } catch {
      setErrorMsg('검색 중 오류가 발생했습니다')
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="곡명 또는 가수 검색"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={search}
          disabled={status === 'loading'}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm"
        >
          {status === 'loading' ? '검색 중...' : '검색'}
        </button>
      </div>

      {status === 'error' && <p className="text-red-400 text-sm">{errorMsg}</p>}
      {status === 'empty' && <p className="text-gray-500 text-sm">검색 결과가 없습니다</p>}

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
        {results.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => onSelect(video)}
            className="flex gap-3 p-2 rounded-lg hover:bg-gray-800 text-left transition"
          >
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={60}
              height={45}
              className="rounded object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{video.title}</p>
              <p className="text-xs text-gray-500">{video.channelTitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 새 기록 작성 페이지 작성**

`src/app/(protected)/diary/new/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import EmotionTagSelector from '@/components/EmotionTagSelector'
import YoutubeSearchPanel from '@/components/YoutubeSearchPanel'
import { createClient } from '@/lib/supabase/client'
import type { YouTubeVideo } from '@/lib/youtube'
import type { Database } from '@/types/database.types'

type EmotionTag = Database['public']['Tables']['emotion_tags']['Row']

export default function NewDiaryPage() {
  const router = useRouter()
  const [tags, setTags] = useState<EmotionTag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [memo, setMemo] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  // 태그 로드 (컴포넌트 마운트 시)
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('emotion_tags')
      .select('*')
      .eq('is_system', true)
      .then(({ data }) => {
        if (data) setTags(data)
      })
  }, [])

  async function handleSave() {
    if (!selectedVideo || selectedTagIds.length === 0) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: entry, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: user.id,
        youtube_id: selectedVideo.id,
        title: selectedVideo.title,
        thumbnail: selectedVideo.thumbnail,
        memo: memo || null,
        is_public: isPublic,
        listened_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !entry) { setSaving(false); return }

    await supabase.from('diary_emotion_tags').insert(
      selectedTagIds.map((tagId) => ({ diary_id: entry.id, tag_id: tagId }))
    )

    router.push('/diary')
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">새 음악 기록</h2>

      <section>
        <h3 className="text-sm text-gray-400 mb-2">지금 기분이 어때요? (최대 3개)</h3>
        <EmotionTagSelector
            tags={tags}
            selected={selectedTagIds}
            onChange={setSelectedTagIds}
          />
      </section>

      <section>
        <h3 className="text-sm text-gray-400 mb-2">어떤 음악을 들었나요?</h3>
        {selectedVideo ? (
          <div className="flex gap-3 p-3 bg-gray-800 rounded-lg">
            <Image src={selectedVideo.thumbnail} alt={selectedVideo.title} width={80} height={60} className="rounded" />
            <div className="flex-1">
              <p className="font-medium">{selectedVideo.title}</p>
              <button type="button" onClick={() => setSelectedVideo(null)} className="text-xs text-gray-500 hover:text-white mt-1">
                다른 곡 선택
              </button>
            </div>
          </div>
        ) : (
          <YoutubeSearchPanel onSelect={setSelectedVideo} />
        )}
      </section>

      <section>
        <h3 className="text-sm text-gray-400 mb-2">한 줄 메모 (선택)</h3>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="오늘 이 노래가 떠오른 이유는..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
        />
      </section>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded"
          />
          공개로 저장
        </label>
        <button
          onClick={handleSave}
          disabled={!selectedVideo || selectedTagIds.length === 0 || saving}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-full text-sm font-semibold"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/components/YoutubeSearchPanel.tsx src/app/\(protected\)/diary/new/
git commit -m "feat: add new diary entry page with YouTube search and emotion tags"
```

---

## Task 14: 다이어리 상세 페이지

**Files:**
- Create: `src/app/(protected)/diary/[id]/page.tsx`

- [ ] **Step 1: 상세 페이지 작성**

`src/app/(protected)/diary/[id]/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DiaryDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entry } = await supabase
    .from('diary_entries')
    .select(`
      *,
      diary_emotion_tags (
        emotion_tags ( id, name )
      )
    `)
    .eq('id', id)
    .single()

  if (!entry) notFound()

  const isOwner = entry.user_id === user?.id
  if (!isOwner && !entry.is_public) notFound()

  const tags = entry.diary_emotion_tags.map((det: any) => det.emotion_tags).filter(Boolean)
  const date = new Date(entry.listened_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex flex-col gap-6">
      <Link href="/diary" className="text-gray-400 hover:text-white text-sm">← 돌아가기</Link>

      <div className="flex gap-4">
        <Image
          src={entry.thumbnail}
          alt={entry.title}
          width={120}
          height={90}
          className="rounded-xl object-cover"
        />
        <div>
          <h2 className="text-xl font-bold">{entry.title}</h2>
          <a
            href={`https://www.youtube.com/watch?v=${entry.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
          >
            YouTube에서 듣기 →
          </a>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tags.map((tag: any) => (
          <span key={tag.id} className="bg-gray-700 px-3 py-1 rounded-full text-sm">
            {tag.name}
          </span>
        ))}
      </div>

      {entry.memo && (
        <p className="text-gray-300 bg-gray-900 rounded-xl p-4 leading-relaxed">{entry.memo}</p>
      )}

      <p className="text-sm text-gray-600">{date} · {entry.is_public ? '공개' : '비공개'}</p>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/\(protected\)/diary/\[id\]/
git commit -m "feat: add diary detail page"
```

---

## Task 15: 에러/로딩 처리 & 전체 테스트 확인

**Files:**
- Create: `src/app/error.tsx`
- Create: `src/app/(protected)/diary/loading.tsx`

- [ ] **Step 1: 전역 에러 바운더리 작성**

`src/app/error.tsx`:

```tsx
'use client'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-bold">문제가 발생했습니다</h2>
      <p className="text-gray-400 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full text-sm"
      >
        다시 시도
      </button>
    </div>
  )
}
```

- [ ] **Step 2: 로딩 UI 작성**

`src/app/(protected)/diary/loading.tsx`:

```tsx
export default function DiaryLoading() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-xl bg-gray-900 animate-pulse" />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: 전체 테스트 실행**

```bash
npm test
```

Expected: 전체 PASS (EmotionTagSelector 4 + DiaryCard 4 + YouTube Route 3 = 11 tests)

- [ ] **Step 4: 개발 서버 실행 및 수동 확인**

```bash
npm run dev
```

확인 항목:
- `http://localhost:3000` → 랜딩 페이지 표시
- Google 로그인 → `/diary` 리다이렉트
- `/diary/new` → 감정 태그 선택 + YouTube 검색 동작
- 저장 후 `/diary` 타임라인에 카드 표시
- 카드 클릭 → `/diary/[id]` 상세 페이지

- [ ] **Step 5: 최종 커밋**

```bash
git add src/app/error.tsx src/app/\(protected\)/diary/loading.tsx
git commit -m "feat: add error boundary and loading UI — Plan 1 MVP complete"
```
