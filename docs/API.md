# API 명세서

> YouTube 검색은 Next.js API Route, 나머지 CRUD는 Supabase 클라이언트를 통해 직접 처리한다.

---

## YouTube 검색

### GET `/api/youtube/search`

음악 검색 (서버에서만 YouTube API 키 사용)

**Query Parameters**

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `q` | ✅ | 검색어 |

**응답**

```json
[
  {
    "id": "youtube_video_id",
    "title": "곡 제목",
    "thumbnail": "https://i.ytimg.com/...",
    "channelTitle": "채널명"
  }
]
```

| 상태코드 | 조건 |
|---------|------|
| 200 | 성공 |
| 400 | `q` 파라미터 없음 |
| 429 | YouTube API 할당량 초과 |
| 500 | 서버 에러 |

---

## 다이어리 CRUD

Supabase 클라이언트로 직접 처리. RLS가 적용되어 있어 인증된 사용자만 접근 가능.

### CREATE — 다이어리 기록 저장

```ts
// Server Action (diary/new 페이지)
const { data, error } = await supabase
  .from('diary_entries')
  .insert({
    user_id: user.id,
    youtube_id: string,
    title: string,
    thumbnail: string,
    memo: string | null,
    is_public: boolean,
    listened_at: string, // ISO 8601
  })
  .select()
  .single()

// 감정 태그 연결 (다대다)
await supabase.from('diary_emotion_tags').insert(
  tagIds.map((tag_id) => ({ diary_id: data.id, tag_id }))
)
```

### READ — 내 타임라인 목록

```ts
// Server Component (diary/page.tsx)
const { data } = await supabase
  .from('diary_entries')
  .select(`
    *,
    diary_emotion_tags (
      emotion_tags ( id, name )
    )
  `)
  .eq('user_id', user.id)
  .order('listened_at', { ascending: false })
```

### READ — 단건 상세

```ts
// Server Component (diary/[id]/page.tsx)
const { data } = await supabase
  .from('diary_entries')
  .select(`
    *,
    diary_emotion_tags (
      emotion_tags ( id, name )
    )
  `)
  .eq('id', id)
  .single()
```

### UPDATE — 기록 수정 (Plan 2)

```ts
const { error } = await supabase
  .from('diary_entries')
  .update({ memo, is_public, listened_at })
  .eq('id', id)
  .eq('user_id', user.id)
```

### DELETE — 기록 삭제 (Plan 2)

```ts
const { error } = await supabase
  .from('diary_entries')
  .delete()
  .eq('id', id)
  .eq('user_id', user.id)
```

---

## 감정 태그

### READ — 시스템 태그 전체 조회

```ts
const { data } = await supabase
  .from('emotion_tags')
  .select('*')
  .eq('is_system', true)
  .order('name')
```

---

## 탐색 피드 (Plan 2)

### READ — 공개 기록 목록

```ts
const { data } = await supabase
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
  .range(offset, offset + 19) // 무한 스크롤, 20개씩
```

---

## RLS 정책 요약

| 테이블 | 본인 | 타인 |
|--------|------|------|
| `diary_entries` | 전체 (CRUD) | `is_public = true`만 조회 |
| `diary_emotion_tags` | 전체 | 공개 diary의 태그만 조회 |
| `emotion_tags` | 커스텀 태그 CRUD | 시스템 태그 조회만 |
| `profiles` | 전체 | 조회만 |
| `recommendations` | 전체 (CRUD) | 접근 불가 |
