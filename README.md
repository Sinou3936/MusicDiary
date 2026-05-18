# 음악 다이어리

오늘의 감정에 맞는 음악을 기록하는 웹 서비스

**배포 URL**: https://music-diary-gold.vercel.app

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| 외부 API | YouTube Data API v3 |
| 배포 | Vercel (Frontend), Supabase Cloud (Backend) |
| 테스트 | Jest, React Testing Library |

---

## 주요 기능

- **Google OAuth 로그인** — Supabase Auth 기반
- **음악 기록** — YouTube 검색 후 감정 태그와 함께 기록 저장
- **감정 기반 추천** — 태그 선택 시 YouTube 자동 추천
- **탐색 피드** — 공개 기록 무한 스크롤 + 감정 태그 필터
- **기록 수정 / 삭제** — 본인 기록만 수정/삭제 가능

---

## 프로젝트 구조

```
AGENT-CODING/
├── FrontEnd/               # Next.js 앱
│   └── src/
│       ├── app/
│       │   ├── (protected)/
│       │   │   ├── diary/          # 내 기록 목록
│       │   │   ├── diary/new/      # 새 기록 작성
│       │   │   ├── diary/[id]/     # 기록 상세 / 수정 / 삭제
│       │   │   └── explore/        # 탐색 피드
│       │   ├── api/youtube/search/ # YouTube 검색 API Route
│       │   └── auth/callback/      # OAuth 콜백
│       ├── components/
│       └── lib/supabase/
└── BackEnd/                # Supabase CLI
    └── supabase/
        ├── migrations/     # DB 마이그레이션
        └── seed.sql        # 감정 태그 초기 데이터
```

---

## 로컬 개발 환경 설정

### 사전 준비

- Node.js 18+
- Docker Desktop
- Supabase CLI

### 1. 환경변수 설정

`FrontEnd/.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=           # supabase start 후 발급
SUPABASE_SERVICE_ROLE_KEY=               # supabase start 후 발급
YOUTUBE_API_KEY=                         # Google Cloud Console에서 발급
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Supabase 로컬 실행

```bash
cd BackEnd
npx supabase start    # Docker 실행 필요
npx supabase stop     # 중지
```

### 3. Frontend 실행

```bash
cd FrontEnd
npm install
npm run dev
```

---

## DB 마이그레이션

| 파일 | 내용 |
|------|------|
| `20260513080149_profiles.sql` | 사용자 프로필 테이블 + Auth 트리거 |
| `20260513081313_emotion_tags.sql` | 감정 태그 테이블 + RLS |
| `20260516000001_diary.sql` | 다이어리 기록, 태그 연결, 추천 테이블 + RLS |
| `seed.sql` | 시스템 감정 태그 8개 초기 데이터 |

---

## 테스트

```bash
cd FrontEnd
npm test
```

테스트 대상: `EmotionTagSelector`, `DiaryCard`, `ExploreCard`, YouTube API Route

---

## 배포

배포 관련 상세 내용은 [docs/PLAN3-SUMMARY.md](docs/PLAN3-SUMMARY.md) 참고

---

## 개발 문서

| 문서 | 내용 |
|------|------|
| [docs/PLAN1-SUMMARY.md](docs/PLAN1-SUMMARY.md) | Plan 1 MVP 구현 요약 |
| [docs/PLAN2-SUMMARY.md](docs/PLAN2-SUMMARY.md) | Plan 2 고도화 구현 요약 |
| [docs/PLAN3-SUMMARY.md](docs/PLAN3-SUMMARY.md) | Plan 3 배포 요약 |
| [docs/API.md](docs/API.md) | API 명세 |
