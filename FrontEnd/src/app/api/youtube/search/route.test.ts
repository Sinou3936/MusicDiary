/**
 * @jest-environment node
 */
import { GET } from './route'
import * as youtube from '@/lib/youtube'

jest.mock('@/lib/youtube')

const mockVideos = [
  { id: 'abc123', title: '테스트 곡', thumbnail: 'https://img.jpg', channelTitle: '가수' },
]

describe('GET /api/youtube/search', () => {
  it('query 파라미터로 YouTube 검색 결과를 반환한다', async () => {
    jest.spyOn(youtube, 'searchYouTube').mockResolvedValue(mockVideos)
    const req = new Request('http://localhost/api/youtube/search?q=행복한+노래')
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual(mockVideos)
  })

  it('q 파라미터가 없으면 400을 반환한다', async () => {
    const req = new Request('http://localhost/api/youtube/search')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('할당량 초과 시 429를 반환한다', async () => {
    jest.spyOn(youtube, 'searchYouTube').mockRejectedValue(new Error('QUOTA_EXCEEDED'))
    const req = new Request('http://localhost/api/youtube/search?q=test')
    const res = await GET(req)
    expect(res.status).toBe(429)
  })
})
