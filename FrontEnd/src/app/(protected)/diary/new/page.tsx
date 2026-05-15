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

    await supabase
      .from('diary_emotion_tags')
      .insert(selectedTagIds.map((tagId) => ({ diary_id: entry.id, tag_id: tagId })))

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
        <h3 className="text-sm text-gray-400 mb-2">어떤 음악을 들었나요?</h3>
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
        ) : (
          <YoutubeSearchPanel onSelect={setSelectedVideo} />
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
