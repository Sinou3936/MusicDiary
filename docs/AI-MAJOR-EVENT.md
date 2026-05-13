# AI-MAJOR-EVENT

주요 사건 및 의사결정

---

## 2026-05-13 | 프로젝트 킥오프 및 설계 확정

### 서비스 방향 결정
- 음악 다이어리: 감정 태그 기반 음악 추천 + 수동 YouTube 로깅 + 선택적 공개
- 스크로블링 방식은 자동 감지(YouTube OAuth, 브라우저 확장) 대신 수동 로깅 채택
  - 이유: YouTube API 제약, 구현 범위 초과 방지

### 아키텍처 결정
- Next.js App Router + Supabase + YouTube Data API v3
- YouTube API 호출은 API Route로 분리 (키 보안 + 관심사 분리)
- Supabase CLI + Docker로 로컬 개발 환경 구성

### 음악 데이터 소스 결정
- YouTube Data API v3 채택
- Spotify(오디오 특성 풍부하나 지역 제한), Last.fm(스크로블링 특화) 대신 YouTube 선택
  - 이유: 국내 음악 커버리지, 사용자 친숙도
