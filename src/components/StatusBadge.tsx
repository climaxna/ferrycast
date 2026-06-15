import type { FerryStatus } from "@/lib/types"

const config: Record<FerryStatus, { label: string; className: string }> = {
  "on-time":  { label: "정시",   className: "bg-green-100 text-green-800" },
  boarding:   { label: "탑승중", className: "bg-blue-100 text-blue-800 animate-pulse" },
  delayed:    { label: "지연",   className: "bg-yellow-100 text-yellow-800" },
  departed:   { label: "출발",   className: "bg-gray-100 text-gray-500" },
  cancelled:  { label: "취소",   className: "bg-red-100 text-red-700" },
}

export default function StatusBadge({ status }: { status: FerryStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
