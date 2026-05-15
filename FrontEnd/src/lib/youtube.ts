export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
}

export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set')

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'video')
  url.searchParams.set('videoCategoryId', '10')
  url.searchParams.set('maxResults', '10')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) {
    if (res.status === 403) throw new Error('QUOTA_EXCEEDED')
    throw new Error('YOUTUBE_API_ERROR')
  }

  const data = await res.json()
  return data.items.map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { medium: { url: string } }; channelTitle: string } }) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
  }))
}
