import type { Tables } from '@/types/database.types'

type EmotionTag = Tables<'emotion_tags'>

interface Props {
  tags: EmotionTag[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function EmotionTagSelector({ tags, selected, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      if (selected.length >= 3) return
      onChange([...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              isSelected
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-600 text-gray-400 hover:border-gray-400'
            }`}
          >
            {tag.name}
          </button>
        )
      })}
      {selected.length >= 3 && (
        <p className="text-xs text-gray-500 w-full mt-1">최대 3개까지 선택 가능합니다</p>
      )}
    </div>
  )
}
