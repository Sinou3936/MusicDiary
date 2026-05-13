# DOMAIN-MEMBER-CONSTITUTION

회원 도메인 핵심 원칙

## 1. 인증은 Supabase Auth에 위임
- 비밀번호, 세션 관리는 직접 구현하지 않는다
- Supabase Auth가 제공하는 Google OAuth를 사용한다

## 2. 프로필과 인증 계정 분리
- `auth.users`는 Supabase 내부 인증 테이블이다
- 서비스 전용 사용자 데이터는 `profiles` 테이블에 별도 관리한다

## 3. 최소 정보 수집
- 서비스 운영에 필요한 최소한의 사용자 정보만 저장한다
