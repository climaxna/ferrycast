import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// MTIS 원시 데이터 확인용 디버그 엔드포인트
// 사용법: /api/debug/ferry?port=인천  (출발항 키워드)
//         /api/debug/ferry?dest=연평  (도착항 키워드)
//         /api/debug/ferry?port=인천&dest=연평
export async function GET(req: NextRequest) {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return NextResponse.json({ error: "API key missing" }, { status: 500 })

  const portKw = req.nextUrl.searchParams.get("port") ?? ""
  const destKw = req.nextUrl.searchParams.get("dest") ?? ""

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  const date = `${kst.getUTCFullYear()}${pad(kst.getUTCMonth() + 1)}${pad(kst.getUTCDate())}`

  const params = new URLSearchParams({
    serviceKey: key, pageNo: "1", numOfRows: "2000",
    dataType: "JSON", rlvtYmd: date,
  })

  try {
    const res = await fetch(
      `https://apis.data.go.kr/B554035/oprt-schd-info-v2/get-oprt-schd-info-v2?${params}`,
      { cache: "no-store" },
    )
    if (!res.ok) return NextResponse.json({ error: `HTTP ${res.status}` }, { status: 502 })

    let json: unknown
    try { json = await res.json() }
    catch { return NextResponse.json({ error: "JSON parse failed" }, { status: 502 }) }

    const j = json as { response?: { header?: { resultCode?: string }; body?: { items?: { item?: unknown }; totalCount?: number } } }
    if (j?.response?.header?.resultCode !== "200")
      return NextResponse.json({ resultCode: j?.response?.header?.resultCode, raw: j }, { status: 200 })

    type Item = { sail_tm: string; oport_nm: string; dest_nm: string; nvg_stts_nm: string; psnshp_nm: string; nvg_seawy_nm: string }
    const raw = j?.response?.body?.items?.item
    const items = (Array.isArray(raw) ? raw : raw ? [raw] : []) as Item[]

    // 키워드 필터
    const filtered = items.filter((it) => {
      const portMatch = portKw ? it.oport_nm.includes(portKw) || it.dest_nm.includes(portKw) : true
      const destMatch = destKw ? it.oport_nm.includes(destKw) || it.dest_nm.includes(destKw) : true
      return portMatch && destMatch
    })

    // 출발·도착 항구 이름 유니크 목록 (전체 키워드 없을 때 참고용)
    const portNames = [...new Set(filtered.map((it) => it.oport_nm))].sort()
    const destNames = [...new Set(filtered.map((it) => it.dest_nm))].sort()

    return NextResponse.json({
      date,
      totalAll: items.length,
      totalFiltered: filtered.length,
      portKeyword: portKw || null,
      destKeyword: destKw || null,
      portNames,
      destNames,
      items: filtered.map((it) => ({
        sailTime: it.sail_tm.padStart(4, "0").replace(/(\d{2})(\d{2})/, "$1:$2"),
        from: it.oport_nm,
        to: it.dest_nm,
        ship: it.psnshp_nm,
        status: it.nvg_stts_nm,
        route: it.nvg_seawy_nm,
      })),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
