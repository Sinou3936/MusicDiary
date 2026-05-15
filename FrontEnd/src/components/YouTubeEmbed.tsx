'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Props {
  youtubeId: string
  title: string
  thumbnail: string
}

export default function YouTubeEmbed({ youtubeId, title, thumbnail }: Props) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full rounded-xl"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="relative w-full rounded-xl overflow-hidden group"
      style={{ paddingBottom: '56.25%' }}
      aria-label={`${title} 재생`}
    >
      <Image
        src={thumbnail}
        alt={title}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center">
        <a
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full hover:text-white hover:bg-black/70 transition"
        >
          YouTube에서 보기
        </a>
      </div>
    </button>
  )
}
