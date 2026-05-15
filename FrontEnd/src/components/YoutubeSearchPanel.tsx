'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { YouTubeVideo } from '@/lib/youtube'

interface Props {
  onSelect: (video: YouTubeVideo) => void
}

export default function YoutubeSearchPanel({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<YouTubeVideo[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'empty'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function search() {
    if (!query.trim()) return
    setStatus('loading')
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)
      if (res.status === 429) {
        setErrorMsg('잠시 후 다시 시도해주세요')
        setStatus('error')
        return
      }
      if (!res.ok) throw new Error()
      const data: YouTubeVideo[] = await res.json()
      setResults(data)
      setStatus(data.length === 0 ? 'empty' : 'idle')
    } catch {
      setErrorMsg('검색 중 오류가 발생했습니다')
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="곡명 또는 가수 검색"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={search}
          disabled={status === 'loading'}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm"
        >
          {status === 'loading' ? '검색 중...' : '검색'}
        </button>
      </div>

      {status === 'error' && <p className="text-red-400 text-sm">{errorMsg}</p>}
      {status === 'empty' && <p className="text-gray-500 text-sm">검색 결과가 없습니다</p>}

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
        {results.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => onSelect(video)}
            className="flex gap-3 p-2 rounded-lg hover:bg-gray-800 text-left transition"
          >
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={60}
              height={45}
              className="rounded object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{video.title}</p>
              <p className="text-xs text-gray-500">{video.channelTitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
