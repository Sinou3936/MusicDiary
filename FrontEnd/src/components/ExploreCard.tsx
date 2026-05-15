import Link from 'next/link'
import Image from 'next/image'
import type { Tables } from '@/types/database.types'

type EntryWithRelations = Tables<'diary_entries'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'avatar_url'> | null
  diary_emotion_tags: { emotion_tags: { id: string; name: string } | null }[]
}

export default function ExploreCard({ entry }: { entry: EntryWithRelations }) {
  const tags = entry.diary_emotion_tags
    .map((det) => det.emotion_tags)
    .filter(Boolean) as { id: string; name: string }[]

  const date = new Date(entry.listened_at).toLocaleDateString('ko-KR', {
    month: 'short',
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
            <span className="text-xs text-gray-600 flex-shrink-0">{date}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {entry.profiles?.username ?? '익명'}
          </p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {tags.map((tag) => (
              <span key={tag.id} className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                {tag.name}
              </span>
            ))}
          </div>
          {entry.memo && (
            <p className="text-sm text-gray-400 mt-1 truncate">{entry.memo}</p>
          )}
        </div>
      </article>
    </Link>
  )
}
