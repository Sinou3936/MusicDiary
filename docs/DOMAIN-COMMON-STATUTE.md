# DOMAIN-COMMON-STATUTE

공통 도메인 구현 규칙

## 타임스탬프
- 모든 테이블은 `created_at timestamp with time zone default now()`를 포함한다

## ID
- 모든 PK는 `uuid` 타입을 사용한다
- `gen_random_uuid()`를 기본값으로 사용한다

## 소프트 딜리트
- 삭제가 필요한 데이터는 `deleted_at` 컬럼으로 소프트 딜리트한다 (단, 명시적으로 하드 딜리트가 필요한 경우 제외)

## RLS
- 모든 테이블은 RLS를 활성화한다
- 정책 없는 테이블에는 기본적으로 접근 불가

## 에러 메시지
- 사용자에게 노출되는 에러 메시지는 한국어로 작성한다
