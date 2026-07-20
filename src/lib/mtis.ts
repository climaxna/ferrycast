import { cache } from "react"
import type { RouteStatus } from "./types"

// ────────────────────────────────────────────────────────────
// MTIS 운항 스케줄 API — 완도(ferry.ts)·다지역(regionFerry.ts) 공용 코어.
//
// 결항/시간표 파싱, 운항구분 판정, 조회·캐시를 여기 한곳에 두고 두 소비자가 공유한다.
// (예전엔 두 파일에 동일 로직이 복제돼 수정 때마다 병행 편집 → 어긋남 위험이 있었다.)
// Base URL: /B554035/oprt-schd-info-v2 · 성공코드 resultCode==="200"(KOMSA 계열, "00" 아님).
// ────────────────────────────────────────────────────────────

const MTIS_BASE = "https://apis.data.go.kr/B554035/oprt-schd-info-v2/get-oprt-schd-info-v2"

// 운항 스케줄 API는 전국 여객선을 반환(일 ~700건). numOfRows를 크게 주면 전건을
// 단일 페이지로 수신(검증) → 페이지 분할로 오후·저녁편이 밀려 누락되던 문제를 원천 차단.
const MTIS_PAGE_SIZE = 2000
const MTIS_MAX_PAGES = 5 // 안전 상한 (최대 10000건)

export interface MtisItem {
  sail_tm: string       // 출항시각 HHMM, 앞자리 0 없음 ("700"=07:00, "1430"=14:30)
  oport_nm: string      // 출발항명
  dest_nm: string       // 도착항명
  nvg_stts_nm: string   // 진행상태: "출항전" | "운항중" | "완료" | (드물게) "결항"
  nvg_se_cd?: string    // 운항구분코드: 1=정상 2=증선 3=증회 4=비운 5=통제 6=대기/지연
  nvg_se_nm?: string    // 운항구분명: "정상"|"증선"|"증회"|"비운"|"통제"|"대기/지연"
                        //   6(대기/지연)은 운항 취급 — 해무 통제 해제 후 지연 재개한 배 등 (2026.07 약산 평화페리9호 실측)
  psnshp_nm: string     // 여객선명
  nvg_seawy_nm: string  // 운항항로명 (예: "제주완도"=직항, "제주추자도-완도"=추자도 경유)
  cntrl_rsn_nm?: string | null  // 통제사유 (예: "풍랑주의보") — 기상 통제(결항) 사유
  nnavi_rsn_nm?: string | null  // 미운항사유 (예: "선박검사", "선박정비") — 비운 사유
}

// 부분 결항편 1건 (시각·사유·성격·경유지·선박명)
// ship: 여러 척이 교대 운항하는 노선(약산↔금일 등)에서 "왜 이 편만 결항?"의 답이 선박별
// 통제 차이일 때가 있어(해무 후 한 척만 재개 등) 상세 화면에서 선박명을 함께 보여준다.
export type CancelledEntry = { time: string; reason?: string; suspended?: boolean; via?: string; ship?: string }

// ────────────────────────────────────────────────
// 운항 여부 판정
// ────────────────────────────────────────────────

// 실제 미운항(=배 안 뜸) 판정. MTIS 진행상태(nvg_stts_nm)의 "결항"은 오늘자 267편 중
// 0건일 만큼 드물게만 나타난다. 실제 운항 여부를 가르는 권위 필드는 운항구분(nvg_se_nm):
//   정상·증선·증회 = 운항 / 비운(선박검사·정비·휴항)·통제(풍랑 등 기상) = 미운항.
// (전국 689편 교차검증: 비운·통제 267편은 전부 출항전, 완료·운항중 편은 전부 정상)
// ⚠️ nnavi_rsn_nm(선박검사 등)은 정상 운항편에도 붙는 노이즈라 결항 판정에 쓰지 말 것.
export function isCancelled(it: MtisItem): boolean {
  return it.nvg_se_cd === "4" || it.nvg_se_cd === "5"
    || it.nvg_se_nm === "비운" || it.nvg_se_nm === "통제"
    || it.nvg_stts_nm === "결항"
}

// 비운(계획된 미운항: 선박검사·정비·휴항 = "비운항") vs 통제(기상 = "결항") 구분.
// 비운이면 true → UI에서 "비운항", 아니면(통제·결항) false → "결항".
export function isSuspended(it: MtisItem): boolean {
  return it.nvg_se_cd === "4" || it.nvg_se_nm === "비운"
}

