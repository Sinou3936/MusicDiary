# Plan 2: 음악 다이어리 고도화

> Plan 1 MVP 완료 기준으로 추가 기능 구현

---

## 구현 목표

- 탐색 피드 (`/explore`) — 공개 기록 무한 스크롤 + 감정 태그 필터
- 감정 기반 음악 추천 — 태그 선택 시 자동 YouTube 추천
- 기록 수정 / 삭제
- 전체 테스트 & 빌드 확인

---

## Task 1: 탐색 피드 페이지 (`/explore`)

**Files:**
- Create: `src/app/(protected)/explore/page.tsx`
- Create: `src/app/(protected)/explore/loading.tsx`

- [ ] **Step 1: 탐색 피드 페이지 작성**

`src/app/(protected)/explore/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import ExploreClient from './ExploreClient'

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data: tags } = await supabase
    .from('emotion_tags')
    .select('*')
    .eq('is_system', true)
    .order('name')

  const { data: entries } = await supabase
    .from('diary_entries')
    .select(`
      *,
      profiles ( username, avatar_url ),
      diary_emotion_tags (
        emotion_tags ( id, name )
      )
    `)
    .eq('is_public', true)
    .order('listened_at', { ascending: false })
    .range(0, 19)

  return <ExploreClient initialEntries={entries ?? []} tags={tags ?? []} />
}
```

- [ ] **Step 2: ExploreClient 작성 (태그 필터 + 무한 스크롤)**

`src/app/(protected)/explore/ExploreClient.tsx`:
- 감정 태그 필터 (선택 시 해당 태그의 공개 기록만 표시)
- 무한 스크롤 (Intersection Observer)
- 필터 변경 시 목록 초기화

- [ ] **Step 3: 로딩 UI**

`src/app/(protected)/explore/loading.tsx`:
- DiaryLoading과 동일한 스켈레톤 UI

- [ ] **Step 4: 빌드 확인 & 커밋**

---

## Task 2: ExploreCard 컴포넌트 (TDD)

**Files:**
- Create: `src/components/ExploreCard.tsx`
- Create: `src/components/ExploreCard.test.tsx`

탐색 피드용 카드 — DiaryCard와 다르게 작성자 정보(username, avatar) 표시

테스트 항목:
- 곡 제목 렌더링
- 감정 태그 렌더링
- 작성자 이름 렌더링
- 공개 기록만 표시

---

## Task 3: 감정 기반 음악 추천

**Files:**
- Modify: `src/app/(protected)/diary/new/page.tsx`

감정 태그 선택 시 자동으로 YouTube 검색 실행하여 추천 목록 표시

- [ ] **Step 1: 추천 섹션 추가**

`/diary/new` 페이지에서:
- 감정 태그 1개 이상 선택 → 태그 이름으로 YouTube 자동 검색
- "추천 음악" 섹션에 결과 표시
- 추천 목록에서 곡 선택 시 바로 selectedVideo로 설정

- [ ] **Step 2: recommendations 테이블 저장**

저장 시 `recommendations` 테이블에 기록:
```ts
await supabase.from('recommendations').insert({
  user_id: user.id,
  tag_ids: selectedTagIds,
  youtube_id: selectedVideo.id,
  title: selectedVideo.title,
})
```

- [ ] **Step 3: 빌드 확인 & 커밋**

---

## Task 4: 기록 수정

**Files:**
- Create: `src/app/(protected)/diary/[id]/edit/page.tsx`
- Modify: `src/app/(protected)/diary/[id]/page.tsx` (수정 버튼 추가)

- [ ] **Step 1: 수정 버튼 추가**

상세 페이지에 본인 기록일 때만 "수정" 버튼 표시

- [ ] **Step 2: 수정 페이지 작성**

`/diary/[id]/edit`:
- 기존 메모, 공개 여부, 감정 태그 불러오기
- 수정 후 저장 → 상세 페이지로 이동
- YouTube 곡은 수정 불가 (표시만)

- [ ] **Step 3: 빌드 확인 & 커밋**

---

## Task 5: 기록 삭제

**Files:**
- Modify: `src/app/(protected)/diary/[id]/page.tsx` (삭제 버튼 추가)

- [ ] **Step 1: 삭제 Server Action 추가**

상세 페이지에 본인 기록일 때만 "삭제" 버튼 표시
- 확인 후 삭제 → `/diary`로 이동
- `diary_emotion_tags`는 CASCADE로 자동 삭제

- [ ] **Step 2: 빌드 확인 & 커밋**

---

## Task 6: 전체 테스트 & 최종 확인

- [ ] **Step 1: 전체 테스트 실행**

```bash
npm test -- --no-coverage
```

Expected: 전체 PASS

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: 수동 확인 항목**

| 화면 | 확인 내용 |
|------|---------|
| `/explore` | 공개 기록 목록, 태그 필터, 무한 스크롤 |
| `/diary/new` | 태그 선택 시 추천 음악 자동 표시 |
| `/diary/[id]` | 수정/삭제 버튼 (본인만) |
| `/diary/[id]/edit` | 메모/공개여부/태그 수정 후 저장 |

- [ ] **Step 4: 최종 커밋**

```bash
git commit -m "feat: Plan 2 complete — explore feed, recommendation, edit/delete"
```
