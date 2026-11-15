import type { SectorRecord } from '../../hooks/useMarketTodaySnapshot'

export function downloadSectorPng(period: string, updated: string, sectors: SectorRecord[]) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 224 + sectors.length * 62
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')

  const ink = '#102b42'
  const zero = 780
  const max = Math.max(1, ...sectors.map(s => Math.abs(s.average_change_pct)))
  const stamp = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(updated))

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = ink
  ctx.fillRect(0, 0, canvas.width, 110)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 25px Arial'
  ctx.fillText('TradingNInvestment  /  S&P 500 Sector Health', 32, 38)
  ctx.font = 'bold 40px Arial'
  ctx.fillText(period, 32, 88)
  ctx.textAlign = 'right'
  ctx.font = 'bold 24px Arial'
  ctx.fillText(stamp, 1168, 84)
  ctx.textAlign = 'left'
  ctx.fillStyle = ink
  ctx.fillText('Sector', 32, 147)
  ctx.fillText('Equal-weight average return', 496, 147)

  sectors.forEach((sector, i) => {
    const y = 163 + i * 62
    const value = sector.average_change_pct
    const size = Math.abs(value) / max * 224
    const color = value < 0 ? '#a12b36' : value > 0 ? '#00684f' : ink
    ctx.fillStyle = i % 2 ? '#fff' : '#edf3f6'
    ctx.fillRect(0, y, 1200, 62)
    ctx.fillStyle = ink
    ctx.font = 'bold 29px Arial'
    ctx.fillText(sector.sector, 32, y + 40, 460)
    ctx.fillRect(zero - 1, y, 2, 62)
    ctx.fillStyle = color
    ctx.fillRect(value < 0 ? zero - size : zero, y + 18, size, 26)
    ctx.textAlign = 'right'
    ctx.fillText((value > 0 ? '+' : '') + value.toFixed(2) + '%', 1168, y + 40)
    ctx.textAlign = 'left'
  })

  ctx.font = 'bold 23px Arial'
  ctx.fillStyle = ink
  ctx.fillText('tradingninvestment.com/stock-market-today/sector-health/', 32, canvas.height - 19)
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = ('TNI-sector-health-' + period + '-' + stamp).replace(/[^a-z0-9-]+/gi, '-') + '.png'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
