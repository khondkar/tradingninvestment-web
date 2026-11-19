import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(
  root,
  'public/images/social/research/amdl-return-drawdown-and-recovery-tni-og.png',
)

const funds = [
  { ticker: 'AMD', return: 77.30, color: '#536f5b' },
  { ticker: 'AMDL', return: 103.00, color: '#9c7840' },
  { ticker: 'NVDL', return: 32.57, color: '#667d9b' },
]
const chartLeft = 340
const chartWidth = 620
const chartTop = 322
const rowGap = 65
const scale = chartWidth / 120
const rows = funds.map((fund, index) => {
  const y = chartTop + index * rowGap
  const width = fund.return * scale
  return `
    <text x="270" y="${y + 4}" text-anchor="end" class="ticker">${fund.ticker}</text>
    <rect x="${chartLeft}" y="${y - 24}" width="${chartWidth}" height="30" rx="6" fill="#e5e8de" />
    <rect x="${chartLeft}" y="${y - 24}" width="${width.toFixed(1)}" height="30" rx="6" fill="${fund.color}" />
    <text x="${chartLeft + width + 15}" y="${y + 4}" class="value">+${fund.return.toFixed(2)}%</text>`
}).join('')

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6f7f0" />
  <rect width="14" height="630" fill="#92794e" />
  <text x="76" y="82" font-family="Georgia,serif" font-size="48" font-weight="bold" fill="#273c32">TNI</text>
  <text x="183" y="74" font-family="Arial,sans-serif" font-size="16" letter-spacing="3" fill="#92794e">TRADINGNINVESTMENT</text>
  <line x1="76" y1="108" x2="1124" y2="108" stroke="#d4d9cb" />
  <text x="76" y="154" font-family="Arial,sans-serif" font-size="16" letter-spacing="2" fill="#657360">AMDL RETURNS, DRAWDOWNS &amp; RECOVERY</text>
  <text x="76" y="207" font-family="Georgia,serif" font-size="42" fill="#273c32">AMD, AMDL &amp; NVDL compared</text>
  <text x="76" y="251" font-family="Arial,sans-serif" font-size="19" fill="#536253">2025 adjusted-close returns · price performance</text>
  ${rows}
  <line x1="76" y1="544" x2="1124" y2="544" stroke="#d4d9cb" />
  <text x="76" y="581" font-family="Arial,sans-serif" font-size="17" fill="#92794e">Daily leverage resets; multi-day returns can diverge from the stated multiple.</text>
  <text x="1124" y="608" text-anchor="end" font-family="Arial,sans-serif" font-size="14" fill="#657360">TNI ORIGINAL RESEARCH</text>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(output)
console.log(`Generated ${output}`)
