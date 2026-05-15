export default function DiaryLoading() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-xl bg-gray-900 animate-pulse" />
      ))}
    </div>
  )
}
