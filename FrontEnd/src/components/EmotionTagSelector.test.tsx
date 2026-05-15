import { render, screen, fireEvent } from '@testing-library/react'
import EmotionTagSelector from './EmotionTagSelector'

const mockTags = [
  { id: '1', name: '행복', is_system: true, user_id: null, created_at: '' },
  { id: '2', name: '우울', is_system: true, user_id: null, created_at: '' },
  { id: '3', name: '설렘', is_system: true, user_id: null, created_at: '' },
]

describe('EmotionTagSelector', () => {
  it('태그 목록을 렌더링한다', () => {
    render(<EmotionTagSelector tags={mockTags} selected={[]} onChange={() => {}} />)
    expect(screen.getByText('행복')).toBeInTheDocument()
    expect(screen.getByText('우울')).toBeInTheDocument()
    expect(screen.getByText('설렘')).toBeInTheDocument()
  })

  it('태그 클릭 시 onChange가 선택된 태그 id 배열로 호출된다', () => {
    const onChange = jest.fn()
    render(<EmotionTagSelector tags={mockTags} selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('행복'))
    expect(onChange).toHaveBeenCalledWith(['1'])
  })

  it('이미 선택된 태그 클릭 시 선택 해제된다', () => {
    const onChange = jest.fn()
    render(<EmotionTagSelector tags={mockTags} selected={['1']} onChange={onChange} />)
    fireEvent.click(screen.getByText('행복'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('최대 3개까지만 선택 가능하다', () => {
    const onChange = jest.fn()
    const allTags = [
      ...mockTags,
      { id: '4', name: '평온', is_system: true, user_id: null, created_at: '' },
    ]
    render(<EmotionTagSelector tags={allTags} selected={['1', '2', '3']} onChange={onChange} />)
    fireEvent.click(screen.getByText('평온'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
