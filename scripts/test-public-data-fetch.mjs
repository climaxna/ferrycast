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

// 날씨 상세 API(/api/weather/details)를 검증하던 테스트 2개는 2026-09 날씨 기능 폐기와 함께
// 제거했다 — 대상 라우트 파일(src/app/api/weather/details/route.ts)이 더 이상 존재하지 않는다.
// publicDataFetch.ts는 mtis.ts 등 배편 데이터 경로가 계속 쓰는 공용 유틸이라 위 4개는 유지한다.
