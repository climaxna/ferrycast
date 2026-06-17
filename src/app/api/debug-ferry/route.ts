import { NextResponse } from "next/server"

export async function GET() {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return NextResponse.json({ error: "DATAGOKR_API_KEY 없음" })

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const date = kst.toISOString().slice(0, 10).replace(/-/g, "")

  async function fetchRaw(nodeId: string) {
    const url =
      `https://apis.data.go.kr/1613000/DmstcShipNvgInfo/GetShipOpratInfoList` +
      `?serviceKey=${key}&_type=json&numOfRows=100&pageNo=1` +
      `&depNodeId=${nodeId}&depPlandTime=${date}`
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) return { error: `HTTP ${res.status}` }
      const json = await res.json()
      const raw = json?.response?.body?.items?.item
      if (!raw) return { resultCode: json?.response?.header?.resultCode, items: [] }
      const items = Array.isArray(raw) ? raw : [raw]
      return {
        resultCode: json?.response?.header?.resultCode,
        count: items.length,
        // arrPlaceNm 목록만 요약
        destinations: items.map((i: Record<string, unknown>) => ({
          arr: i.arrPlaceNm,
          dep: String(i.depPlandTime).slice(8, 12),
          ship: i.vihicleNm,
        })),
      }
    } catch (e) {
      return { error: String(e) }
    }
  }

  const [wando, hwaheungpo, cheongsando] = await Promise.all([
    fetchRaw("SEA31020"),   // 완도 출발
    fetchRaw("SEA31022"),   // 화흥포 출발
    fetchRaw("SEA35560"),   // 청산도 출발 (도착 탭용)
  ])

  return NextResponse.json({ date, wando, hwaheungpo, cheongsando })
}
