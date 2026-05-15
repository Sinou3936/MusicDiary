# CONTEXT

## 현재 작업
Plan 1 완료 — MVP 구현 완료

## 다음 작업
Plan 2: 탐색 피드, 감정 기반 추천, Update/Delete CRUD

## 프로젝트
- 서비스명: 음악 다이어리
- 스택: Next.js App Router (FrontEnd/) + Supabase CLI (BackEnd/) + YouTube Data API v3
- 구현 계획: docs/superpowers/plans/2026-05-13-music-diary-plan1.md

## 로컬 환경
- Supabase 로컬: http://127.0.0.1:54321 (Docker 실행 필요)
- Studio: http://127.0.0.1:54323
- 재시작 명령: `cd BackEnd && npx supabase start`

## 완료된 마이그레이션
- 20260513080149_profiles.sql
- 20260513081313_emotion_tags.sql
- 20260516000001_diary.sql (diary_entries, diary_emotion_tags, recommendations + RLS)
- seed.sql (감정태그 8개)
