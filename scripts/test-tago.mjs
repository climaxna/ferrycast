/**
 * TAGO 국내선박운항정보서비스 응답 테스트
 * 실행: node --env-file=.env.local scripts/test-tago.mjs
 */

const KEY = process.env.DATAGOKR_API_KEY
if (!KEY) {
  console.error("❌ DATAGOKR_API_KEY 없음 — .env.local 확인")
  process.exit(1)
}

console.log("🔑 키 앞 8자리:", KEY.slice(0, 8) + "...")

async function call(label, url) {
  console.log(`\n📡 [${label}]`)
  try {
    const res = await fetch(url)
    const text = await res.text()
    console.log("HTTP:", res.status)
    try {
      const json = JSON.parse(text)
      const header = json?.response?.header
      console.log("resultCode:", header?.resultCode, "/", header?.resultMsg)
      const body = json?.response?.body
      if (body?.totalCount !== undefined) console.log("totalCount:", body.totalCount)
      const item = body?.items?.item
      const first = Array.isArray(item) ? item[0] : item
      if (first) console.log("첫 번째 item:", JSON.stringify(first, null, 2))
    } catch {
      console.log("Raw:", text.slice(0, 300))
    }
  } catch (e) {
    console.log("오류:", e.message)
  }
}

// HTTPS 시도
const base = "https://apis.data.go.kr/1613000/DmstcSvExaminSevice"
const q = `serviceKey=${KEY}&_type=json&numOfRows=5&pageNo=1`

await call("HTTPS 항로목록", `${base}/getRouteList?${q}&depPlaceNm=완도`)
await call("HTTPS 터미널목록", `${base}/getTerminalList?${q}`)
await call("HTTPS 전체항로", `${base}/getRouteList?${q}`)

// HTTP 시도
const baseHttp = "http://apis.data.go.kr/1613000/DmstcSvExaminSevice"
await call("HTTP 항로목록", `${baseHttp}/getRouteList?${q}&depPlaceNm=완도`)
