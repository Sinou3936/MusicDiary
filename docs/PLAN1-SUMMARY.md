# Plan 1 완료 요약

> 음악 다이어리 MVP — 2026-05-13 ~ 2026-05-16

---

## 구현 범위

Google 로그인 → 감정 태그 선택 → YouTube 검색 → 기록 저장 → 타임라인 확인 → 상세 재생

---

## 완료된 작업

| Task | 내용 |
|------|------|
| 1 | Next.js 14+ 프로젝트 초기화 (TypeScript, Tailwind, Jest) |
| 2 | Supabase CLI 로컬 환경 구성 (Docker) |
| 3 | DB 마이그레이션 — profiles + auth trigger |
| 4 | DB 마이그레이션 — emotion_tags + seed (8개 태그) |
| 5 | DB 마이그레이션 — diary_entries, diary_emotion_tags, recommendations + RLS |
| 6 | TypeScript 타입 자동 생성 + Supabase 클라이언트 (browser/server) |
| 7 | 인증 미들웨어 + Google OAuth 콜백 라우트 |
| 8 | 랜딩/로그인 페이지 |
| 9 | Protected Layout (헤더/로그아웃) + 타임라인 뼈대 |
| 10 | EmotionTagSelector 컴포넌트 (TDD, 4 tests) |
| 11 | YouTube 검색 API Route (TDD, 3 tests) |
| 12 | DiaryCard 컴포넌트 (TDD, 4 tests) |
| 13 | 새 기록 작성 페이지 (감정 태그 + YouTube 검색 + 메모 + 저장) |
| 14 | 상세 페이지 (YouTube 임베드 플레이어 + 태그 + 메모) |
| 15 | 전역 에러 바운더리 + 로딩 UI + 전체 테스트 통과 |

---

## 라우트 구조

```
/                    랜딩/로그인 (미인증 시 표시)
/diary               내 타임라인 (인증 필요)
/diary/new           새 기록 작성 (인증 필요)
/diary/[id]          기록 상세 + YouTube 플레이어 (인증 필요)
/auth/callback       Google OAuth 콜백
/api/youtube/search  YouTube 검색 API (서버 전용)
```

---

## DB 테이블

| 테이블 | 설명 |
|--------|------|
| profiles | 사용자 정보 (Google 로그인 자동 생성) |
| emotion_tags | 감정 태그 (시스템 8개 기본 제공) |
| diary_entries | 음악 기록 (youtube_id, 메모, 공개 여부) |
| diary_emotion_tags | 기록 ↔ 태그 다대다 |
| recommendations | 감정 기반 추천 기록 (Plan 2에서 활용) |

---

## 테스트

| 파일 | 테스트 수 |
|------|---------|
| EmotionTagSelector.test.tsx | 4 |
| DiaryCard.test.tsx | 4 |
| api/youtube/search/route.test.ts | 3 |
| **합계** | **11 / 11 pass** |

---

## 기술 스택

| 영역 | 사용 기술 |
|------|---------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Supabase CLI (PostgreSQL + Auth + RLS) |
| 외부 API | YouTube Data API v3 |
| 인증 | Google OAuth (Supabase Auth) |
| 테스트 | Jest, React Testing Library |

---

## Plan 2 예정 항목

- 탐색 피드 (`/explore`) — 공개 기록 무한 스크롤
- 감정 태그 기반 음악 추천 (자동 YouTube 검색)
- 기록 수정 / 삭제
- 프로필 페이지
