# Plan 3 요약 — 배포

> 완료일: 2026-05-16

---

## 구현 목표

로컬 개발 환경을 Supabase 클라우드 + Vercel로 배포

---

## 순서

### 1. Supabase 클라우드 프로젝트 생성

- supabase.com에서 새 프로젝트 생성
- Project URL: `https://rchkwlclnmgojsvepxnl.supabase.co`
- anon key, service role key 발급

### 2. 마이그레이션 클라우드 적용

```bash
cd BackEnd
npx supabase link --project-ref rchkwlclnmgojsvepxnl
npx supabase db push
```

로컬 마이그레이션 4개 + seed 클라우드에 적용

### 3. Google OAuth 설정

**Supabase 클라우드 대시보드** → Authentication → Providers → Google
- Client ID / Secret 입력
- Skip nonce checks 활성화

**Supabase 클라우드 대시보드** → Authentication → URL Configuration
- Site URL: `https://music-diary-gold.vercel.app`
- Redirect URLs: `https://music-diary-gold.vercel.app/auth/callback`

**Google Cloud Console** → OAuth 클라이언트 → Authorized redirect URIs 추가
- `https://rchkwlclnmgojsvepxnl.supabase.co/auth/v1/callback` (기존)
- `https://music-diary-gold.vercel.app/auth/callback` (신규)

### 4. Vercel 배포

- GitHub 레포 연결, Root Directory: `FrontEnd`
- 환경변수 설정:

| 키 | 출처 |
|----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 대시보드 → Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 대시보드 → Project Settings → Data API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 대시보드 → Project Settings → Data API → service_role |
| `YOUTUBE_API_KEY` | Google Cloud Console → APIs & Services → Credentials → API 키 |
| `NEXT_PUBLIC_SITE_URL` | Vercel 배포 후 발급된 도메인 (예: `https://xxx.vercel.app`) |

---

## 주요 이슈 & 해결

| 이슈 | 원인 | 해결 |
|------|------|------|
| Google provider not enabled | Supabase 대시보드 저장 전 CORS 확장 프로그램이 요청 차단 | CORS 확장 프로그램 비활성화 후 저장 |
| 로그인 두 번 필요 | `@supabase/ssr` 세션 쿠키 갱신 미들웨어 누락 | `src/middleware.ts` 추가 |

---

## 배포 URL

- 서비스: [https://music-diary-gold.vercel.app](https://music-diary-gold.vercel.app)
- Supabase 대시보드: [https://supabase.com/dashboard/project/rchkwlclnmgojsvepxnl](https://supabase.com/dashboard/project/rchkwlclnmgojsvepxnl)
