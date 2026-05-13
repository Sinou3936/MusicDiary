# ARCHITECTURE-CONSTITUTION

아키텍처 핵심 원칙

## 1. 관심사 분리
- UI(컴포넌트)와 비즈니스 로직(서버/API)을 명확히 분리한다
- 외부 API 호출(YouTube)은 반드시 Next.js API Route를 통해서만 수행한다
- Supabase 클라이언트는 `lib/` 아래에서만 초기화한다

## 2. 보안 우선
- API 키(YouTube, Supabase service role key)는 서버 사이드에서만 사용한다
- 클라이언트에는 anon key만 노출한다
- 모든 DB 접근은 RLS 정책을 통해 제어한다

## 3. 타입 안전성
- Supabase에서 생성한 TypeScript 타입을 전 계층에서 사용한다
- `any` 타입 사용을 금지한다

## 4. 단순성 유지
- 요청된 기능만 구현한다. 미래를 위한 추상화를 만들지 않는다
- 파일이 커지면 단일 책임 원칙에 따라 분리한다
