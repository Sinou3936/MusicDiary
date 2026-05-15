'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ExploreCard from '@/components/ExploreCard'
import type { Tables } from '@/types/database.types'

type EntryWithRelations = Tables<'diary_entries'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'avatar_url'> | null
  diary_emotion_tags: { emotion_tags: { id: string; name: string } | null }[]
}

interface Props {
  initialEntries: EntryWithRelations[]
  tags: Tables<'emotion_tags'>[]
}

const PAGE_SIZE = 20

export default function ExploreClient({ initialEntries, tags }: Props) {
  const [entries, setEntries] = useState<EntryWithRelations[]>(initialEntries)
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(initialEntries.length === PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const offsetRef = useRef(initialEntries.length)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchEntries = useCallback(async (tagId: string | null, offset: number) => {
    const supabase = createClient()

    let query = supabase
      .from('diary_entries')
      .select(`
        *,
        profiles ( username, avatar_url ),
        diary_emotion_tags (
          emotion_tags ( id, name )
        )
      `)
      .eq('is_public', true)
      .order('listened_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (tagId) {
      const { data: taggedIds } = await supabase
        .from('diary_emotion_tags')
        .select('diary_id')
        .eq('tag_id', tagId)

      const ids = taggedIds?.map((t) => t.diary_id) ?? []
      if (ids.length === 0) return []
      query = query.in('id', ids)
    }

    const { data } = await query
    return (data ?? []) as EntryWithRelations[]
  }, [])

  // 태그 필터 변경 시 초기화
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchEntries(selectedTagId, 0).then((data) => {
      if (cancelled) return
      setEntries(data)
      setHasMore(data.length === PAGE_SIZE)
      offsetRef.current = data.length
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [selectedTagId, fetchEntries])

  // 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || !hasMore || loading) return
        setLoading(true)
        const more = await fetchEntries(selectedTagId, offsetRef.current)
        setEntries((prev) => [...prev, ...more])
        setHasMore(more.length === PAGE_SIZE)
        offsetRef.current += more.length
        setLoading(false)
      },
      { threshold: 0.5 }
    )
    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [selectedTagId, hasMore, loading, fetchEntries])

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">탐색</h2>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTagId(null)}
          className={`px-3 py-1 rounded-full text-sm border transition ${
            selectedTagId === null
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-gray-600 text-gray-400 hover:border-gray-400'
          }`}
        >
          전체
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setSelectedTagId(tag.id)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              selectedTagId === tag.id
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-600 text-gray-400 hover:border-gray-400'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {entries.length === 0 && !loading && (
        <p className="text-center py-20 text-gray-500">공개된 기록이 없어요</p>
      )}

      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <ExploreCard key={entry.id} entry={entry} />
        ))}
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-900 animate-pulse" />
          ))}
        </div>
      )}

      <div ref={bottomRef} className="h-1" />
    </div>
  )
}
