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

**Response 200**

```json
[
  {
    "id": "dQw4w9WgXcQ",
    "title": "곡 제목",
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    "channelTitle": "채널명"
  }
]
```

**Response 400**

```json
{ "error": "검색어를 입력해주세요" }
```

**Response 429**

```json
{ "error": "잠시 후 다시 시도해주세요" }
```

**Response 500**

```json
{ "error": "검색 중 오류가 발생했습니다" }
```

---

## 다이어리 CRUD

Supabase 클라이언트로 직접 처리. RLS 적용 — 인증된 사용자만 접근 가능.

---

### CREATE — 다이어리 기록 저장

**Request Body**

```json
{
  "user_id": "uuid",
  "youtube_id": "dQw4w9WgXcQ",
  "title": "곡 제목",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
  "memo": "오늘 기분에 딱 맞는 노래",
  "is_public": false,
  "listened_at": "2026-05-16T14:00:00+09:00"
}
```

**감정 태그 연결 (diary_emotion_tags)**

```json
[
  { "diary_id": "uuid", "tag_id": "uuid" },
  { "diary_id": "uuid", "tag_id": "uuid" }
]
```

**Response 201**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "youtube_id": "dQw4w9WgXcQ",
  "title": "곡 제목",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
  "memo": "오늘 기분에 딱 맞는 노래",
  "is_public": false,
  "listened_at": "2026-05-16T14:00:00+09:00",
  "created_at": "2026-05-16T14:01:00+09:00"
}
```

---

### READ — 내 타임라인 목록

**Response 200**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "youtube_id": "dQw4w9WgXcQ",
    "title": "곡 제목",
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    "memo": "오늘 기분에 딱 맞는 노래",
    "is_public": false,
    "listened_at": "2026-05-16T14:00:00+09:00",
    "created_at": "2026-05-16T14:01:00+09:00",
    "diary_emotion_tags": [
      {
        "emotion_tags": { "id": "uuid", "name": "행복" }
      },
      {
        "emotion_tags": { "id": "uuid", "name": "설렘" }
      }
    ]
  }
]
```

---

### READ — 단건 상세

**Response 200**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "youtube_id": "dQw4w9WgXcQ",
  "title": "곡 제목",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
  "memo": "오늘 기분에 딱 맞는 노래",
  "is_public": false,
  "listened_at": "2026-05-16T14:00:00+09:00",
  "created_at": "2026-05-16T14:01:00+09:00",
  "diary_emotion_tags": [
    {
      "emotion_tags": { "id": "uuid", "name": "행복" }
    }
  ]
}
```

---

### UPDATE — 기록 수정 (Plan 2)

**Request Body**

```json
{
  "memo": "수정된 메모",
  "is_public": true,
  "listened_at": "2026-05-16T15:00:00+09:00"
}
```

**Response 200**

```json
{
  "id": "uuid",
  "memo": "수정된 메모",
  "is_public": true,
  "listened_at": "2026-05-16T15:00:00+09:00"
}
```

---

### DELETE — 기록 삭제 (Plan 2)

**Response 204**

```json
{}
```

---

## 감정 태그

### READ — 시스템 태그 전체 조회

**Response 200**

```json
[
  { "id": "uuid", "name": "행복", "is_system": true, "user_id": null, "created_at": "..." },
  { "id": "uuid", "name": "설렘", "is_system": true, "user_id": null, "created_at": "..." },
  { "id": "uuid", "name": "평온", "is_system": true, "user_id": null, "created_at": "..." },
  { "id": "uuid", "name": "우울", "is_system": true, "user_id": null, "created_at": "..." },
  { "id": "uuid", "name": "그리움", "is_system": true, "user_id": null, "created_at": "..." },
  { "id": "uuid", "name": "신남", "is_system": true, "user_id": null, "created_at": "..." },
  { "id": "uuid", "name": "외로움", "is_system": true, "user_id": null, "created_at": "..." },
  { "id": "uuid", "name": "위로", "is_system": true, "user_id": null, "created_at": "..." }
]
```

---

## 탐색 피드 (Plan 2)

### READ — 공개 기록 목록

**Query Parameters**

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `offset` | ❌ | 페이징 오프셋 (기본값 0) |

**Response 200**

```json
[
  {
    "id": "uuid",
    "youtube_id": "dQw4w9WgXcQ",
    "title": "곡 제목",
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    "memo": "공개된 메모",
    "is_public": true,
    "listened_at": "2026-05-16T14:00:00+09:00",
    "profiles": {
      "username": "닉네임",
      "avatar_url": "https://..."
    },
    "diary_emotion_tags": [
      {
        "emotion_tags": { "id": "uuid", "name": "행복" }
      }
    ]
  }
]
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
