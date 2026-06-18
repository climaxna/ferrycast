import { chromium } from "playwright"

const BASE = "http://localhost:3100"
const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
})
const page = await context.newPage()
await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(2500)
try {
  const btn = page.getByRole("button", { name: "닫기" })
  if (await btn.count()) await btn.first().click({ timeout: 1500 })
} catch {}
await page.waitForTimeout(400)

await page.getByText("완도 → 청산도").first().click({ timeout: 4000 })
await page.waitForTimeout(1200)
// viewport만 캡처 (모달 화면 그대로)
await page.screenshot({ path: "proposal-shots/04-route-detail.png" })
console.log("✅ 04-route-detail 재캡처 완료")
await browser.close()
