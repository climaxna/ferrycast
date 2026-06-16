/**
 * 기상청 단기예보 API 테스트
 * 완도 격자좌표: X=57, Y=74
 * 실행: node --env-file=.env.local scripts/test-kma.mjs
 */

const KEY = process.env.KMA_API_KEY
if (!KEY) {
  console.error("❌ KMA_API_KEY 없음 — .env.local 확인")
  process.exit(1)
}

console.log("🔑 키 앞 8자리:", KEY.slice(0, 8) + "...")

// 오늘 날짜 yyyyMMdd, 가장 가까운 발표시각 (0200/0500/0800/1100/1400/1700/2000/2300)
function getBaseDateTime() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const ymd =
    String(now.getFullYear()) +
    pad(now.getMonth() + 1) +
    pad(now.getDate())

  const hour = now.getHours()
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23]
  // 현재 시각보다 같거나 작은 가장 큰 발표시각 선택 (최소 1시간 여유)
  let baseHour = 23
  for (const h of baseTimes) {
    if (hour >= h + 1) baseHour = h
  }

  // 자정 이후 02시 이전이면 전날 23시 발표
  let baseDate = ymd
  if (hour < 3) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    baseDate =
      String(yesterday.getFullYear()) +
      pad(yesterday.getMonth() + 1) +
      pad(yesterday.getDate())
    baseHour = 23
  }

  return { baseDate, baseTime: pad(baseHour) + "00" }
}

async function call(label, url) {
  console.log(`\n📡 [${label}]`)
  console.log("URL:", url)
  try {
    const res = await fetch(url)
    const text = await res.text()
    console.log("HTTP:", res.status)
    try {
      const json = JSON.parse(text)
      const header = json?.response?.header
      console.log("resultCode:", header?.resultCode, "/", header?.resultMsg)
      const items = json?.response?.body?.items?.item
      if (!items) {
        console.log("body:", JSON.stringify(json?.response?.body, null, 2).slice(0, 300))
        return
      }
      const arr = Array.isArray(items) ? items : [items]
      console.log("총 item 수:", arr.length)
      // 카테고리별 첫 값 출력
      const seen = new Set()
      for (const it of arr) {
        if (!seen.has(it.category)) {
          seen.add(it.category)
          console.log(`  ${it.category}: ${it.fcstValue}  (${it.fcstDate} ${it.fcstTime})`)
        }
      }
    } catch {
      console.log("Raw:", text.slice(0, 400))
    }
  } catch (e) {
    console.log("오류:", e.message)
  }
}

const { baseDate, baseTime } = getBaseDateTime()
console.log(`\n📅 기준시각: ${baseDate} ${baseTime}`)

const base = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0"
const common = `serviceKey=${encodeURIComponent(KEY)}&dataType=JSON&numOfRows=100&pageNo=1`
const wando = `nx=57&ny=74`

// 단기예보
await call(
  "단기예보 (getVilageFcst)",
  `${base}/getVilageFcst?${common}&base_date=${baseDate}&base_time=${baseTime}&${wando}`
)

// 초단기실황
await call(
  "초단기실황 (getUltraSrtNcst)",
  `${base}/getUltraSrtNcst?${common}&base_date=${baseDate}&base_time=${baseTime}&${wando}`
)
