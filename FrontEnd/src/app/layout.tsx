import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '음악 다이어리',
  description: '감정에 맞는 음악을 기록하세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-950 text-white min-h-screen">{children}</body>
    </html>
  )
}
