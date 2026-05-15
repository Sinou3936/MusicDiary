'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateDiaryEntry(
  id: string,
  memo: string | null,
  isPublic: boolean,
  tagIds: string[],
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: entry } = await supabase
    .from('diary_entries')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!entry || entry.user_id !== user.id) redirect('/')

  await supabase
    .from('diary_entries')
    .update({ memo, is_public: isPublic })
    .eq('id', id)

  await supabase.from('diary_emotion_tags').delete().eq('diary_id', id)

  if (tagIds.length > 0) {
    await supabase
      .from('diary_emotion_tags')
      .insert(tagIds.map((tagId) => ({ diary_id: id, tag_id: tagId })))
  }

  redirect(`/diary/${id}`)
}
