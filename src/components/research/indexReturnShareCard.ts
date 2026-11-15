import { line, scaleLinear } from 'd3'

export const shareIndexes = [
  { name: 'S&P 500', color: '#ae2033' },
  { name: 'Dow Jones', color: '#596676' },
  { name: 'Nasdaq Composite', color: '#1457a1' },
]

export function indexReturnCard(dates: string[], returns: number[][]) {
  const end = dates.length - 1
  const x = scaleLinear([0, end], [104, 1140])
  const y = scaleLinear([Math.min(0, ...returns.flat()) - 1, Math.max(0, ...returns.flat()) + 1], [497, 250]).nice(5)
  const text = (x: number, y: number, value: string, size: number, color = '#10233f', anchor = 'start') =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${value.replaceAll('&', '&amp;')}</text>`
  const panels = shareIndexes.map((index, i) => {
    const left = 38 + i * 378
    const gain = returns[end][i]
    const label = (gain > 0 ? '+' : '') + gain.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '%'
    return `<rect x="${left}" y="118" width="364" height="95" rx="10" fill="white" stroke="#bccbd9"/>` +
      text(left + 18, 151, index.name, 23, index.color) + text(left + 18, 194, label, 36, index.color)
  }).join('')
  const grid = y.ticks(5).map(v =>
    `<path d="M104,${y(v)} H1140" stroke="${v === 0 ? '#54687b' : '#ced8e2'}"/>` +
      text(96, y(v) + 6, v.toLocaleString('en-US') + '%', 16, '#23384b', 'end')).join('')
  const traces = shareIndexes.map((index, i) => {
    const path = line<number[]>().x((_, k) => x(k)).y(row => y(row[i]))(returns)
    return `<path d="${path}" fill="none" stroke="${index.color}" stroke-width="4" stroke-linejoin="round"/><circle cx="1140" cy="${y(returns[end][i])}" r="5" fill="${index.color}"/>`
  }).join('')
  const ticks = Array.from({length: 5}, (_, i) => {
    const k = Math.round(end * i / 4)
    return text(x(k), 525, dates[k].slice(0, 7), 17, '#23384b', i === 0 ? 'start' : i === 4 ? 'end' : 'middle')
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700">
    <rect width="1200" height="630" fill="#f4f7fb"/>
    ${text(38, 38, 'TNI INDEX RESEARCH', 20, '#1457a1')}
    ${text(1162, 38, dates[0] + ' to ' + dates[end], 18, '#10233f', 'end')}
    ${text(38, 92, 'S&P 500, Dow and Nasdaq cumulative returns', 42)}
    ${panels}<rect x="104" y="250" width="1036" height="247" fill="white"/>${grid}${traces}${ticks}
    ${text(38, 572, 'Monthly closes · Each index starts at 0% · Dividends excluded', 19)}
    ${text(38, 608, 'tradingninvestment.com/sp-500-returns/', 20, '#1457a1')}
  </svg>`
}

export async function downloadReturnCard(dates: string[], returns: number[][]) {
  const source = URL.createObjectURL(new Blob([indexReturnCard(dates, returns)], {type: 'image/svg+xml;charset=utf-8'}))
  try {
    const image = new Image()
    image.src = source
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas unavailable')
    context.drawImage(image, 0, 0)
    const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG unavailable')), 'image/png'))
    const link = document.createElement('a')
    link.href = URL.createObjectURL(png)
    link.download = 'TNI-index-cumulative-returns-' + dates[0] + '-to-' + dates.at(-1) + '.png'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(link.href), 60000)
  } finally {
    URL.revokeObjectURL(source)
  }
}
