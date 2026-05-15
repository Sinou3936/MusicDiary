# Plan 2 요약 — 음악 다이어리 고도화

> 완료일: 2026-05-16

---

## 구현 목표

Plan 1 MVP 위에 탐색 피드, 감정 기반 추천, 기록 수정/삭제 기능 추가

---

## Task 1 — 탐색 피드 `/explore`

**추가 파일**
- `src/app/(protected)/explore/page.tsx`
- `src/app/(protected)/explore/ExploreClient.tsx`
- `src/app/(protected)/explore/loading.tsx`

공개 기록을 무한 스크롤(IntersectionObserver)로 표시하고, 감정 태그 필터로 해당 태그 기록만 필터링한다. 필터 변경 시 목록을 초기화하고 스켈레톤 로딩 UI를 포함한다.

---

## Task 2 — ExploreCard 컴포넌트 (TDD)

**추가 파일**
- `src/components/ExploreCard.tsx`
- `src/components/ExploreCard.test.tsx`

DiaryCard와 달리 작성자 username과 감정 태그를 함께 표시한다. username이 없으면 "익명"으로 표시한다. 5개 테스트 RED → GREEN.

---

## Task 3 — 감정 기반 음악 추천

**수정 파일**
- `src/app/(protected)/diary/new/page.tsx`

감정 태그 선택 시 `"그리움 평온 음악"` 형태로 YouTube API를 자동 호출해 추천 목록을 표시한다. 추천 목록에서 선택하거나 "원하는 곡이 없나요? 직접 검색" 토글로 기존 검색창을 사용할 수 있다. 저장 시 `recommendations` 테이블에도 함께 기록한다.

---

## Task 4 — 기록 수정

**추가 파일**
- `src/app/(protected)/diary/[id]/edit/page.tsx`
- `src/app/(protected)/diary/[id]/edit/actions.ts`

**수정 파일**
- `src/app/(protected)/diary/[id]/page.tsx` (수정 버튼 추가)

본인 기록에만 "수정" 버튼을 표시한다. 수정 페이지에서 메모, 공개 여부, 감정 태그를 변경할 수 있고 YouTube 곡은 표시만 한다. 저장은 Server Action으로 처리한다.

---

## Task 5 — 기록 삭제

**추가 파일**
- `src/app/(protected)/diary/[id]/DeleteButton.tsx`
- `src/app/(protected)/diary/[id]/actions.ts`

본인 기록에만 "삭제" 버튼을 표시한다. 클릭 시 인라인 확인창(정말 삭제할까요?)을 거친 뒤 Server Action으로 삭제 후 `/diary`로 이동한다. `diary_emotion_tags`는 CASCADE로 자동 삭제된다.

---

## Task 6 — 전체 테스트 & 최종 확인

- 테스트 4 suites / 16 tests — 전체 PASS
- `npm run build` — 에러 없음
- 라우트: `/`, `/diary`, `/diary/[id]`, `/diary/[id]/edit`, `/diary/new`, `/explore`, `/api/youtube/search`, `/auth/callback`

---

## 주요 이슈 & 해결

| 이슈 | 원인 | 해결 |
|------|------|------|
| Client-side PATCH `net::ERR_FAILED` | 브라우저에서 로컬 Supabase로의 PATCH가 Kong에 도달하지 않음 | 수정/삭제를 Server Action으로 전환하여 해결 |
| YouTube iframe 없는 영상 처리 | iframe `onError` 이벤트 미지원 | 썸네일 클릭 전까지 iframe 미로드, 클릭 시 교체하는 `YouTubeEmbed` 컴포넌트 구현 |
| 추천 섹션 UX 이질감 | 추천 목록과 검색창이 별도 섹션으로 분리 | 하나의 섹션으로 통합, "원하는 곡이 없나요?" 토글로 검색창 노출 |
