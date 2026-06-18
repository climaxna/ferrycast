import { NextResponse } from "next/server"

// 임시 테스트용 — MTIS 운항 스케줄 API 검증
// https://ferrycast.kr/api/test-mtis

const BASE = "https://apis.data.go.kr/B554035/oprt-schd-info-v2/get-oprt-schd-info-v2"

async function fetchSchedule(key: string, today: string, psnshpNm: string) {
  const params = new URLSearchParams({
    serviceKey: key,
    pageNo: "1",
    numOfRows: "200",
    dataType: "JSON",
    rlvtYmd: today,
    psnshpNm,
  })
  const res = await fetch(`${BASE}?${params}`, { cache: "no-store" })
  const json = await res.json()
  const rc = json?.response?.header?.resultCode
  const raw = json?.response?.body?.items?.item
  const items = Array.isArray(raw) ? raw : raw ? [raw] : []
  return { resultCode: rc, count: items.length, items }
}

export async function GET() {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return NextResponse.json({ error: "API 키 없음" }, { status: 500 })

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const today = kst.toISOString().slice(0, 10).replace(/-/g, "")

  // 여러 선박명 테스트
  const targets = ["", "슬로시티청산도호", "청산아일랜드호", "섬사랑7호", "대한호", "민국호", "실버클라우드"]
  const results: Record<string, unknown> = { date: today }

  for (const name of targets) {
    try {
      results[name || "(전체)"] = await fetchSchedule(key, today, name)
    } catch (e) {
      results[name || "(전체)"] = { error: String(e) }
    }
  }

  // 완도 관련 전체 필터링
  const allResult = results["(전체)"] as { items?: unknown[] } | undefined
  const wandoItems = (allResult?.items ?? []).filter((item) =>
    /완도|청산|소안|보길|노화|화흥/.test(JSON.stringify(item))
  )
  results["★완도관련필터"] = { count: wandoItems.length, items: wandoItems }

  return NextResponse.json(results)
}
