import { getYaksanRoutes } from "@/lib/ferry"
import YaksanSection from "./YaksanSection"

// 서버 컴포넌트 — 약산권 섬↔섬 배편을 MTIS에서 받아 클라이언트 섹션에 전달.
// 데이터가 없으면(장애·비운항) 아무것도 렌더하지 않아 메인 레이아웃을 흐트리지 않는다.
export default async function YaksanRouteSection() {
  const data = await getYaksanRoutes()
  if (!data.routes.length) return null
  return <YaksanSection data={data} />
}
