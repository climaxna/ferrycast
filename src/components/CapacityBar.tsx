export default function CapacityBar({ boarded, capacity }: { boarded: number; capacity: number }) {
  const pct = capacity > 0 ? Math.round((boarded / capacity) * 100) : 0
  const color = pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-yellow-400" : "bg-green-500"

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>탑승</span>
        <span>{boarded} / {capacity}명 ({pct}%)</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
