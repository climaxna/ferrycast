import { getWandoRoutes } from "@/lib/ferry"
import RouteItem from "./RouteItem"

export default async function RouteList() {
  let result: Awaited<ReturnType<typeof getWandoRoutes>> | null = null

  try {
    result = await getWandoRoutes()
  } catch {
    // fallback below
  }

  if (!result) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        항로 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
      </div>
    )
  }

  const { routes, isLive } = result

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">완도 출발 항로</h2>
        {!isLive && (
          <span className="text-xs text-amber-600">참고 시간표 · 실시간 연동 준비중</span>
        )}
      </div>
      <div className="space-y-2">
        {routes.map((route) => (
          <RouteItem key={route.id} route={route} />
        ))}
      </div>
    </section>
  )
}
