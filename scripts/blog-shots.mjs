// FerryCast 블로그 홍보글용 스크린샷 — 라이브 프로덕션(ferrycast.kr)에서 최신 기능 캡처
// 실행: node scripts/blog-shots.mjs
import { chromium } from "playwright"
import { fileURLToPath } from "url"
import path from "path"
import fs from "node:fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, "..", "docs", "blog-shots")
fs.mkdirSync(OUT, { recursive: true })
const BASE = "https://ferrycast.kr"
const VIEW = { width: 390, height: 844 }

async function shot(page, name, opts = {}) {
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(OUT, name), ...opts })
  console.log("saved", name)
}

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  viewport: VIEW, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR",
})
const page = await ctx.newPage()

// 1) 완도 메인 — 클릭 없이 한눈에
await page.goto(BASE, { waitUntil: "networkidle" })
await page.getByText("완도 → 제주").first().waitFor({ timeout: 15000 })
await page.waitForTimeout(1200)
await shot(page, "01_main.png", { fullPage: true })

// 2) 완도 → 제주 카드 확대 — 비운항(선박검사) 칩 신규 기능
try {
  const card = page.locator("button", { hasText: "완도 → 제주" }).first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await card.screenshot({ path: path.join(OUT, "02_jeju_card.png") })
  console.log("saved 02_jeju_card.png")
} catch (e) { console.log("⚠ jeju card:", e.message) }

// 3) 제주 상세 — 직항/경유 구분 + 부분 결항 블록 + 운임 링크
// (주의: RouteDetail은 position:fixed 전체화면 모달이라 fullPage 스크린샷은 쓰지 않는다 —
//  Playwright가 fixed 요소를 문서 전체 높이 캡처에서 한 번만 반영해 뒤쪽 페이지 내용이 이어붙는 버그가 있음)
try {
  await page.locator("button", { hasText: "완도 → 제주" }).first().click()
  await page.waitForTimeout(1200)
  await shot(page, "03_route_detail.png")
  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)
} catch (e) { console.log("⚠ route detail:", e.message) }

// 4) 날씨 카드 — 요소 단독 캡처 (메인 화면 캡처 재사용 시 이전 상호작용의 포커스 링이 남을 수 있어 새로고침 후 촬영)
try {
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.getByText("완도 → 제주").first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(800)
  const weatherCard = page.locator("text=다음 조석").locator("xpath=ancestor::*[contains(@class,'rounded-2xl')][1]").first()
  await weatherCard.screenshot({ path: path.join(OUT, "04_weather.png") })
  console.log("saved 04_weather.png")
} catch (e) { console.log("⚠ weather:", e.message) }

// 5) 조석 곡선 그래프
try {
  await page.getByText("5일 조석 예보").first().click()
  await page.getByText("완도 5일 조석 예보").first().waitFor({ timeout: 8000 }).catch(() => {})
  await shot(page, "05_tide.png")
  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)
} catch (e) { console.log("⚠ tide:", e.message) }

// 6) 지역 이동 바 — 완도 외 포항·목포·인천 확장
try {
  await page.getByText("다른 지역").first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  const nav = page.locator("nav[aria-label='지역 이동']")
  await nav.screenshot({ path: path.join(OUT, "06_region_nav.png") })
  console.log("saved 06_region_nav.png")
} catch (e) { console.log("⚠ region nav:", e.message) }

// 7) 인천 페이지 — 덕적도·대이작도 신규 노선
try {
  await page.goto(`${BASE}/incheon`, { waitUntil: "networkidle" })
  await page.getByText("백령도").first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(1200)
  await shot(page, "07_incheon.png", { fullPage: true })
} catch (e) { console.log("⚠ incheon:", e.message) }

// 8) QR 안내물
try {
  await page.goto(`${BASE}/qr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(1500)
  await shot(page, "08_qr.png", { fullPage: true })
} catch (e) { console.log("⚠ qr:", e.message) }

await ctx.close()
await browser.close()
console.log("🎉 블로그 스크린샷 캡처 완료:", OUT)
