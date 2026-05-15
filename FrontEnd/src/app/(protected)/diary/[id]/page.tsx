import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import DeleteButton from './DeleteButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DiaryDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: entry } = await supabase
    .from('diary_entries')
    .select(`
      *,
      diary_emotion_tags (
        emotion_tags ( id, name )
      )
    `)
    .eq('id', id)
    .single()

  if (!entry) notFound()

  const isOwner = entry.user_id === user?.id
  if (!isOwner && !entry.is_public) notFound()

  const tags = entry.diary_emotion_tags
    .map((det: { emotion_tags: { id: string; name: string } | null }) => det.emotion_tags)
    .filter(Boolean) as { id: string; name: string }[]

  const date = new Date(entry.listened_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href="/diary" className="text-gray-400 hover:text-white text-sm">
          ← 돌아가기
        </Link>
        {isOwner && (
          <div className="flex items-center gap-4">
            <Link
              href={`/diary/${entry.id}/edit`}
              className="text-sm text-gray-400 hover:text-white"
            >
              수정
            </Link>
            <DeleteButton id={entry.id} />
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold">{entry.title}</h2>

      <YouTubeEmbed
        youtubeId={entry.youtube_id}
        title={entry.title}
        thumbnail={entry.thumbnail}
      />

      <div className="flex gap-2 flex-wrap">
        {tags.map((tag) => (
          <span key={tag.id} className="bg-gray-700 px-3 py-1 rounded-full text-sm">
            {tag.name}
          </span>
        ))}
      </div>

      {entry.memo && (
        <p className="text-gray-300 bg-gray-900 rounded-xl p-4 leading-relaxed">{entry.memo}</p>
      )}

      <p className="text-sm text-gray-600">
        {date} · {entry.is_public ? '공개' : '비공개'}
      </p>
    </div>
  )
}
