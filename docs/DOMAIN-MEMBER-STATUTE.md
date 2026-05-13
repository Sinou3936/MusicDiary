# DOMAIN-MEMBER-STATUTE

회원 도메인 구현 규칙

## profiles 테이블
```sql
profiles
  id          uuid  references auth.users(id) on delete cascade
  username    text
  avatar_url  text
  created_at  timestamp with time zone default now()
```

## 자동 생성 트리거
- 신규 회원 가입 시 `auth.users`에 레코드 생성과 동시에 `profiles` 레코드가 자동 생성된다
- DB trigger: `on_auth_user_created` → `handle_new_user()`

## RLS 정책
- 본인 프로필: 읽기/쓰기 모두 허용
- 타인 프로필: 읽기만 허용 (공개 정보만)

## 탈퇴 처리
- `auth.users` 삭제 시 `on delete cascade`로 `profiles`도 함께 삭제된다

## username 규칙
- 2~20자, 영문/숫자/언더스코어만 허용
- 중복 불가 (unique constraint)
