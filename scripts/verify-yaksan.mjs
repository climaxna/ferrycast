/**
 * 약산 ↔ 금일 / 약산 ↔ 생일 노선이 MTIS 운항 스케줄 API에 실시간 등록돼 있는지 검증.
 * 실행: node --env-file=.env.local scripts/verify-yaksan.mjs
 *
 * 관련 지명:
 *   약산도 = 당목항(당목)          금일도 = 일정항(일정)
 *   생일도 = 서성항(서성)
 */
const KEY = process.env.DATAGOKR_API_KEY
if (!KEY) { console.error("❌ DATAGOKR_API_KEY 없음"); process.exit(1) }

const BASE = "https://apis.data.go.kr/B554035/oprt-schd-info-v2/get-oprt-schd-info-v2"
const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
const TODAY = kst.toISOString().slice(0, 10).replace(/-/g, "")

// 약산/금일/생일 관련 지명 — 항명·섬명 모두 포함
const KEYWORDS = ["약산", "금일", "생일", "당목", "일정", "서성", "동송", "화양", "율포"]

async function fetchAll(date) {
  const p = new URLSearchParams({
    serviceKey: KEY, pageNo: "1", numOfRows: "2000", dataType: "JSON", rlvtYmd: date,
  })
  const res = await fetch(`${BASE}?${p}`, { signal: AbortSignal.timeout(15000) })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { console.log("JSON 파싱 실패:", text.slice(0, 200)); return [] }
  if (json?.response?.header?.resultCode !== "200") {
    console.log("resultCode:", json?.response?.header?.resultCode, json?.response?.header?.resultMsg)
    return []
  }
  const raw = json?.response?.body?.items?.item
  return Array.isArray(raw) ? raw : raw ? [raw] : []
}

console.log("📅 조회 날짜:", TODAY)
const all = await fetchAll(TODAY)
console.log("🚢 전국 전체 편수:", all.length)

// 키워드 매칭 (출발항 또는 도착항)
const matched = all.filter((it) => {
  const s = `${it.oport_nm ?? ""}|${it.dest_nm ?? ""}|${it.nvg_seawy_nm ?? ""}`
  return KEYWORDS.some((k) => s.includes(k))
})

console.log(`\n🎯 약산/금일/생일 관련 매칭: ${matched.length}건\n`)

// 출발→도착 쌍으로 그룹핑해 요약
const pairs = {}
for (const it of matched) {
  const pk = `${it.oport_nm} → ${it.dest_nm}`
  if (!pairs[pk]) pairs[pk] = []
  pairs[pk].push(it)
}

for (const [pk, items] of Object.entries(pairs).sort()) {
  const ship = [...new Set(items.map((i) => i.psnshp_nm))].join(", ")
  const times = items.map((i) => i.sail_tm).map((t) => String(t).padStart(4, "0")).sort()
  const seaway = [...new Set(items.map((i) => i.nvg_seawy_nm))].join(" / ")
  console.log(`■ ${pk}`)
  console.log(`   선박: ${ship}`)
  console.log(`   운항항로명: ${seaway}`)
  console.log(`   편수: ${items.length}  시각: ${times.join(", ")}`)
  console.log(`   상태: ${[...new Set(items.map((i) => i.nvg_stts_nm))].join(", ")}`)
  console.log("")
}

if (matched.length > 0) {
  console.log("─── 샘플 item 전체 필드 ───")
  console.log(JSON.stringify(matched[0], null, 2))
}

// 완도군 소속으로 보이는 지명 전수 스캔 (놓친 항명 확인용)
console.log("\n─── 전체 데이터의 완도권 의심 지명 (금일/약산/생일 인접 참고) ───")
const portSet = new Set()
for (const it of all) {
  const s = `${it.oport_nm}|${it.dest_nm}`
  if (/당목|일정|서성|약산|금일|생일|동송|평일|화양|율포|신지|고금|조약/.test(s)) {
    portSet.add(`${it.oport_nm} ⇔ ${it.dest_nm}`)
  }
}
console.log([...portSet].sort().join("\n") || "(없음)")
