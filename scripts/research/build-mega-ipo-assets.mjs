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
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const annual = [2022, 2023, 2024, 2025, 2026].map(year => {
  const rows = study.rows.filter(row => row.date.startsWith(String(year)))
  return { year, offer: median(rows.map(row => returns(row).offer)), open: median(rows.map(row => returns(row).open)) }
})
const outcomes = [
  { label: 'Gain from offer and open', offerStatus: 'GAIN', openStatus: 'GAIN', test: row => row.close > row.offer && row.close > row.open, color: '#007d75' },
  { label: 'Offer gain / opening loss', offerStatus: 'GAIN', openStatus: 'LOSS', test: row => row.close > row.offer && row.close < row.open, color: '#b65422' },
  { label: 'Loss from offer and open', offerStatus: 'LOSS', openStatus: 'LOSS', test: row => row.close < row.offer && row.close < row.open, color: '#b42335' },
  { label: 'Offer loss / opening gain', offerStatus: 'LOSS', openStatus: 'GAIN', test: row => row.close < row.offer && row.close > row.open, color: '#355f91' },
  { label: 'Offer flat / opening gain', offerStatus: 'FLAT', openStatus: 'GAIN', test: row => row.close === row.offer && row.close > row.open, color: '#63778b' },
].map(group => ({ ...group, count: study.rows.filter(group.test).length }))
if (outcomes.reduce((total, group) => total + group.count, 0) !== study.rows.length) throw new Error('Outcome categories must cover the full sample exactly once')
const t = (x, y, value, size = 20, color = '#17334b', weight = 700) => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${escape(value)}</text>`
const line = (x1, y1, x2, y2, color = '#cfdae4') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}"/>`
const frame = (title, subtitle, body, note) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><title>${escape(title)}</title><rect width="1200" height="630" fill="#f6fafc"/><g font-family="DejaVu Sans,Arial,sans-serif"><rect width="1200" height="88" fill="#102d44"/>${t(32, 28, 'TNI RESEARCH · DATA THROUGH NOVEMBER 17, 2026', 15, '#8ce0d2')}${t(32, 66, title, 29, '#ffffff')}${t(32, 116, subtitle, 17, '#334e65', 600)}${body}${t(32, 578, note, 16, '#334e65', 600)}${t(32, 609, 'tradingninvestment.com/research/anthropic-ipo-debut-performance/ · Data and sources in article', 14, '#334e65', 600)}</g></svg>`
// Separate labeled panels make both entry prices explicit without a color legend.
const series = [
  { key: 'offer', x: 174, width: 472, origin: 210, valueX: 612, fill: '#eaf5f1', color: '#007e72', label: 'Bought at IPO offer price', detail: 'Shares allocated before public trading' },
  { key: 'open', x: 676, width: 488, origin: 712, valueX: 1130, fill: '#edf2f8', color: '#254f85', label: 'Bought at market opening', detail: 'Shares bought at the first public trade' },
]
const yearSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<title>IPO debut returns by year: bought at IPO offer price versus bought at market opening</title>
<desc>Median first-day price returns for three selected US IPOs per year, 2022–2026. Both returns end at the first trading day’s close. The 2026 sample is through November 17.</desc>
<rect width="1200" height="630" fill="#f8fafb"/>
<g font-family="DejaVu Sans,Arial,sans-serif">
<rect width="1200" height="142" fill="#102d44"/>
${t(36, 30, 'TNI RESEARCH  /  2022–2026 IPO STUDY', 15, '#8ce0d2')}
${t(36, 79, 'IPO debut returns: entry price matters', 39, '#ffffff', 800)}
${t(36, 115, 'Median first-day return · Three selected US IPOs per year', 19, '#d4e6ee', 600)}
${series.map(panel => `<rect x="${panel.x}" y="164" width="${panel.width}" height="342" rx="14" fill="${panel.fill}" stroke="#d7e2e8"/>
<rect x="${panel.x + 25}" y="187" width="5" height="43" rx="2" fill="${panel.color}"/>
${t(panel.x + 40, 202, panel.label, 22, '#17354c', 800)}
${t(panel.x + 40, 226, panel.detail, 15, '#425b70', 600)}
${[0, 10, 20].map(tick => line(panel.origin + tick * 11.4, 247, panel.origin + tick * 11.4, 478, tick === 0 ? '#adbfca' : '#d7e2e8') + t(panel.origin + tick * 11.4 - 8, 495, `${tick}%`, 13, '#4b6376', 600)).join('')}
${annual.map((row, i) => {
  const value = row[panel.key]
  const y = 263 + i * 45
  const color = value < 0 ? '#b42335' : panel.color
  const shape = value === 0
    ? `<circle cx="${panel.origin}" cy="${y + 10}" r="3" fill="${panel.fill}" stroke="#71879a" stroke-width="2"/>`
    : `<rect x="${panel.origin + Math.min(0, value) * 11.4}" y="${y}" width="${Math.abs(value) * 11.4}" height="20" rx="3" fill="${color}"/>`
  return shape + t(panel.valueX, y + 19, pct(value), 23, value < 0 ? color : '#17354c', 800).replace('<text ', '<text text-anchor="end" ')
}).join('')}`).join('')}
${annual.map((row, i) => t(38, 282 + i * 45, `${row.year}${row.year === 2026 ? '*' : ''}`, 24, '#17354c', 800)).join('')}
${t(36, 545, 'Both returns end at the same first-day closing price.', 24, '#17354c', 800)}
${t(36, 571, 'Each bar is the middle return of 3 IPOs. *2026 through Nov 17; selected sample, not the full market.', 16, '#425b70', 600)}
${line(36, 586, 1164, 586)}
${t(36, 616, 'tradingninvestment.com', 19, '#17354c', 800)}
<text x="1164" y="614" text-anchor="end" font-size="14" fill="#425b70" font-weight="600">Price returns exclude costs · Sources and complete table in article</text>
</g></svg>`
const statusPill = (x, y, status) => {
  const color = status === 'GAIN' ? '#00776b' : status === 'LOSS' ? '#b42335' : '#506579'
  const background = status === 'GAIN' ? '#e5f4ef' : status === 'LOSS' ? '#fce9ec' : '#edf1f4'
  const sign = status === 'GAIN' ? '+' : status === 'LOSS' ? '−' : '='
  return `<rect x="${x}" y="${y}" width="280" height="40" rx="9" fill="${background}"/>${t(x + 24, y + 28, `${sign} ${status}`, 25, color, 800)}`
}
const positiveOfferLossAtOpen = outcomes[1].count
const positiveOfferCount = study.rows.filter(row => row.close > row.offer).length
const outcomeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<title>Five IPO debut outcomes: gains and losses from the offer price and the market opening price</title>
<desc>Eight of 15 gained from both purchase prices. Three gained from the IPO offer but lost from market opening. Two lost from both. One lost from the offer but gained from opening. One was flat from the offer but gained from opening.</desc>
<rect width="1200" height="630" fill="#f8fafb"/><g font-family="DejaVu Sans,Arial,sans-serif">
<rect width="1200" height="134" fill="#102d44"/>
${t(36, 30, 'TNI RESEARCH  /  15 SELECTED US IPOs  /  2022–2026*', 15, '#8ce0d2')}
${t(36, 78, 'IPO gains depend on where you bought', 39, '#ffffff', 800)}
${t(36, 113, 'Five first-day outcomes · Same stocks, different purchase prices', 19, '#d4e6ee', 600)}
${t(60, 171, 'Bought at IPO offer price', 21, '#17354c', 800)}
${t(450, 171, 'Bought at market opening', 21, '#17354c', 800)}
${t(842, 171, 'Number of IPOs', 21, '#17354c', 800)}
${outcomes.map((group, i) => {
  const y = 190 + i * 60
  return `<rect x="36" y="${y}" width="1128" height="52" rx="10" fill="${i === 1 ? '#fff3df' : '#ffffff'}" stroke="${i === 1 ? '#e6bb73' : '#e0e8ed'}"/>`
    + statusPill(60, y + 6, group.offerStatus) + statusPill(450, y + 6, group.openStatus)
    + t(846, y + 36, `${group.count} / ${study.rows.length}`, 31, '#17354c', 800)
    + t(1044, y + 34, `${(group.count / study.rows.length * 100).toFixed(1)}%`, 21, '#425b70', 700)
}).join('')}
${t(36, 531, `${positiveOfferLossAtOpen} of ${positiveOfferCount} positive IPO debuts lost money from the opening trade.`, 25, '#17354c', 800)}
${t(36, 559, 'Both returns end at the first-day close. *2026 through Nov 17; a selected sample, not the full market.', 16, '#425b70', 600)}
${line(36, 582, 1164, 582)}
${t(36, 615, 'tradingninvestment.com', 19, '#17354c', 800)}
<text x="1164" y="613" text-anchor="end" font-size="14" fill="#425b70" font-weight="600">Price returns exclude costs · Full data and sources in article</text>
</g></svg>`
const finance = study.anthropic
const financialRows = [
  { label: 'Revenue', value: finance.revenueBillions, display: '$17.000bn', color: '#007d75' },
  { label: 'GAAP operating loss', value: -finance.operatingLossBillions, display: '−$0.567bn', color: '#b42335' },
  { label: 'Net loss', value: -finance.netLossBillions, display: '−$23.300bn', color: '#b42335' },
]
const financeX = value => 375 + (value + 25) / 45 * 650
let financeBody = [-25, -20, -10, 0, 10, 20].map(tick => line(financeX(tick), 160, financeX(tick), 465, tick === 0 ? '#7f94a3' : '#d2e0e8') + t(financeX(tick) - 15, 149, tick, 15)).join('')
financeBody += financialRows.map((row, i) => {
  const y = 190 + i * 90
  return t(32, y + 28, row.label, 23) + `<rect x="${Math.min(financeX(0), financeX(row.value))}" y="${y}" width="${Math.abs(financeX(row.value) - financeX(0))}" height="40" rx="3" fill="${row.color}"/>` + t(1042, y + 28, row.display, 19)
}).join('')
financeBody += t(32, 500, 'Net loss includes a $21.9bn non-cash fair-value charge. It is not cash burn.', 20) + t(32, 532, 'These are different accounting levels; the three bars must not be added together.', 18)
const financeSvg = frame('Anthropic Q3 2026 financial measures', 'US$ billions · Sources: SEC filing and issuer financial presentation', financeBody, 'Revenue $17.0bn · Calculated GAAP operating margin −3.34% · Adjusted margin 15%.')
for (const [name, chart] of [['mega-ipo-yearly-medians', yearSvg], ['mega-ipo-entry-outcomes', outcomeSvg], ['anthropic-q3-2026-financial-measures', financeSvg]]) {
  fs.writeFileSync(path.join(directory, `${name}.svg`), chart)
  await sharp(Buffer.from(chart)).png().toFile(path.join(directory, `${name}.png`))
}
await sharp(Buffer.from(yearSvg), { density: 144 }).png().toFile(path.join(directory, 'mega-ipo-yearly-medians-2x.png'))
await sharp(Buffer.from(outcomeSvg), { density: 144 }).png().toFile(path.join(directory, 'mega-ipo-entry-outcomes-2x.png'))

const thumbnailFrame = body => `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#102d44"/><g font-family="DejaVu Sans,Arial,sans-serif">${body}</g></svg>`
const allOfferMedian = median(study.rows.map(row => returns(row).offer))
const allOpenMedian = median(study.rows.map(row => returns(row).open))
const returnThumbnail = thumbnailFrame(`
${t(48, 45, 'TNI RESEARCH  /  HISTORICAL IPO RETURNS', 21, '#8ce0d2')}
${t(48, 135, 'IPO GAINS:', 83, '#ffffff', 800)}
${t(48, 228, 'WHO GETS THEM?', 83, '#ffffff', 800)}
<rect x="48" y="274" width="566" height="276" rx="18" fill="#eaf5f1"/>
<rect x="642" y="274" width="590" height="276" rx="18" fill="#edf2f8"/>
${t(78, 325, 'BOUGHT AT IPO OFFER PRICE', 24, '#175a50', 800)}
${t(672, 325, 'BOUGHT AT MARKET OPENING', 24, '#254f85', 800)}
${t(78, 443, pct(allOfferMedian), 90, '#00776b', 800)}
${t(672, 443, pct(allOpenMedian), 90, '#254f85', 800)}
${t(78, 506, 'Median first-day return', 26, '#425b70', 700)}
${t(672, 506, 'Median first-day return', 26, '#425b70', 700)}
${t(48, 614, 'Same 15 IPOs. Different entry prices.', 34, '#ffffff', 800)}
${t(48, 678, '2022–2026*  ·  TRADINGNINVESTMENT.COM', 20, '#d4e6ee', 700)}
<text x="1232" y="678" text-anchor="end" font-size="17" fill="#d4e6ee">*Through Nov 17 · Selected sample · Before costs</text>`)
const outcomeThumbnail = thumbnailFrame(`
${t(48, 45, 'TNI RESEARCH  /  HISTORICAL IPO RETURNS', 21, '#8ce0d2')}
${t(48, 137, 'IPO UP.', 86, '#8ce0d2', 800)}
${t(48, 232, 'BUYER DOWN.', 86, '#ffffff', 800)}
${t(48, 285, 'Same stock. Different purchase price.', 30, '#d4e6ee', 700)}
<rect x="48" y="325" width="566" height="169" rx="18" fill="#eaf5f1"/>
<rect x="642" y="325" width="590" height="169" rx="18" fill="#fce9ec"/>
${t(78, 373, 'IPO OFFER PRICE → CLOSE', 24, '#175a50', 800)}
${t(672, 373, 'MARKET OPENING → CLOSE', 24, '#9a2536', 800)}
${t(78, 459, 'GAIN', 68, '#00776b', 800)}
${t(672, 459, 'LOSS', 68, '#b42335', 800)}
${t(48, 563, `${positiveOfferLossAtOpen} of ${positiveOfferCount} positive IPO debuts`, 40, '#ffffff', 800)}
${t(48, 611, 'lost money from the opening trade.', 34, '#ffffff', 800)}
${t(48, 678, '15 SELECTED IPOs  ·  2022–2026*  ·  TNI', 20, '#d4e6ee', 700)}
<text x="1232" y="678" text-anchor="end" font-size="17" fill="#d4e6ee">*Through Nov 17 · Historical outcomes, before costs</text>`)
for (const [name, thumbnail] of [['mega-ipo-returns-youtube-thumbnail', returnThumbnail], ['mega-ipo-outcomes-youtube-thumbnail', outcomeThumbnail]]) {
  fs.writeFileSync(path.join(directory, `${name}.svg`), thumbnail)
  await sharp(Buffer.from(thumbnail)).png().toFile(path.join(directory, `${name}.png`))
}
console.log('Generated sourced IPO CSV, full comparison, annual medians, outcome counts and issuer financial figures')
