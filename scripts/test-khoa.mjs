/**
 * 국립해양조사원(KHOA) 조석예보 API 테스트
 * 키 발급: https://www.khoa.go.kr/api/oceangrid/intro.do
 * 실행: node --env-file=.env.local scripts/test-khoa.mjs
 */

const KEY = process.env.KHOA_API_KEY
if (!KEY) {
  console.error("❌ KHOA_API_KEY 없음 — .env.local에 KHOA_API_KEY=발급받은키 추가")
  process.exit(1)
}

console.log("🔑 키 앞 8자리:", KEY.slice(0, 8) + "...")

const today = new Date(Date.now() + 9 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10)
  .replace(/-/g, "")
console.log("📅 날짜:", today)

async function call(label, url) {
  console.log(`\n📡 [${label}]`)
  console.log("URL:", url.replace(KEY, KEY.slice(0, 8) + "..."))
  try {
    const res = await fetch(url)
    const text = await res.text()
    console.log("HTTP:", res.status)
    try {
      const json = JSON.parse(text)
      // KHOA 응답 형식
      if (json?.result?.data) {
        console.log("✅ 응답 성공!")
        const meta = json.result.meta
        console.log("관측소:", meta?.obs_post_name, "/", meta?.obs_post_id)
        const data = json.result.data
        console.log("데이터 행 수:", data.length)
        if (data.length > 0) {
          console.log("첫 번째 항목:", JSON.stringify(data[0], null, 2))
        }
        return
      }
      // 오류 응답
      if (json?.result?.error || json?.error) {
        console.log("❌ 오류:", JSON.stringify(json?.result?.error ?? json?.error))
        return
      }
      console.log("응답:", JSON.stringify(json).slice(0, 400))
    } catch {
      console.log("비-JSON 응답:", text.slice(0, 400))
    }
  } catch (e) {
    console.log("네트워크 오류:", e.message)
  }
}

const base = "https://www.khoa.go.kr/api/oceangrid"

// 완도 인근 예상 관측소 코드 후보
const obsCodes = [
  { code: "DW0011", name: "완도 추정1" },
  { code: "DW0018", name: "완도 추정2" },
  { code: "DT_0008", name: "완도 추정3" },
  { code: "WD0001", name: "완도 추정4" },
]

console.log("\n── 조석예보 API (tideObsPredicAPI) ──")
for (const { code, name } of obsCodes) {
  await call(
    `${name} (${code})`,
    `${base}/tideObsPredicAPI.do/json?ServiceKey=${KEY}&ObsCode=${code}&Date=${today}`
  )
}

// 관측소 목록 조회 시도
console.log("\n── 관측소 목록 조회 시도 ──")
await call(
  "관측소 목록",
  `${base}/obsSttnInfoAPI.do/json?ServiceKey=${KEY}&ObsCode=WD`
)
