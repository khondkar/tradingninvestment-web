// Reproduce chart images and the sourced CSV from the article's single dataset.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const study = JSON.parse(fs.readFileSync(path.join(root, 'src/data/research/megaIpoDebuts.json'), 'utf8'))
const returns = row => ({ offer: (row.close / row.offer - 1) * 100, open: (row.close / row.open - 1) * 100 })
const pct = value => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const fields = ['date', 'company', 'ticker', 'baseProceedsBillions', 'offer', 'open', 'close', 'offerToClosePct', 'openToClosePct', 'termsSource', 'openSource', 'closeSource', 'note']
const csv = [fields, ...study.rows.map(row => fields.map(key => {
  const result = returns(row)
  return key === 'offerToClosePct' ? result.offer.toFixed(6) : key === 'openToClosePct' ? result.open.toFixed(6) : row[key] ?? ''
}))].map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n') + '\n'
fs.mkdirSync(path.join(root, 'public/data'), { recursive: true })
fs.writeFileSync(path.join(root, 'public/data/mega-ipo-debut-returns-2022-2026.csv'), csv)

function svg(compact) {
  const h = compact ? 630 : 1120
  const start = compact ? 161 : 190
  const step = compact ? 27 : 55
  const bar = compact ? 7 : 15
  const font = compact ? 15 : 21
  const x = value => 330 + (value + 15) / 90 * 620
  const text = (a, b, label, size = font, color = '#15324a', weight = 750) => `<text x="${a}" y="${b}" font-size="${size}" font-weight="${weight}" fill="${color}">${escape(label)}</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${h}" viewBox="0 0 1200 ${h}"><rect width="1200" height="${h}" fill="#f6fafc"/><g font-family="DejaVu Sans,Arial,sans-serif"><rect width="1200" height="${compact ? 90 : 125}" fill="#102d44"/>${text(36, 28, 'TNI RESEARCH · 2022–2026 · 15 SELECTED IPOs', 17, '#8ce0d2')}${text(36, compact ? 65 : 76, 'A big IPO pop is not the opening buyer’s return.', compact ? 30 : 33, '#ffffff')}${compact ? '' : text(36, 107, 'Three largest eligible US IPOs per year · Cutoff November 17, 2026', 18, '#ffffff', 600)}${text(36, compact ? 110 : 143, 'Offer → close', 17, '#007d75')}${text(240, compact ? 110 : 143, 'Open → close', 17, '#152f4c')}${[-10, 0, 20, 40, 60].map(tick => `<line x1="${x(tick)}" x2="${x(tick)}" y1="${start - 19}" y2="${start + step * 15 - 8}" stroke="${tick === 0 ? '#718798' : '#d2e0e8'}"/>${text(x(tick) - 12, start - 24, `${tick}%`, 13, '#354e64', 650)}`).join('')}${study.rows.map((row, i) => {
    const y = start + step * i
    const r = returns(row)
    return text(36, y + (compact ? 10 : 20), `${row.company} · ${row.date.slice(0, 4)}`, font) + ['offer', 'open'].map((key, j) => {
      const value = r[key]
      return `<rect x="${Math.min(x(0), x(value))}" y="${y + j * (bar + 3)}" width="${Math.max(1, Math.abs(x(value) - x(0)))}" height="${bar}" rx="2" fill="${j === 0 ? '#007d75' : '#152f4c'}"/>` + text(980, y + j * (bar + 3) + bar, pct(value), compact ? 12 : 17, j === 0 ? '#006c65' : '#152f4c')
    }).join('')
  }).join('')}${text(36, h - 54, 'Median offer return +19.22% · Median opening-buyer return +3.03%', compact ? 20 : 24)}${text(36, h - 26, 'tradingninvestment.com/research/anthropic-ipo-debut-performance/ · Sources and methodology in article', 14, '#39566c', 600)}</g></svg>`
}
const directory = path.join(root, 'public/images/social/research')
fs.mkdirSync(directory, { recursive: true })
for (const [name, compact] of [['mega-ipo-debut-returns-2022-2026.png', false], ['anthropic-ipo-debut-performance-tni-og.png', true]]) {
  await sharp(Buffer.from(svg(compact))).png().toFile(path.join(directory, name))
}
console.log('Generated sourced IPO CSV and two data-driven PNGs')
