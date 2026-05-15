'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import EmotionTagSelector from '@/components/EmotionTagSelector'
import YoutubeSearchPanel from '@/components/YoutubeSearchPanel'
import { createClient } from '@/lib/supabase/client'
import type { YouTubeVideo } from '@/lib/youtube'
import type { Tables } from '@/types/database.types'

type EmotionTag = Tables<'emotion_tags'>

export default function NewDiaryPage() {
  const router = useRouter()
  const [tags, setTags] = useState<EmotionTag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [memo, setMemo] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recommendations, setRecommendations] = useState<YouTubeVideo[]>([])
  const [recLoading, setRecLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('emotion_tags')
      .select('*')
      .eq('is_system', true)
      .then(({ data }) => {
        if (data) setTags(data)
      })
  }, [])

  useEffect(() => {
    if (selectedTagIds.length === 0) {
      setRecommendations([])
      setShowSearch(false)
      return
    }
    const selectedTagNames = tags
      .filter((t) => selectedTagIds.includes(t.id))
      .map((t) => t.name)
    if (selectedTagNames.length === 0) return

    const query = selectedTagNames.join(' ') + ' 음악'
    setRecLoading(true)
    fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: YouTubeVideo[]) => setRecommendations(data))
      .catch(() => setRecommendations([]))
      .finally(() => setRecLoading(false))
  }, [selectedTagIds, tags])

  async function handleSave() {
    if (!selectedVideo || selectedTagIds.length === 0) return
    setSaving(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const { data: entry, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: user.id,
        youtube_id: selectedVideo.id,
        title: selectedVideo.title,
        thumbnail: selectedVideo.thumbnail,
        memo: memo || null,
        is_public: isPublic,
        listened_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !entry) {
      setSaving(false)
      return
    }

    await Promise.all([
      supabase
        .from('diary_emotion_tags')
        .insert(selectedTagIds.map((tagId) => ({ diary_id: entry.id, tag_id: tagId }))),
      supabase.from('recommendations').insert({
        user_id: user.id,
        tag_ids: selectedTagIds,
        youtube_id: selectedVideo.id,
        title: selectedVideo.title,
      }),
    ])

    router.push('/diary')
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">새 음악 기록</h2>

      <section>
        <h3 className="text-sm text-gray-400 mb-2">지금 기분이 어때요? (최대 3개)</h3>
        <EmotionTagSelector
          tags={tags}
          selected={selectedTagIds}
          onChange={setSelectedTagIds}
        />
      </section>

      <section>
        {selectedVideo ? (
          <div className="flex gap-3 p-3 bg-gray-800 rounded-lg">
            <Image
              src={selectedVideo.thumbnail}
              alt={selectedVideo.title}
              width={80}
              height={60}
              className="rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{selectedVideo.title}</p>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="text-xs text-gray-500 hover:text-white mt-1"
              >
                다른 곡 선택
              </button>
            </div>
          </div>
        ) : selectedTagIds.length > 0 ? (
          <>
            <h3 className="text-sm text-gray-400 mb-2">추천 음악</h3>
            {recLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {recommendations.map((video) => (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => setSelectedVideo(video)}
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
            ) : (
              <p className="text-sm text-gray-500">추천 결과가 없습니다</p>
            )}
            <button
              type="button"
              onClick={() => setShowSearch((v) => !v)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition"
            >
              {showSearch ? '검색창 닫기' : '원하는 곡이 없나요? 직접 검색'}
            </button>
            {showSearch && (
              <div className="mt-2">
                <YoutubeSearchPanel onSelect={setSelectedVideo} />
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-sm text-gray-400 mb-2">어떤 음악을 들었나요?</h3>
            <YoutubeSearchPanel onSelect={setSelectedVideo} />
          </>
        )}
      </section>

      <section>
        <h3 className="text-sm text-gray-400 mb-2">한 줄 메모 (선택)</h3>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="오늘 이 노래가 떠오른 이유는..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
        />
      </section>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded"
          />
          공개로 저장
        </label>
        <button
          onClick={handleSave}
          disabled={!selectedVideo || selectedTagIds.length === 0 || saving}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-full text-sm font-semibold"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
