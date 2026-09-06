// Read-only smoke test against a running local or deployed build.
// Usage: node scripts/verify-guides.mjs http://localhost:3134
import assert from "node:assert/strict"

const base = process.argv[2] ?? "http://localhost:3134"
const slugs = ["wando-cheongsando", "wando-soan-bogil-nohwa", "wando-yaksan-islands", "jeju", "ulleung", "ferry-status", "fog-cancellation", "boarding-checklist"]
async function read(path, until) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(60000) })
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`)
  if (!until) return response.text()
  // Regional pages stream slow weather/API sections independently. This test
  // checks the static guide block, not completion or accuracy of those APIs.
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let html = ""
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })
      if (until.test(html)) break
    }
  } finally {
    await reader.cancel()
  }
  return html
}
const index = await read("/guide")
const knownGuides = new Set([...index.matchAll(/href="(\/guide\/[^"?#]+)"/g)].map(match => match[1]))
const sitemap = await read("/sitemap.xml")
for (const slug of slugs) {
  const path = `/guide/${slug}`
  const html = await read(path)
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1]
  assert.ok(article, `${path}: article missing`)
  assert.ok(knownGuides.has(path), `${path}: missing from index`)
  assert.ok(sitemap.includes(`https://ferrycast.kr${path}</loc>`), `${path}: missing from sitemap`)
  assert.ok(html.includes(`href="https://ferrycast.kr${path}"`), `${path}: canonical missing`)
  assert.ok(!/name="robots" content="[^"]*noindex/.test(html), `${path}: unexpectedly noindex`)
  assert.equal((article.match(/<h1\b/g) ?? []).length, 1, `${path}: H1 count`)
  assert.ok(article.includes("출처와 확인 범위"), `${path}: sources missing`)
  assert.ok(article.includes("2026-09-06"), `${path}: edit date missing`)
  const sections = [...article.matchAll(/<section\b[^>]*id="([^"]+)"/g)].map(match => match[1])
  assert.ok(sections.length >= 3, `${path}: editorial sections missing`)
  assert.equal(new Set(sections).size, sections.length, `${path}: duplicate section IDs`)
  for (const [, id] of article.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(sections.includes(id), `${path}: broken anchor ${id}`)
  }
  for (const [, href] of article.matchAll(/href="(\/guide\/[^"?#]+)"/g)) {
    assert.ok(knownGuides.has(href), `${path}: unknown related guide ${href}`)
  }
  const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  assert.ok(structured.length > 0, `${path}: structured data missing`)
  structured.forEach(([, json]) => JSON.parse(json))
  console.log(`PASS ${path}: body, sources, anchors, related links, metadata`)
}
for (const region of ["", "mokpo", "incheon", "jeju", "ulleung"]) {
  const html = await read(`/${region}`, /<section aria-labelledby="region-guide-heading"[^>]*>[\s\S]*?<\/section>/)
  const section = html.match(/<section aria-labelledby="region-guide-heading"[^>]*>([\s\S]*?)<\/section>/)?.[1]
  assert.ok(section, `/${region}: guide section missing`)
  const links = [...section.matchAll(/href="(\/guide\/[^"?#]+)"/g)]
  assert.equal(links.length, 3, `/${region}: expected three recommended guides`)
  links.forEach(([, href]) => assert.ok(knownGuides.has(href), `/${region}: unknown guide ${href}`))
  console.log(`PASS /${region}: three regional guide links`)
}