// 전편 미운항일 때 노선 성격 — 기상 통제(결항)가 하나라도 섞이면 "cancelled", 전부 계획 비운이면 "suspended".
export function cancelKindOf(items: MtisItem[]): "cancelled" | "suspended" {
  const cancelled = items.filter(isCancelled)
  return cancelled.length > 0 && cancelled.every(isSuspended) ? "suspended" : "cancelled"
}

// 일부 편만 결항이면 정상 운항편이 있으므로 "operating". 전편 결항일 때만 "cancelled".
export function groupStatus(items: MtisItem[]): RouteStatus {
  if (items.length === 0) return "unknown"
  if (items.some((it) => !isCancelled(it))) return "operating"
  return "cancelled"
}

// 한 편의 결항 사유 (통제사유 우선, 없으면 미운항사유)
export function itemReason(it: MtisItem): string | undefined {
  const r = it.cntrl_rsn_nm || it.nnavi_rsn_nm
  return r && r !== "null" ? r : undefined
}

// 결항편 목록에서 대표 사유 추출 (기상 통제사유 우선, 없으면 미운항사유)
export function cancelReason(items: MtisItem[]): string | undefined {
  for (const it of items) {
    if (!isCancelled(it)) continue
    const r = itemReason(it)
    if (r) return r
  }
  return undefined
}

// ────────────────────────────────────────────────
// 시각·경유 유틸
// ────────────────────────────────────────────────

// "700" → "07:00", "1430" → "14:30"
export function parseSailTime(raw: string): string {
  const s = raw.padStart(4, "0")
  return `${s.slice(0, 2)}:${s.slice(2)}`
}

// 동일 선착장에서 5분 이내 출항 편은 하나로 병합 (예: 18:00 / 18:01 → 18:00)
export function deduplicateTimes(times: string[]): string[] {
  const sorted = [...new Set(times)].sort()
  const result: string[] = []
  for (const t of sorted) {
    const [h, m] = t.split(":").map(Number)
    const mins = h * 60 + m
    const hasSimilar = result.some((r) => {
      const [rh, rm] = r.split(":").map(Number)
      return Math.abs(rh * 60 + rm - mins) < 5
    })
    if (!hasSimilar) result.push(t)
  }
  return result
}

// 부분 결항편 정리 — 정상편과 5분 이내 겹치면 제외(정상 우선), 결항편끼리도 5분 병합, 시각순.
export function partialCancelled(cancelled: CancelledEntry[], operating: string[]): CancelledEntry[] {
  const min = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m }
  const opMins = operating.map(min)
  const out: CancelledEntry[] = []
  for (const c of [...cancelled].sort((a, b) => min(a.time) - min(b.time))) {
    const cm = min(c.time)
    if (opMins.some((o) => Math.abs(o - cm) < 5)) continue
    if (out.some((o) => Math.abs(min(o.time) - cm) < 5)) continue
    out.push(c)
  }
  return out
}

// 운항항로명에서 출발·도착항명(및 추가 키워드)을 제거해 남는 기항지(경유지)를 추출.
//   "제주추자도-완도" → (제주·완도 제거) → "추자도"  (경유)
//   "제주완도"        → ""                          (직항 → null)
// extraKeywords: 지역 config의 depPortKeywords·destKeywords 등, oport/dest 외에 지울 항명.
export function extractVia(item: MtisItem, extraKeywords: string[] = []): string | null {
  let s = (item.nvg_seawy_nm || "").replace(/\(.*?\)/g, "") // 괄호 라벨 제거
  for (const p of [item.oport_nm, item.dest_nm, ...extraKeywords]) {
    if (p) s = s.split(p).join("")
  }
  s = s.replace(/[-\s]/g, "").trim()
  return s.length > 0 ? s : null
}

// YYYYMMDD → 다음날 YYYYMMDD
export function nextDay(date: string): string {
  const y = +date.slice(0, 4), m = +date.slice(4, 6), d = +date.slice(6, 8)
  const dt = new Date(Date.UTC(y, m - 1, d + 1))
  return dt.toISOString().slice(0, 10).replace(/-/g, "")
}

// ────────────────────────────────────────────────
// 조회 + 캐시
// ────────────────────────────────────────────────

