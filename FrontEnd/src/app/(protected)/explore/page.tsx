import { createClient } from '@/lib/supabase/server'
import ExploreClient from './ExploreClient'

export default async function ExplorePage() {
  const supabase = await createClient()

  const [{ data: tags }, { data: entries }] = await Promise.all([
    supabase.from('emotion_tags').select('*').eq('is_system', true).order('name'),
    supabase
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
      .range(0, 19),
  ])

  return <ExploreClient initialEntries={entries ?? []} tags={tags ?? []} />
}
