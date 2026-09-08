// No external API calls or credentials: exercise transport failures deterministically.
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"
import ts from "typescript"

const source = await readFile(new URL("../src/lib/publicDataFetch.ts", import.meta.url), "utf8")
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
const { fetchPublicData } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)

test("cached fetch options survive; concurrent callers get independent bodies", async (t) => {
  let calls = 0
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    calls++
    assert.equal(options.next.revalidate, 600)
    assert.ok(options.signal instanceof AbortSignal)
    return new Response('{"ok":true}')
  })
  const [a, b] = await Promise.all([fetchPublicData("https://test.invalid/ok", { next: { revalidate: 600 } }), fetchPublicData("https://test.invalid/ok", { next: { revalidate: 600 } })])
  assert.equal(calls, 1)
  assert.deepEqual(await a.json(), { ok: true })
  assert.deepEqual(await b.json(), { ok: true })
  await fetchPublicData("https://test.invalid/ok", { next: { revalidate: 600 } })
  assert.equal(calls, 2, "settled requests must not become an unbounded memory cache")
})

test("a broken response body rejects inside the fetch boundary and can recover", async (t) => {
  let calls = 0
  t.mock.method(globalThis, "fetch", async () => {
    if (++calls > 1) return new Response("recovered")
    return new Response(new ReadableStream({ start(controller) { controller.error(new Error("body reset")) } }))
  })
  await assert.rejects(fetchPublicData("https://test.invalid/reset"), /body reset/)
  assert.equal(await (await fetchPublicData("https://test.invalid/reset")).text(), "recovered")
})

test("deadline aborts stalled body after headers, without waiting eight real seconds", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] })
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => new Response(new ReadableStream({
    start(controller) { signal.addEventListener("abort", () => controller.error(new Error("deadline")), { once: true }) },
  })))
  const result = assert.rejects(fetchPublicData("https://test.invalid/slow"), /deadline/)
  await Promise.resolve()
  t.mock.timers.tick(8_000)
  await result
})

test("HTTP failures are preserved for existing retry/fallback decisions", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("rate limited", { status: 429 }))
  const result = await fetchPublicData("https://test.invalid/limited")
  assert.equal(result.status, 429)
  assert.equal(await result.text(), "rate limited")
})

const routeSource = await readFile(new URL("../src/app/api/weather/details/route.ts", import.meta.url), "utf8")
const routeCode = ts.transpileModule(routeSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText
function detailsRoute({ forecast = [{ date: "20260908" }], tideFailure = false } = {}) {
  const tides = Array.from({ length: 5 }, () => ({ events: [{ time: "12:00" }] }))
  const mocks = {
    NextResponse: Response,
    REGIONS: { incheon: { weatherGrid: {}, seaGrids: [], tidalObsCode: "test" } },
    get5DayForecast: async () => forecast,
    get5DayForecastForRegion: async () => forecast,
    getTidalForecast: async () => tides[0],
    getTidalForRegion: async () => tides[0],
    get5DayTidalForecast: async () => tideFailure ? Array.from({ length: 5 }, () => ({ events: [] })) : tides,
    get5DayTidalForRegion: async () => { if (tideFailure) throw new Error("upstream failed"); return tides },
  }
  const module = { exports: {} }
  new Function("require", "module", "exports", routeCode)(() => mocks, module, module.exports)
  return module.exports.GET
}
const request = (region = "") => ({ nextUrl: new URL(`https://test.invalid/api/weather/details${region ? `?region=${region}` : ""}`) })

test("complete details can be cached; unknown regions are rejected", async () => {
  const get = detailsRoute()
  const response = await get(request("incheon"))
  assert.equal((await response.json()).partial, false)
  assert.match(response.headers.get("cache-control"), /s-maxage=600/)
  assert.equal((await get(request("unknown"))).status, 400)
})

test("failed tide data keeps successful forecasts, is retryable and not cached", async () => {
  for (const region of ["", "incheon"]) {
    const response = await detailsRoute({ tideFailure: true })(request(region))
    const data = await response.json()
    assert.equal(data.forecast5.length, 1)
    assert.equal(data.partial, true)
    assert.equal(response.headers.get("cache-control"), "no-store")
  }
})
