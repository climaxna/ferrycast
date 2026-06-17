import { NextResponse } from "next/server"

export async function GET() {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return NextResponse.json({ error: "DATAGOKR_API_KEY 없음" })

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  const bases = [2, 5, 8, 11, 14, 17, 20, 23]
  let refHour = kst.getUTCMinutes() >= 15 ? kst.getUTCHours() : kst.getUTCHours() - 1
  let refDate = new Date(kst)

  const candidates: Array<{ baseDate: string; baseTime: string }> = []
  while (candidates.length < 2) {
    const base = [...bases].reverse().find((b) => b <= refHour)
    if (base !== undefined) {
      const y = refDate.getUTCFullYear()
      const m = refDate.getUTCMonth() + 1
      const d = refDate.getUTCDate()
      candidates.push({ baseDate: `${y}${pad(m)}${pad(d)}`, baseTime: `${pad(base)}00` })
      refHour = base - 1
    } else {
      refDate = new Date(refDate.getTime() - 86400000)
      refHour = 23
    }
  }

  const results = []
  for (const { baseDate, baseTime } of candidates.slice(0, 1)) {
    for (const { nx, ny } of [{ nx: 57, ny: 74 }, { nx: 57, ny: 72 }]) {
      const params = new URLSearchParams({
        serviceKey: key, dataType: "JSON", numOfRows: "10", pageNo: "1",
        base_date: baseDate, base_time: baseTime, nx: String(nx), ny: String(ny),
      })
      const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?${params}`
      try {
        const res = await fetch(url, { cache: "no-store" })
        const json = await res.json()
        const resultCode = json?.response?.header?.resultCode ?? json?.header?.resultCode
        const resultMsg = json?.response?.header?.resultMsg ?? json?.header?.resultMsg
        results.push({ baseDate, baseTime, nx, ny, httpStatus: res.status, resultCode, resultMsg })
      } catch (e) {
        results.push({ baseDate, baseTime, nx, ny, error: String(e) })
      }
    }
  }

  return NextResponse.json({ kstNow: kst.toISOString(), results })
}
