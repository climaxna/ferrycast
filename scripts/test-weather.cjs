// Offline regression tests: no credentials or upstream API calls.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const modules = new Map()
let offset = 0
let mode = 'ok'
let requests = []
class Clock extends Date { static now() { return Date.now() + offset } }
function load(file) {
  file = path.resolve(file)
  if (modules.has(file)) return modules.get(file).exports
  const module = { exports: {} }
  modules.set(file, module)
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports, Date: Clock, URLSearchParams,
    process: { env: { DATAGOKR_API_KEY: 'test-only' } },
    console: { warn() {} },
    // Preserve abort semantics while shortening the test deadline.
    AbortSignal: { timeout: () => AbortSignal.timeout(25), any: AbortSignal.any.bind(AbortSignal) },
    fetch: async (url, init) => {
      requests.push(String(url))
      if (mode === 'timeout') return new Promise((resolve, reject) => {
        if (init.signal.aborted) return reject(init.signal.reason)
        init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true })
      })
      const parsed = new URL(url)
      const sky = parsed.pathname.endsWith('getUltraSrtFcst')
      return { ok: true, json: async () => ({ response: { header: { resultCode: '00' }, body: { items: { item: sky
        ? [{ category: 'SKY', fcstValue: '3' }]
        : ['T1H', 'REH', 'WSD', 'VEC', 'PTY', 'RN1'].map((category, i) => ({ category, obsrValue: mode === 'invalid' && i === 0 ? 'invalid' : String([27, 70, 2, 90, 0, 0][i]), baseDate: parsed.searchParams.get('base_date'), baseTime: parsed.searchParams.get('base_time') }))
      } } } }) }
    },
    require: spec => load(spec.startsWith('@/') ? `src/${spec.slice(2)}.ts` : path.resolve(path.dirname(file), `${spec}.ts`)),
  }, { filename: file })
  return module.exports
}
async function main() {
  const weather = load('src/lib/weather.ts')
  const regional = load('src/lib/regionWeather.ts')
  const config = { slug: 'test', weatherGrid: { nx: 57, ny: 74 }, seaGrids: [] }
  const result = await Promise.all([weather.getWandoWeather(), weather.getWandoWeather()])
  assert.equal(result[0].temp, 27)
  assert.equal(requests.length, 2, 'concurrent requests should share observation + sky')
  assert.ok(requests.every(url => !url.includes('getVilageFcst')), 'wave/5day must not block current weather')
  const regionalGood = await regional.getWeatherForRegion(config)
  assert.equal(regionalGood.temp, 27)
  offset = 6 * 60_000
  mode = 'timeout'
  requests = []
  const prior = await regional.getWeatherForRegion(config)
  assert.equal(prior.stale, true)
  assert.equal(prior.baseDate, regionalGood.baseDate)
  assert.equal(prior.baseTime, regionalGood.baseTime)
  assert.equal(requests.length, 2, 'do not start previous-hour retry after deadline')
  const cold = await regional.getWeatherForRegion({ ...config, slug: 'cold' })
  assert.equal(cold, null, 'cold instance must not invent observations')
  offset = 4 * 3_600_000
  assert.equal(await regional.getWeatherForRegion(config), null, 'expired observation must not be reused')
  mode = 'invalid'
  assert.equal(await regional.getWeatherForRegion({ ...config, slug: 'invalid' }), null)
  assert.equal(weather.ptyLabel(0, -1).text, '하늘정보 없음')
  mode = 'timeout'
  requests = []
  const forecasts = load('src/lib/regionForecast.ts')
  assert.equal((await forecasts.get5DayForecastForRegion([{ nx: 57, ny: 74 }, { nx: 57, ny: 72 }])).length, 0)
  assert.equal(requests.length, 1, 'forecast deadline must stop fallback grid/base loops')
  console.log('PASS: current-only, deduplication, timeout, stale timestamp, cold failure, expiry, invalid temperature, unknown sky')
}
// AbortSignal.timeout alone does not keep the Node process alive.
const keepAlive = setInterval(() => {}, 1000)
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => clearInterval(keepAlive))
