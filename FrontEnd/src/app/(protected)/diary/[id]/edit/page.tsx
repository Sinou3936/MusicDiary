'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import EmotionTagSelector from '@/components/EmotionTagSelector'
import { createClient } from '@/lib/supabase/client'
import { updateDiaryEntry } from './actions'
import type { Tables } from '@/types/database.types'

type EmotionTag = Tables<'emotion_tags'>

export default function DiaryEditPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [memo, setMemo] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState<EmotionTag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const [{ data: entry }, { data: allTags }] = await Promise.all([
        supabase
          .from('diary_entries')
          .select('*, diary_emotion_tags(tag_id)')
          .eq('id', id)
          .single(),
        supabase.from('emotion_tags').select('*').eq('is_system', true).order('name'),
      ])

      if (!entry || entry.user_id !== user.id) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setTitle(entry.title)
      setThumbnail(entry.thumbnail)
      setMemo(entry.memo ?? '')
      setIsPublic(entry.is_public)
      setTags(allTags ?? [])
      setSelectedTagIds(
        (entry.diary_emotion_tags as { tag_id: string }[]).map((t) => t.tag_id),
      )
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    if (selectedTagIds.length === 0) return
    setSaving(true)
    await updateDiaryEntry(id, memo || null, isPublic, selectedTagIds)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-900 animate-pulse" />
        ))}
      </div>
    )
  }

  if (notFound) {
    return <p className="text-gray-500 text-sm">기록을 찾을 수 없습니다.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white text-sm"
        >
          ← 돌아가기
        </button>
        <h2 className="text-lg font-bold">기록 수정</h2>
        <div className="w-16" />
      </div>

      <div className="flex gap-3 p-3 bg-gray-900 rounded-lg">
        <Image
          src={thumbnail}
          alt={title}
          width={80}
          height={60}
          className="rounded object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0 flex items-center">
          <p className="font-medium truncate">{title}</p>
        </div>
      </div>

      <section>
        <h3 className="text-sm text-gray-400 mb-2">감정 태그 (최대 3개)</h3>
        <EmotionTagSelector
          tags={tags}
          selected={selectedTagIds}
          onChange={setSelectedTagIds}
        />
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
          disabled={selectedTagIds.length === 0 || saving}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-full text-sm font-semibold"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
