/**
 * TAGO 국내선박운항정보서비스 응답 테스트
 * 실행: node --env-file=.env.local scripts/test-tago.mjs
 */

const KEY = process.env.TAGO_API_KEY
if (!KEY) {
  console.error("❌ TAGO_API_KEY 없음 — .env.local 확인")
  process.exit(1)
}

const BASE = "http://apis.data.go.kr/1613000/DmstcSvExaminSevice"

async function call(operation, params = {}) {
  const qs = new URLSearchParams({
    serviceKey: KEY,
    _type: "json",
    numOfRows: "10",
    pageNo: "1",
    ...params,
  })
  const url = `${BASE}/${operation}?${qs}`
  console.log(`\n📡 GET ${operation}`)
  const res = await fetch(url)
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    const body = json?.response?.body
    console.log("totalCount:", body?.totalCount)
    console.log("items (첫 번째):", JSON.stringify(body?.items?.item?.[0] ?? body?.items, null, 2))
    return body
  } catch {
    console.log("Raw:", text.slice(0, 500))
  }
}

// 1. 완도 출발 터미널 조회
await call("getTerminalList", { depPlaceNm: "완도" })

// 2. 완도 출발 항로 목록 조회
await call("getRouteList", { depPlaceNm: "완도" })

// 3. 완도→제주 운항 시간표 (터미널 코드 확인 후 수정 필요)
// await call("getOperationList", { depPlaceNm: "완도", arrPlaceNm: "제주" })