async function fetchMtisPage(
  key: string,
  date: string,
  pageNo: number,
): Promise<{ items: MtisItem[]; totalCount: number }> {
  const params = new URLSearchParams({
    serviceKey: key, pageNo: String(pageNo), numOfRows: String(MTIS_PAGE_SIZE),
    dataType: "JSON", rlvtYmd: date,
  })
  // 각 실패 지점에 원인 로그 — fallback("참고 시간표") 전환 시 Vercel 로그에서 이유를 바로 확인
  const empty = { items: [] as MtisItem[], totalCount: 0 }
  let res: Response
  try {
    res = await fetch(`${MTIS_BASE}?${params}`, { next: { revalidate: 300 } })
  } catch (e) {
    console.error(`[mtis] ${date} p${pageNo} fetch 실패(네트워크·타임아웃):`, e)
    return empty
  }
  if (!res.ok) {
    console.error(`[mtis] ${date} p${pageNo} HTTP ${res.status} ${res.statusText}`)
    return empty
  }
  // 쿼터 초과 시 JSON이 아닌 plain text("API token quota exceeded")를 반환 → 파싱 가드
  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    console.error(`[mtis] ${date} p${pageNo} JSON 파싱 실패(쿼터 초과 의심). 응답 앞부분: ${text.slice(0, 160)}`)
    return empty
  }
  const j = json as { response?: { header?: { resultCode?: string; resultMsg?: string }; body?: { items?: { item?: unknown }; totalCount?: number } } }
  const code = j?.response?.header?.resultCode
  if (code !== "200") {
    console.error(`[mtis] ${date} p${pageNo} resultCode=${code ?? "없음"} msg=${j?.response?.header?.resultMsg ?? "-"}`)
    return empty
  }
  const body = j?.response?.body
  const raw = body?.items?.item
  const items = (Array.isArray(raw) ? raw : raw ? [raw] : []) as MtisItem[]
  const totalCount = Number(body?.totalCount ?? items.length)
  return { items, totalCount }
}

// 전국 스케줄 수집 — 평상시 단일 페이지(numOfRows=2000)로 전건 수신.
// totalCount가 페이지 크기를 넘는 예외적 경우에만 추가 페이지를 병합한다.
async function fetchMtisAll(key: string, date: string): Promise<MtisItem[]> {
  const first = await fetchMtisPage(key, date, 1)
  const items = [...first.items]
  const totalPages = Math.min(Math.ceil(first.totalCount / MTIS_PAGE_SIZE), MTIS_MAX_PAGES)
  if (totalPages > 1) {
    const rest = await Promise.allSettled(
      Array.from({ length: totalPages - 1 }, (_, i) => fetchMtisPage(key, date, i + 2)),
    )
    for (const r of rest) {
      if (r.status === "fulfilled") items.push(...r.value.items)
    }
  }
  return items
}

// 요청(렌더) 단위 메모이제이션 — 출발·도착이 같은 날짜 데이터를 공유해 fetchMtisAll
// 중복 호출(출발/도착 × 오늘/내일)을 줄인다. 내부 fetch는 next:{revalidate:300}로
// 요청 간(=사용자 간) Data Cache도 적용됨. ⚠️ fetchMtisAll 직접 호출 금지, getMtisDay 사용.
export const getMtisDay = cache((key: string, date: string): Promise<MtisItem[]> => fetchMtisAll(key, date))

// 내일 스케줄을 groupKey별 times + 편수로 집계 (결항 편 제외, 5분 이내 중복 병합)
export async function fetchTomorrowData(
  key: string,
  todayDate: string,
  keyFn: (item: MtisItem) => string | null,
): Promise<Record<string, { tripCount: number; times: string[] }>> {
  const timesPerGroup: Record<string, string[]> = {}
  try {
    const items = await getMtisDay(key, nextDay(todayDate))
    for (const it of items) {
      if (isCancelled(it)) continue
      const gk = keyFn(it)
      if (!gk) continue
      if (!timesPerGroup[gk]) timesPerGroup[gk] = []
      timesPerGroup[gk].push(parseSailTime(it.sail_tm))
    }
  } catch {
    // 내일 데이터는 부가 정보 — 실패해도 오늘 데이터에 영향 없음
  }
  return Object.fromEntries(
    Object.entries(timesPerGroup).map(([gk, rawTimes]) => {
      const times = deduplicateTimes(rawTimes)
      return [gk, { tripCount: times.length, times }]
    }),
  )
}
