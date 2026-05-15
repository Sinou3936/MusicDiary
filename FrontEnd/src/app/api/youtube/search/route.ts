import { NextResponse } from 'next/server'
import { searchYouTube } from '@/lib/youtube'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ error: '검색어를 입력해주세요' }, { status: 400 })
  }

  try {
    const videos = await searchYouTube(q)
    return NextResponse.json(videos)
  } catch (error) {
    if (error instanceof Error && error.message === 'QUOTA_EXCEEDED') {
      return NextResponse.json({ error: '잠시 후 다시 시도해주세요' }, { status: 429 })
    }
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다' }, { status: 500 })
  }
}
