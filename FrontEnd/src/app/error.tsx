'use client'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-bold">문제가 발생했습니다</h2>
      <p className="text-gray-400 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full text-sm"
      >
        다시 시도
      </button>
    </div>
  )
}
