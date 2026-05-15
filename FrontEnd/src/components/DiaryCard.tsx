import Link from 'next/link'
import type { Tables } from '@/types/database.types'

type DiaryEntryWithTags = Tables<'diary_entries'> & {
  diary_emotion_tags: {
    emotion_tags: Pick<Tables<'emotion_tags'>, 'id' | 'name'> | null
  }[]
}

export default function DiaryCard({ entry }: { entry: DiaryEntryWithTags }) {
  const tags = entry.diary_emotion_tags
    .map((t) => t.emotion_tags)
    .filter(Boolean) as Pick<Tables<'emotion_tags'>, 'id' | 'name'>[]

  return (
    <Link href={`/diary/${entry.id}`}>
      <div className="flex gap-4 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition">
        <img
          src={entry.thumbnail}
          alt={entry.title}
          className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-medium truncate">{entry.title}</p>
          <div className="flex gap-1 flex-wrap">
            {tags.map((tag) => (
              <span key={tag.id} className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                {tag.name}
              </span>
            ))}
          </div>
          {entry.memo && <p className="text-sm text-gray-400 truncate">{entry.memo}</p>}
        </div>
      </div>
    </Link>
  )
}
