# 음악 다이어리

오늘의 감정을 태그로 기록하고, 그 감정에 어울리는 음악을 찾아 저장하는 웹 서비스

**배포 URL**: https://music-diary-gold.vercel.app

---

# 프로젝트 개요

- **프로젝트 목적**: 감정 일기와 음악 취향을 함께 기록하고, 타인의 공개 기록을 탐색하며 공감할 수 있는 공간 제공
- **주요 기능 설명**: 감정 태그 선택 → YouTube 자동 추천 → 기록 저장 → 탐색 피드 공유
- **어떤 문제를 해결하는지**: "오늘 기분에 맞는 음악을 뭘 들었는지 기록해두고 싶다"는 니즈를 해결. 일반 플레이리스트 앱과 달리 감정 컨텍스트와 함께 기록
- **프로젝트 진행 배경**: AI 에이전트(Claude Code)를 활용한 풀스택 웹 개발 실습 프로젝트. Plan 1(MVP) → Plan 2(고도화) → Plan 3(배포) 단계로 진행

---

# 기술 스택

## Frontend

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS

## Backend

- Supabase (PostgreSQL, Auth, Row Level Security)
- YouTube Data API v3

## 배포

- Vercel (Frontend)
- Supabase Cloud (Database & Auth)

## AI Agent

- Claude Code (Anthropic) — 전체 개발 과정에 활용

---

# 주요 기능

- **Google OAuth 로그인** — Supabase Auth 기반 소셜 로그인
- **음악 기록** — YouTube 검색 후 감정 태그, 메모와 함께 기록 저장 (공개/비공개)
- **감정 기반 추천** — 감정 태그 선택 시 관련 음악 자동 추천
- **기록 수정 / 삭제** — 본인 기록에 한해 메모, 태그, 공개 여부 수정 및 삭제
- **탐색 피드** — 공개 기록 무한 스크롤 + 감정 태그 필터링

---

# 프로젝트 구조

```text
AGENT-CODING/
├── FrontEnd/
│   └── src/
│       ├── app/
│       │   ├── (protected)/
│       │   │   ├── diary/            # 내 기록 목록
│       │   │   ├── diary/new/        # 새 기록 작성
│       │   │   ├── diary/[id]/       # 기록 상세 / 수정 / 삭제
│       │   │   └── explore/          # 탐색 피드
│       │   ├── api/youtube/search/   # YouTube 검색 API Route
│       │   └── auth/callback/        # OAuth 콜백
│       ├── components/               # 공통 컴포넌트
│       ├── lib/supabase/             # Supabase 클라이언트
│       ├── types/                    # TypeScript 타입
│       └── middleware.ts             # 세션 갱신 미들웨어
└── BackEnd/
    └── supabase/
        ├── migrations/               # DB 마이그레이션
        └── seed.sql                  # 감정 태그 초기 데이터
```

---

# 실행 방법

## 1. 프로젝트 설치

```bash
cd FrontEnd
npm install
```

## 2. Supabase 로컬 실행 (Docker 필요)

```bash
cd BackEnd
npx supabase start
```

## 3. 환경변수 설정

