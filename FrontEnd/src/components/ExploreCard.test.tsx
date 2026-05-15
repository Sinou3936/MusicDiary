import { render, screen } from '@testing-library/react'
import ExploreCard from './ExploreCard'

const mockEntry = {
  id: 'entry-1',
  user_id: 'user-1',
  youtube_id: 'BzY9p0PTHLM',
  title: 'IU(아이유) - 밤편지',
  thumbnail: 'https://i.ytimg.com/vi/BzY9p0PTHLM/mqdefault.jpg',
  memo: '비 오는 날 듣기 좋은 노래',
  is_public: true,
  listened_at: '2026-05-15T10:00:00Z',
  created_at: '2026-05-15T10:00:00Z',
  profiles: { username: 'Sinou', avatar_url: null },
  diary_emotion_tags: [
    { emotion_tags: { id: '1', name: '그리움' } },
    { emotion_tags: { id: '2', name: '평온' } },
  ],
}

describe('ExploreCard', () => {
  it('곡 제목을 렌더링한다', () => {
    render(<ExploreCard entry={mockEntry} />)
    expect(screen.getByText('IU(아이유) - 밤편지')).toBeInTheDocument()
  })

  it('작성자 이름을 렌더링한다', () => {
    render(<ExploreCard entry={mockEntry} />)
    expect(screen.getByText('Sinou')).toBeInTheDocument()
  })

  it('감정 태그를 렌더링한다', () => {
    render(<ExploreCard entry={mockEntry} />)
    expect(screen.getByText('그리움')).toBeInTheDocument()
    expect(screen.getByText('평온')).toBeInTheDocument()
  })

  it('메모를 렌더링한다', () => {
    render(<ExploreCard entry={mockEntry} />)
    expect(screen.getByText('비 오는 날 듣기 좋은 노래')).toBeInTheDocument()
  })

  it('username이 없으면 익명으로 표시한다', () => {
    render(<ExploreCard entry={{ ...mockEntry, profiles: null }} />)
    expect(screen.getByText('익명')).toBeInTheDocument()
  })
})
