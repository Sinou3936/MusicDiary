import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/diary')

  async function signInWithGoogle() {
    'use server'
    const supabase = await createClient()
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (data.url) redirect(data.url)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">음악 다이어리</h1>
        <p className="text-gray-400 text-lg">오늘의 감정에 맞는 음악을 기록하세요</p>
      </div>
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex items-center gap-3 bg-white text-gray-900 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
        >
          Google로 시작하기
        </button>
      </form>
    </main>
  )
}
