/**
 * TAGO 국내선박운항정보서비스 응답 테스트
 * 실행: node --env-file=.env.local scripts/test-tago.mjs
 */

const KEY = process.env.TAGO_API_KEY
if (!KEY) {
  console.error("❌ TAGO_API_KEY 없음 — .env.local 확인")
  process.exit(1)
}

async function call(url) {
  console.log(`\n📡 ${url.split("?")[0]}`)
  try {
    const res = await fetch(url)
    const text = await res.text()
    console.log("HTTP:", res.status)
    // JSON 응답
    try {
      const json = JSON.parse(text)
      const code = json?.response?.header?.resultCode
      const msg  = json?.response?.header?.resultMsg
      const body = json?.response?.body
      console.log(`결과코드: ${code} / ${msg}`)
      if (body) {
        console.log("totalCount:", body.totalCount)
        const item = body?.items?.item
        const first = Array.isArray(item) ? item[0] : item
        console.log("첫 번째 item:", JSON.stringify(first, null, 2))
      }
    } catch {
      console.log("Raw (500자):", text.slice(0, 500))
    }
  } catch (e) {
    console.log("네트워크 오류:", e.message)
  }
}

const qs = (params) =>
  new URLSearchParams({ serviceKey: KEY, _type: "json", numOfRows: "5", pageNo: "1", ...params }).toString()

// 후보 1 — 국내선박운항정보서비스 (가장 흔한 경로)
await call(`http://apis.data.go.kr/1613000/DmstcSvExaminSevice/getRouteList?${qs({ depPlaceNm: "완도" })}`)

// 후보 2 — 국내선박운항정보서비스 v2
await call(`http://apis.data.go.kr/1613000/DmstcSvExaminSevice2/getRouteList?${qs({ depPlaceNm: "완도" })}`)

// 후보 3 — 키 인코딩 없이 직접 삽입
await call(`http://apis.data.go.kr/1613000/DmstcSvExaminSevice/getTerminalList?serviceKey=${KEY}&_type=json&numOfRows=5&pageNo=1&depPlaceNm=완도`)

// 후보 4 — 파라미터 없이 전체 목록
await call(`http://apis.data.go.kr/1613000/DmstcSvExaminSevice/getRouteList?${qs({})}`)
