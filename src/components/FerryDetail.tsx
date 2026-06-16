"use client"

import { useEffect } from "react"
import type { Ferry } from "@/lib/types"
import StatusBadge from "./StatusBadge"
import CapacityBar from "./CapacityBar"

export default function FerryDetail({ ferry, onClose }: { ferry: Ferry; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  const isCancelled = ferry.status === "cancelled"

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-xs font-medium text-gray-400">{ferry.id} · {ferry.platform} 승강장</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-0.5">{ferry.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={ferry.status} />
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center bg-gray-50 rounded-xl p-4 mb-5">
          <div className="flex-1">
            <p className="text-3xl font-bold tabular-nums text-gray-900">{ferry.departure}</p>
            <p className="mt-1 text-base font-semibold text-gray-700">{ferry.route.from}</p>
            <p className="text-xs text-gray-400 mt-0.5">출발</p>
          </div>
          <div className="text-gray-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold tabular-nums text-gray-900">{ferry.arrival}</p>
            <p className="mt-1 text-base font-semibold text-gray-700">{ferry.route.to}</p>
            <p className="text-xs text-gray-400 mt-0.5">도착</p>
          </div>
        </div>

        {!isCancelled && (
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-600 mb-2">탑승 현황</p>
            <CapacityBar boarded={ferry.boarded} capacity={ferry.capacity} />
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
