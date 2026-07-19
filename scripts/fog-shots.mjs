// 제안서용 해무(시계제한) 사례 스크린샷 — 로컬 프로덕션(localhost)에서 캡처
// 실행: PORT=3108 node scripts/fog-shots.mjs  (별도로 next start 3108 떠 있어야 함)
import { chromium } from "playwright"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, "..", "docs", "screenshots")
const BASE = process.env.BASE || "http://localhost:3108"

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR",
})
const page = await ctx.newPage()
await page.goto(BASE, { waitUntil: "networkidle" })
await page.getByText("완도 → 제주").first().waitFor({ timeout: 15000 })
await page.waitForTimeout(1200)

// A) 소안·보길·노화 카드 — 해무로 전편 결항 (노선 전체가 멈춘 극적 장면)
try {
  const card = page.locator("button", { hasText: "소안도" }).first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await card.screenshot({ path: path.join(OUT, "10_fog_soan_card.png") })
  console.log("saved 10_fog_soan_card.png")
} catch (e) { console.log("⚠ soan card:", e.message) }

// B) 약산 → 금일 카드 — 한 척만 운항, 나머지 결항 (편별 혼재 패턴)
try {
  const card = page.locator("button", { hasText: "약산 → 금일" }).first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await card.screenshot({ path: path.join(OUT, "11_fog_yaksan_card.png") })
  console.log("saved 11_fog_yaksan_card.png")
} catch (e) { console.log("⚠ yaksan card:", e.message) }

// C) 약산 → 금일 상세 — 결항 편별 선박명 + 시계제한 사유 박스
try {
  await page.locator("button", { hasText: "약산 → 금일" }).first().click()
  await page.waitForTimeout(1200)
  const box = page.locator("text=오늘 일부 편 결항").locator("xpath=ancestor::div[1]")
  await box.screenshot({ path: path.join(OUT, "12_fog_yaksan_detail.png") })
  console.log("saved 12_fog_yaksan_detail.png")
  await page.keyboard.press("Escape")
} catch (e) { console.log("⚠ yaksan detail:", e.message) }

await ctx.close()
await browser.close()
console.log("🎉 해무 사례 캡처 완료")
