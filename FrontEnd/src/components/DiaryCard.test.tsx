import { render, screen } from '@testing-library/react'
import DiaryCard from './DiaryCard'

const mockEntry = {
  id: 'entry-1',
  user_id: 'user-1',
  youtube_id: 'abc123',
  title: '봄날 - BTS',
  thumbnail: 'https://img.jpg',
  memo: '오늘 기분이 좋았다',
  is_public: false,
  listened_at: '2026-05-13T10:00:00Z',
  created_at: '2026-05-13T10:00:00Z',
  diary_emotion_tags: [{ emotion_tags: { id: '1', name: '행복' } }],
}

describe('DiaryCard', () => {
  it('곡 제목을 렌더링한다', () => {
    render(<DiaryCard entry={mockEntry} />)
    expect(screen.getByText('봄날 - BTS')).toBeInTheDocument()
  })

  it('감정 태그를 렌더링한다', () => {
    render(<DiaryCard entry={mockEntry} />)
    expect(screen.getByText('행복')).toBeInTheDocument()
  })

  it('메모를 렌더링한다', () => {
    render(<DiaryCard entry={mockEntry} />)
    expect(screen.getByText('오늘 기분이 좋았다')).toBeInTheDocument()
  })

  it('비공개 상태를 표시한다', () => {
    render(<DiaryCard entry={mockEntry} />)
    expect(screen.getByText('비공개')).toBeInTheDocument()
  })
})
