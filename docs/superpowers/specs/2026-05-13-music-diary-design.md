# 음악 다이어리 설계 문서

**작성일:** 2026-05-13  
**스택:** Next.js App Router + Supabase + YouTube Data API v3

---

## 서비스 개요

그날의 감정/기분에 맞는 음악을 추천받고, 직접 YouTube에서 찾은 음악을 기록하는 감성 다이어리 서비스.  
기본은 비공개이며, 원할 때 피드에 공개 공유 가능.

---

## 아키텍처

```
Next.js App Router (Frontend + BFF)
├── app/                     # 페이지 & 레이아웃
├── components/              # UI 컴포넌트
├── app/api/                 # API Routes
│   ├── youtube/search       # YouTube 검색
│   └── recommend/           # 감정 기반 추천
└── lib/                     # Supabase 클라이언트, 유틸

Supabase (Backend)
├── Auth                     # 구글 소셜 로그인
├── Database (Postgres)      # 일기, 감정태그, 음악 기록
└── Storage                  # 추후 앨범 커버 캐싱 등

External
└── YouTube Data API v3      # 음악 검색 & 메타데이터
```

### 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 / 로그인 |
| `/diary` | 내 음악 다이어리 피드 (타임라인) |
| `/diary/new` | 새 기록 작성 (감정 태그 + YouTube 검색 + 메모) |
| `/diary/[id]` | 상세 보기 |
| `/explore` | 공개된 다른 사람 기록 탐색 |

---

## 데이터베이스 스키마

```sql
-- 사용자 (Supabase Auth와 연동)
profiles
  id          uuid  -- auth.users.id 참조
  username    text
  avatar_url  text
  created_at  timestamp

-- 감정 태그 (시스템 제공 + 사용자 커스텀)
emotion_tags
  id         uuid
  name       text       -- "행복", "우울", "설렘" 등
  is_system  bool       -- true: 기본 제공, false: 사용자 생성
  user_id    uuid|null  -- is_system=false일 때 생성한 사용자

-- 음악 다이어리 기록
diary_entries
  id            uuid
  user_id       uuid  → profiles
  youtube_id    text  -- YouTube 영상 ID
  title         text  -- 곡 제목
  thumbnail     text  -- 썸네일 URL
  memo          text  -- 자유 텍스트 메모
  is_public     bool  -- 공개 여부 (기본 false)
  listened_at   timestamp
  created_at    timestamp

-- 다이어리 ↔ 감정태그 (다대다)
diary_emotion_tags
  diary_id  uuid → diary_entries
  tag_id    uuid → emotion_tags

-- 추천 기록
recommendations
  id          uuid
  user_id     uuid → profiles
  tag_ids     uuid[]
  youtube_id  text
  title       text
  created_at  timestamp
```

### RLS 정책

- `diary_entries`: 본인 전체 접근, 타인은 `is_public = true`만 조회 가능

---

## 핵심 기능 흐름

### 새 기록 작성
1. 사용자가 감정 태그 선택 (1~3개)
2. YouTube 검색 → `/api/youtube/search` → YouTube Data API
3. 검색 결과에서 곡 선택
4. 짧은 메모 입력 (선택)
5. 공개/비공개 설정 후 저장 → Supabase DB

### 감정 기반 추천
1. 사용자가 감정 태그 선택
2. `/api/recommend` 호출
3. 해당 태그로 저장된 과거 기록 중 인기 곡 집계 + YouTube Data API 키워드 검색 결과 혼합
4. 추천 목록 반환 → `recommendations` 테이블에 기록

### 탐색(Explore)
1. `is_public = true`인 `diary_entries` 조회
2. 최신순 / 감정 태그 필터 정렬
3. 무한 스크롤 페이지네이션

### 인증
- Supabase Auth Google OAuth
- 로그인 시 `profiles` 테이블 자동 생성 (DB trigger)

---

## 에러 처리

| 상황 | 처리 방식 |
|------|----------|
| YouTube API 할당량 초과 | "잠시 후 다시 시도" 안내 |
| YouTube 검색 결과 없음 | 빈 상태 UI 표시 |
| Supabase 인증 만료 | 자동 리다이렉트 to `/` |
| RLS 위반 | 403 처리 |
| 예상치 못한 에러 | Next.js `error.tsx`로 캐치 |

---

## 테스트 전략 (TDD)

### 단위 테스트 (Jest + Testing Library)
- 감정 태그 선택 컴포넌트
- 다이어리 카드 컴포넌트
- API Route 핸들러 (`youtube/search`, `recommend`)

### 통합 테스트
- 새 기록 작성 플로우
- 공개/비공개 전환

### E2E (Playwright) — 선택적
- 로그인 → 기록 작성 → 탐색 흐름

---

## 개발 환경

- **로컬 Supabase:** Supabase CLI + Docker (`supabase start`)
- **YouTube API 키:** `.env.local`에 관리
- **타입 생성:** `supabase gen types --local > src/types/database.types.ts`
