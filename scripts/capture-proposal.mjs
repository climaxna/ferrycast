import { chromium } from "playwright"
import fs from "node:fs"

const BASE = process.env.CAP_BASE || "http://localhost:3100"
const OUT = "proposal-shots"
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
})
const page = await context.newPage()

async function go(path = "/") {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2500)
}
async function shot(name, opts = {}) {
  const p = `${OUT}/${name}.png`
  await page.screenshot({ path: p, ...opts })
  console.log("✅", p)
}
async function dismissBanner() {
  // 홈화면 추가 배너가 떠 있으면 닫기
  try {
    const btn = page.getByRole("button", { name: "닫기" })
    if (await btn.count()) await btn.first().click({ timeout: 1500 })
  } catch {}
  await page.waitForTimeout(400)
}

// 1) 메인 화면 (출발 탭) — 전체
await go("/")
await dismissBanner()
await shot("01-main", { fullPage: true })

// 2) 단기 날씨 예보 모달
try {
  await page.getByText("단기 날씨 예보").click({ timeout: 4000 })
  await page.waitForTimeout(1200)
  await shot("02-forecast")
  await page.keyboard.press("Escape")
  await page.waitForTimeout(600)
} catch (e) { console.log("⚠ forecast:", e.message) }

// 3) 5일 조석 예보 모달
try {
  await page.getByText("5일 조석 예보").click({ timeout: 4000 })
  await page.waitForTimeout(1200)
  await shot("03-tidal")
  await page.keyboard.press("Escape")
  await page.waitForTimeout(600)
} catch (e) { console.log("⚠ tidal:", e.message) }

// 4) 항로 상세 (청산도) — 시간표·운임·터미널
try {
  await page.getByText("완도 → 청산도").first().click({ timeout: 4000 })
  await page.waitForTimeout(1200)
  await shot("04-route-detail", { fullPage: true })
  await page.keyboard.press("Escape")
  await page.waitForTimeout(600)
} catch (e) { console.log("⚠ route-detail:", e.message) }

// 5) 완도 도착 탭
try {
  await page.getByRole("button", { name: "완도 도착" }).click({ timeout: 4000 })
  await page.waitForTimeout(1000)
  await shot("05-arrivals", { fullPage: true })
} catch (e) { console.log("⚠ arrivals:", e.message) }

// 6) QR 페이지
await go("/qr")
await dismissBanner()
await shot("06-qr")

await browser.close()
console.log("🎉 캡처 완료")
