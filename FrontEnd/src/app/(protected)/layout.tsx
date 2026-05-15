import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex justify-between items-center py-4 mb-6 border-b border-gray-800">
        <Link href="/diary" className="text-xl font-bold">
          음악 다이어리
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/explore" className="text-gray-400 hover:text-white text-sm">
            탐색
          </Link>
          <Link
            href="/diary/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-sm px-4 py-2 rounded-full"
          >
            + 기록
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-gray-400 hover:text-white text-sm">
              로그아웃
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  )
}
