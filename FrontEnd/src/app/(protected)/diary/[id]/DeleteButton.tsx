'use client'

import { useState } from 'react'
import { deleteDiaryEntry } from './actions'

export default function DeleteButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="text-sm text-gray-500 hover:text-red-400 transition"
      >
        삭제
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">정말 삭제할까요?</span>
      <button
        type="button"
        onClick={async () => {
          setDeleting(true)
          await deleteDiaryEntry(id)
        }}
        disabled={deleting}
        className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
      >
        {deleting ? '삭제 중...' : '확인'}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="text-sm text-gray-500 hover:text-white"
      >
        취소
      </button>
    </div>
  )
}
