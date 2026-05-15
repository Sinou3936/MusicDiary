import { createClient } from '@/lib/supabase/server'
import DiaryCard from '@/components/DiaryCard'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DiaryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: entries } = await supabase
    .from('diary_entries')
    .select(`
      *,
      diary_emotion_tags (
        emotion_tags ( id, name )
      )
    `)
    .eq('user_id', user.id)
    .order('listened_at', { ascending: false })

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg mb-4">아직 기록이 없어요</p>
        <Link href="/diary/new" className="text-indigo-400 hover:text-indigo-300">
          첫 번째 음악을 기록해보세요 →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => (
        <DiaryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
