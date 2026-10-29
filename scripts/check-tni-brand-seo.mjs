// Validate the final homepage HTML after all static generators and finalizers.
// No network access and no edits to output. Missing/inconsistent identity fails the build.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const about = fs.readFileSync(path.join(dist, 'about/index.html'), 'utf8')
const origin = 'https://tradingninvestment.com/'
const orgId = origin + '#organization'
const siteId = origin + '#website'

function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map(m => [m[1].toLowerCase(), m[3]]))
}
function meta(html, key, value) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0])).filter(a => a[key] === value)
}
function canonical(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0])).filter(a => a.rel === 'canonical')
}
function brand(html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(m => attrs(m[1]).id === 'tni-brand-schema')
  assert.equal(scripts.length, 1, 'Expected exactly one TNI brand graph')
  assert.equal(attrs(scripts[0][1]).type, 'application/ld+json')
  const data = JSON.parse(scripts[0][2])
  assert.equal(data['@context'], 'https://schema.org')
  const org = data['@graph'].filter(n => n['@type'] === 'Organization')
  const site = data['@graph'].filter(n => n['@type'] === 'WebSite')
  assert.equal(org.length, 1); assert.equal(site.length, 1)
  for (const node of [org[0], site[0]]) {
    assert.equal(node.name, 'TNI')
    assert.ok(node.alternateName.includes('TradingNInvestment'))
    assert.equal(node.url, origin)
  }
  assert.equal(org[0]['@id'], orgId)
  assert.equal(site[0]['@id'], siteId)
  assert.equal(site[0].publisher['@id'], orgId)
  return data
}

const homeBrand = brand(home)
assert.deepEqual(brand(about), homeBrand, 'About and homepage must identify the same brand')
for (const [html, url] of [[home, origin], [about, origin + 'about/']]) {
  const names = meta(html, 'property', 'og:site_name')
  assert.equal(names.length, 1); assert.equal(names[0].content, 'TNI')
  const urls = canonical(html)
  assert.equal(urls.length, 1); assert.equal(urls[0].href, url)
  const descriptions = meta(html, 'name', 'description')
  assert.equal(descriptions.length, 1)
  assert.ok(descriptions[0].content.includes('TradingNInvestment'))
  assert.ok(descriptions[0].content.includes('TNI'))
}
const titles = [...home.matchAll(/<title>([\s\S]*?)<\/title>/gi)]
assert.equal(titles.length, 1)
assert.ok(titles[0][1].startsWith('TNI'))
for (const [key, value] of [['property','og:title'], ['name','twitter:title']]) {
  const tags = meta(home, key, value)
  assert.equal(tags.length, 1); assert.equal(tags[0].content, titles[0][1])
}
assert.ok(home.includes('id="featured-research"'), 'Homepage research content must remain prerendered')
assert.ok(about.includes('TradingNInvestment (TNI) turns financial data'), 'About must explain the acronym visibly')
console.log('TNI brand checks passed: preferred name, alternate name, organization identity, metadata and canonical URLs.')
