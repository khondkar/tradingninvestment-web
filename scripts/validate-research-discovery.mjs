import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const graph = await vite.ssrLoadModule('/src/research/discovery.ts')
  const { ResearchHubPage } = await vite.ssrLoadModule('/src/components/research/ResearchDiscovery.tsx')
  const { researchHubs, researchItems, getHub, getHubItems, getResearchCompanies } = graph
  assert.equal(new Set(researchHubs.map((hub) => hub.path)).size, researchHubs.length, 'Duplicate research hub URLs')
  assert.equal(new Set(researchItems.map((item) => item.path)).size, researchItems.length, 'Duplicate canonical article URLs')
  for (const hub of researchHubs) {
    if (hub.parent) assert.ok(getHub(hub.parent), `Missing parent: ${hub.path}`)
    const markup = renderToStaticMarkup(React.createElement(ResearchHubPage, { hub }))
    assert.equal((markup.match(/<h1(?:\s|>)/g) || []).length, 1, `Expected one H1: ${hub.path}`)
    assert.ok(!markup.includes('undefined'), `Undefined content: ${hub.path}`)
    for (const [, href] of markup.matchAll(/href="([^"?#]+)[^\"]*"/g)) {
      if (href.startsWith('/research/')) assert.ok(getHub(href), `Broken research link ${href} on ${hub.path}`)
    }
    if (hub.path.includes('/topics/')) assert.ok(getHubItems(hub).length, `Empty topic: ${hub.path}`)
    if (hub.view === 'index') {
      const linkedStudies = [...markup.matchAll(/class="tni-r-study" href="([^"]+)"/g)].map((match) => match[1])
      for (const url of linkedStudies) {
        const item = researchItems.find((candidate) => candidate.path === url)
        assert.ok(item && !item.categories.includes('stock') && !item.categories.includes('etf'), `Company mixed into index features: ${url}`)
      }
    }
  }
  const companies = getResearchCompanies(researchItems)
  for (const company of companies) {
    const canonical = getHub(company.path)
    assert.ok(canonical, `Missing company hub: ${company.symbol}`)
    assert.equal(company.count, new Set(researchItems.filter((item) => item.categories.includes('stock') && item.symbol === company.symbol).map((item) => item.path)).size)
  }
  console.log(`Research validation passed: ${researchHubs.length} hubs, ${researchItems.length} canonical articles, ${companies.length} companies.`)
} finally { await vite.close() }
