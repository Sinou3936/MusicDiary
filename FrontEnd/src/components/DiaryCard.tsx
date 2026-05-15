import Link from 'next/link'
import Image from 'next/image'

interface DiaryEntryWithTags {
  id: string
  youtube_id: string
  title: string
  thumbnail: string
  memo: string | null
  is_public: boolean
  listened_at: string
  diary_emotion_tags: {
    emotion_tags: { id: string; name: string } | null
  }[]
}

export default function DiaryCard({ entry }: { entry: DiaryEntryWithTags }) {
  const tags = entry.diary_emotion_tags
    .map((det) => det.emotion_tags)
    .filter(Boolean) as { id: string; name: string }[]

  const date = new Date(entry.listened_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={`/diary/${entry.id}`}>
      <article className="flex gap-4 p-4 rounded-xl bg-gray-900 hover:bg-gray-800 transition">
        <Image
          src={entry.thumbnail}
          alt={entry.title}
          width={80}
          height={60}
          className="rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate">{entry.title}</h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {entry.is_public ? '공개' : '비공개'}
            </span>
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {tags.map((tag) => (
              <span key={tag.id} className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                {tag.name}
              </span>
            ))}
          </div>
          {entry.memo && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{entry.memo}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">{date}</p>
        </div>
      </article>
    </Link>
  )
}