`FrontEnd/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # supabase start 출력값
SUPABASE_SERVICE_ROLE_KEY=            # supabase start 출력값
YOUTUBE_API_KEY=                      # Google Cloud Console
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. 실행

```bash
cd FrontEnd
npm run dev
```

---

# Supabase 설정

## Authentication

- Google OAuth 사용 (Supabase Auth)
- 로그인 후 `profiles` 테이블에 사용자 정보 자동 생성 (DB 트리거)

## 테이블

| 테이블 | 설명 |
|--------|------|
| `profiles` | 사용자 프로필 (username, avatar_url) |
| `emotion_tags` | 감정 태그 (시스템 8개 + 커스텀) |
| `diary_entries` | 음악 기록 (youtube_id, title, thumbnail, memo, is_public) |
| `diary_emotion_tags` | 기록-태그 연결 테이블 |
| `recommendations` | 추천 기록 (태그 기반 자동 추천 이력) |

## 주요 RLS 정책

- `diary_entries`: 본인 기록 전체 접근 / 공개 기록 누구나 조회
- `diary_emotion_tags`: diary 소유자 접근 / 공개 diary 태그 누구나 조회
- `emotion_tags`: 시스템 태그 누구나 조회 / 커스텀 태그 본인만 접근

## Storage

- 미사용 (썸네일은 YouTube 이미지 URL 그대로 사용)

---

# AI 에이전트 활용 방식

## 사용한 도구

- **Claude Code** (Anthropic) — VS Code 익스텐션으로 대화하며 개발

## 어떤 작업에 활용했는지

- DB 스키마 설계 및 마이그레이션 파일 작성
- Next.js 페이지 / 컴포넌트 / API Route 구현
- TDD (테스트 먼저 작성 후 구현)
- 빌드 오류 및 런타임 버그 디버깅
- 배포 설정 (Vercel, Supabase 클라우드)
- 각 Plan 완료 후 문서 정리

## 문서 기반 작업 방식

- `docs/CONTEXT.md` — 현재 작업에 필요한 최소 정보 유지
- `docs/PLAN*.md` — 구현 계획 사전 작성 후 단계별 실행
- `docs/PLAN*-SUMMARY.md` — 완료 후 회고 문서 작성
- 에이전트가 계획 문서를 기준으로 작업하고, 완료 후 반드시 문서 업데이트

## 프롬프트 전략

- 작업 단위를 Task로 세분화하고 하나씩 진행
- 각 Task 완료 후 사용자가 직접 화면 확인 후 다음 Task 승인
- 모호한 요구사항은 에이전트가 먼저 방향을 제안하고 사용자가 선택

## 코드 검증 방식

- TDD: 테스트 RED → 구현 → GREEN 확인
- 매 Task 완료 시 `npm run build` 통과 확인
- `npm test` 전체 테스트 통과 확인
- 브라우저에서 직접 동작 확인 후 커밋

---

# 트러블 슈팅

## 1. Client-side PATCH `net::ERR_FAILED`

**문제 상황**

기록 수정 페이지에서 저장 버튼 클릭 시 `net::ERR_FAILED` 에러 발생. Kong API 게이트웨이에 PATCH 요청이 도달하지 않음.

**원인**

CORS preflight(OPTIONS)는 200으로 성공했으나 실제 PATCH 요청이 브라우저에서 차단됨. 로컬 환경에서 `localhost:3000` → `127.0.0.1:54321` 간 PATCH 메서드 특이 케이스.

**해결 방법**

클라이언트 사이드 Supabase 직접 호출 대신 Next.js Server Action으로 전환. 서버에서 Supabase로 요청하므로 CORS 문제 완전 우회.

---

## 2. 로그인 후 세션 유지 안 됨 (두 번 로그인 필요)

**문제 상황**

Google OAuth 로그인 후 `/diary`로 리다이렉트되지만 세션이 인식되지 않아 다시 로그인 페이지로 이동.

**원인**

`@supabase/ssr` 사용 시 미들웨어에서 세션 쿠키를 갱신해주지 않으면 서버 컴포넌트가 세션을 읽지 못함. `src/middleware.ts` 파일 누락.

**해결 방법**

`src/middleware.ts` 추가 — 모든 요청에서 `supabase.auth.getUser()` 호출하여 세션 쿠키 자동 갱신.

---

## 3. Supabase Google OAuth 저장 실패

**문제 상황**

Supabase 대시보드에서 Google OAuth 설정 저장 시 `Failed to fetch` 에러.

**원인**

브라우저에 설치된 CORS 확장 프로그램이 `api.supabase.com` 요청을 차단.

**해결 방법**

CORS 확장 프로그램 비활성화 후 저장 성공.

---

## 4. `NEXT_PUBLIC_` 환경변수 재배포 미반영

**문제 상황**

Vercel에서 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 변경 후 Redeploy했으나 변경사항 미반영.

**원인**

`NEXT_PUBLIC_` 변수는 빌드 타임에 번들에 포함됨. 기존 빌드 캐시를 재사용하는 Redeploy로는 반영 안 됨.

**해결 방법**

빈 커밋(`git commit --allow-empty`)으로 새 빌드 트리거.

---

# 회고

## 어려웠던 점

- Supabase 로컬 환경에서 RLS와 Docker 네트워크 이슈로 mock 데이터 삽입이 까다로웠음
- `@supabase/ssr` 세션 처리 방식이 기존 클라이언트 방식과 달라 미들웨어 누락으로 인한 버그 발생

## 개선하고 싶은 점

- YouTube API 쿼터 제한 대응 (캐싱 전략 도입)
- 커스텀 감정 태그 추가 기능
- 좋아요 / 댓글 등 소셜 기능

## 새롭게 배운 점

- Next.js App Router Server Action 패턴 — CORS 우회에 효과적
- Supabase RLS 정책 설계 — 테이블별 세밀한 접근 제어
- `@supabase/ssr` 미들웨어 세션 갱신 흐름

## AI 에이전트를 사용하며 느낀 점

- 계획 문서를 먼저 작성하고 에이전트가 이를 기준으로 작업하는 방식이 효과적
- 에이전트가 생성한 코드도 반드시 직접 확인하고 테스트해야 함
- 작업 단위를 작게 나눌수록 에이전트의 실수를 빠르게 잡을 수 있음
- 디버깅 시 에이전트에게 로그와 에러 메시지를 정확히 전달하는 것이 중요

---

# 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase SSR 가이드](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)
