# ARCHITECTURE-STATUTE

아키텍처 구현 규칙

## 디렉토리 구조

```
src/
├── app/                        # Next.js App Router 페이지
│   ├── (auth)/                 # 인증 필요 없는 페이지 그룹
│   │   └── page.tsx            # 랜딩 / 로그인
│   ├── (protected)/            # 인증 필요 페이지 그룹
│   │   ├── diary/
│   │   │   ├── page.tsx        # 다이어리 타임라인
│   │   │   ├── new/page.tsx    # 새 기록 작성
│   │   │   └── [id]/page.tsx   # 상세 보기
│   │   └── explore/page.tsx    # 탐색
│   ├── api/
│   │   ├── youtube/search/route.ts
│   │   └── recommend/route.ts
│   ├── error.tsx
│   └── layout.tsx
├── components/                 # 재사용 UI 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저용 클라이언트
│   │   └── server.ts           # 서버용 클라이언트
│   └── youtube.ts              # YouTube API 유틸
├── types/
│   └── database.types.ts       # supabase gen types 결과
└── supabase/
    ├── config.toml
    └── migrations/
```

## API Route 규칙
- 외부 API 키는 `process.env`에서만 읽는다
- 응답은 `NextResponse.json()`으로 통일한다
- 에러 시 적절한 HTTP 상태코드와 메시지를 반환한다

## Supabase 클라이언트 규칙
- Server Component / Route Handler: `lib/supabase/server.ts`
- Client Component: `lib/supabase/client.ts`
- service role key는 Route Handler에서만 사용한다

## 환경변수
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # 서버 전용
YOUTUBE_API_KEY               # 서버 전용
```
