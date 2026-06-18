import { NextResponse } from "next/server"

// 임시 테스트용 엔드포인트 — MTIS 운항 스케줄 API 검증
// 사용: https://ferrycast.kr/api/test-mtis
// 또는: https://ferrycast.kr/api/test-mtis?name=슬로시티청산도호

export async function GET(req: Request) {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return NextResponse.json({ error: "API 키 없음" }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const psnshpNm = searchParams.get("name") ?? ""

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const today = kst.toISOString().slice(0, 10).replace(/-/g, "")

  const BASE_CANDIDATES = [
    "https://apis.data.go.kr/B554035/oprtSchdInfoV2/get-oprt-schd-info-v2",
    "https://apis.data.go.kr/B554035/oprt-schd-info-v2/get-oprt-schd-info-v2",
    "https://apis.data.go.kr/B554035/oprtSchdInfo/get-oprt-schd-info-v2",
  ]

  const results: Record<string, unknown> = { date: today, psnshpNm }

  for (const base of BASE_CANDIDATES) {
    const params = new URLSearchParams({
      serviceKey: key,
      pageNo: "1",
      numOfRows: "200",
      dataType: "JSON",
      rlvtYmd: today,
      psnshpNm,
    })
    try {
      const res = await fetch(`${base}?${params}`, { cache: "no-store" })
      const text = await res.text()
      let json: unknown
      try { json = JSON.parse(text) } catch { json = text }
      results[base.split("/").slice(-2).join("/")] = {
        status: res.status,
        body: json,
      }
    } catch (e) {
      results[base.split("/").slice(-2).join("/")] = { error: String(e) }
    }
  }

  return NextResponse.json(results, { status: 200 })
}
