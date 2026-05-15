'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteDiaryEntry(id: string) {
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

  await supabase.from('diary_entries').delete().eq('id', id)

  redirect('/diary')
}
