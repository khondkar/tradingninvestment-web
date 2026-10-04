import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)

const siteOrigin = 'https://tradingninvestment.com'

const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let researchItems

try {
  ;({ researchItems } =
    await vite.ssrLoadModule(
      '/src/research/discovery.ts',
    ))
} finally {
  await vite.close()
}

const sortedItems = [...researchItems].sort(
  (a, b) =>
    a.title.localeCompare(b.title),
)

const llms = [
  '# TradingNInvestment',
  '',
  '> Independent financial research and market intelligence focused on historical market data, quantitative research, stocks, indexes, ETFs, returns, drawdowns, and market history.',
  '',
  'Canonical site: https://tradingninvestment.com/',
  'Research index: https://tradingninvestment.com/research/',
  '',
  '## Published Research',
  '',
  ...sortedItems.map(
    (item) =>
      `- [${item.title}](${siteOrigin}${item.path}): ${item.description}`,
  ),
  '',
  '## Research Areas',
  '',
  '- [Stock Research](https://tradingninvestment.com/research/stocks/)',
  '- [Index Research](https://tradingninvestment.com/research/indexes/)',
  '- [S&P 500 Research](https://tradingninvestment.com/research/indexes/sp-500/)',
  '- [Nasdaq Research](https://tradingninvestment.com/research/indexes/nasdaq/)',
  '- [Dow Jones Research](https://tradingninvestment.com/research/indexes/dow/)',
  '- [ETF Research](https://tradingninvestment.com/research/etfs/)',
  '- [Market History](https://tradingninvestment.com/research/market-history/)',
  '- [Market Risk](https://tradingninvestment.com/research/market-risk/)',
  '',
].join('\n')

const full = [
  '# TradingNInvestment Research Corpus',
  '',
  'TradingNInvestment publishes independent financial research and market intelligence.',
  '',
  'Each research item below has one canonical public URL.',
  '',
  ...sortedItems.flatMap(
    (item) => [
      `## ${item.title}`,
      '',
      `URL: ${siteOrigin}${item.path}`,
      `Type: ${item.kind}`,
      `Subject: ${item.name}`,
      ...(item.symbol
        ? [`Symbol: ${item.symbol}`]
        : []),
      `Description: ${item.description}`,
      '',
    ],
  ),
].join('\n')

fs.writeFileSync(
  path.join(root, 'public', 'llms.txt'),
  llms,
  'utf8',
)

fs.writeFileSync(
  path.join(root, 'public', 'llms-full.txt'),
  full,
  'utf8',
)

console.log(
  `TNI AI discovery generated: ${sortedItems.length} published research URLs`,
)
