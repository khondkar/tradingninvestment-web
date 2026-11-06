import { useState } from 'react'
import * as d3 from 'd3'
import { makeHeatmapLayout } from './marketHeatmapLayout'
import type { MarketRecord } from '../../hooks/useMarketTodaySnapshot'

type SectorSummary = { sector: string; average_change_pct: number }
type Kind = 'leaders' | 'top5' | 'heatmap'

type Props = {
  stocks: MarketRecord[]
  sectors: SectorSummary[]
  sector: string
  timestamp?: string | null
}

const formats: { key: Kind; label: string }[] = [
  { key: 'leaders', label: 'Sector Leaders & Laggards' },
  { key: 'top5', label: 'Top 5 Gainers & Losers' },
  { key: 'heatmap', label: 'Heat Map' },
]

const pct = (n: number) =>
  `${n > 0 ? '+' : ''}${n.toFixed(2)}%`

const shortSector = (name: string) =>
  name.replace('Information Technology', 'Technology')
      .replace('Communication Services', 'Communication')

function box(
  c: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill: string, radius = 15
) {
  c.fillStyle = fill
  c.beginPath()
  c.roundRect(x, y, w, h, radius)
  c.fill()
}

function write(
  c: CanvasRenderingContext2D,
  value: string, x: number, y: number,
  size = 28, color = '#16273D',
  align: CanvasTextAlign = 'left'
) {
  c.font = `800 ${size}px Arial, sans-serif`
  c.fillStyle = color
  c.textAlign = align
  c.fillText(value, x, y)
  c.textAlign = 'left'
}

function tileColor(value: number) {
  if (Math.abs(value) < .05) return '#536477'
  const intensity = .28 + Math.min(Math.abs(value) / 5, 1) * .72
  return d3.interpolateRgb(
    value > 0 ? '#174b3a' : '#5b2a30',
    value > 0 ? '#00a85a' : '#df3341'
  )(intensity)
}


function sectorSummaries(stocks: MarketRecord[]) {
  return [...d3.group(stocks, s => s.sector)].map(
    ([sector, rows]) => ({
      sector,
      average_change_pct: d3.mean(rows, s => s.change_pct) ?? 0
    })
  )
}

function createImage({
  stocks, sectors, sector, timestamp, kind
}: Props & { kind: Kind }) {
  const filtered = sector === 'all'
    ? stocks
    : stocks.filter(s => s.sector === sector)

  if (!filtered.length) {
    throw new Error('No market data for this selection.')
  }

  const all = sector === 'all'
  const sectorName = all ? 'S&P 500' : shortSector(sector)
  const title = kind === 'leaders'
    ? `${sectorName} Leaders & Laggards`
    : kind === 'top5'
      ? `${sectorName} Top 5 Gainers & Losers`
      : `${sectorName} Heat Map`

  const width = 1600
  const height = kind === 'heatmap' ? 800 : kind === 'top5' ? 832 : 816
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const c = canvas.getContext('2d')
  if (!c) throw new Error('Canvas export is unavailable.')

  c.fillStyle = '#101B29'
  c.fillRect(0, 0, width, height)
  write(c, title, 18, 46, 40, '#FFFFFF')
  const time = timestamp && Number.isFinite(Date.parse(timestamp))
    ? new Date(timestamp).toLocaleString('en-US', {
      timeZone: 'America/New_York', month: 'short', day: 'numeric',
      year: 'numeric', hour: 'numeric', minute: '2-digit'
    }) + ' ET'
    : 'Snapshot time unavailable'
  write(c, time, width - 18, 42, 28, '#FFFFFF', 'right')

  const mapX = kind === 'heatmap' ? 4 : 380
  const mapY = 62
  const mapHeight = height - mapY - 42
  const tree = makeHeatmapLayout(filtered, width - mapX - 4, mapHeight)

  function fitted(text: string, maxWidth: number, maxSize: number) {
    c!.font = '800 100px Arial, sans-serif'
    return Math.floor(Math.min(maxSize, maxWidth * 100 / Math.max(1, c!.measureText(text).width)))
  }

  if (kind === 'top5') {
    const sorted = [...filtered].sort((a, b) => b.change_pct - a.change_pct)
    const lists = [
      { title: 'TOP 5 GAINERS', rows: sorted.filter(s => s.change_pct > 0).slice(0, 5), color: '#155D41' },
      { title: 'TOP 5 LOSERS', rows: sorted.filter(s => s.change_pct < 0).reverse().slice(0, 5), color: '#922E40' }
    ]
    lists.forEach((list, i) => {
      const y = mapY + i * 358
      box(c, 8, y, 364, 54, list.color, 3)
      write(c, list.title, 20, y + 38, 32, '#FFFFFF')
      if (!list.rows.length) write(c, 'No qualifying stocks', 20, y + 96, 26, '#FFFFFF')
      list.rows.forEach((s, j) => {
        const baseline = y + 104 + j * 55
        write(c, s.ticker, 20, baseline, fitted(s.ticker, 164, 42), '#FFFFFF')
        write(c, pct(s.change_pct), 360, baseline, 37, '#FFFFFF', 'right')
      })
    })
  } else if (kind === 'leaders') {
    const rows = all
      ? (sectors.length ? sectors : sectorSummaries(stocks)).map(s => ({name: shortSector(s.sector), value: s.average_change_pct}))
      : filtered.map(s => ({name: s.ticker, value: s.change_pct}))
    const ranked = rows.filter(s => Number.isFinite(s.value)).sort((a, b) => b.value - a.value)
    ;[ranked[0], ranked[ranked.length - 1]].forEach((row, i) => {
      if (!row) return
      const y = mapY + i * 330
      box(c, 8, y, 364, 307, i ? '#922E40' : '#155D41', 5)
      write(c, (i ? 'LAGGING ' : 'LEADING ') + (all ? 'SECTOR' : 'STOCK'), 20, y + 60, 31, '#FFFFFF')
      write(c, row.name, 20, y + 151, fitted(row.name, 338, 58), '#FFFFFF')
      write(c, pct(row.value), 20, y + 245, 66, '#FFFFFF')
    })
  }

  for (const group of tree.children ?? []) {
    const gx = mapX + group.x0, gy = mapY + group.y0
    const gw = group.x1 - group.x0, gh = group.y1 - group.y0
    if (gw <= 0 || gh <= 0) continue
    const sectorLabel = shortSector(group.data.name)
    const sectorSize = fitted(sectorLabel, gw - 10, 29)
    if (sectorSize >= 20 && gh >= 38) write(c, sectorLabel, gx + 5, gy + 29, sectorSize, '#FFFFFF')
    for (const leaf of group.leaves()) {
      const stock = leaf.data.stock!
      const x = mapX + leaf.x0, y = mapY + leaf.y0
      const w = leaf.x1 - leaf.x0, h = leaf.y1 - leaf.y0
      if (w <= 0 || h <= 0) continue
      c.fillStyle = tileColor(stock.change_pct)
      c.fillRect(x, y, w, h)
      const size = fitted(stock.ticker, w - 6, Math.min(112, h * .81))
      if (size < 22) continue
      const ret = pct(stock.change_pct)
      const sub = fitted(ret, w - 6, Math.min(52, size * .64))
      const two = sub >= 27 && h >= size + sub + 9
      c.save()
      c.textBaseline = 'middle'
      const cy = y + h / 2
      write(c, stock.ticker, x + w / 2, cy - (two ? (sub + 4) / 2 : 0), size, '#FFFFFF', 'center')
      if (two) write(c, ret, x + w / 2, cy + (size + 4) / 2, sub, '#FFFFFF', 'center')
      c.restore()
    }
  }
  write(c, 'TradingNInvestment.com', 18, height - 10, 24, '#FFFFFF')
  write(c, 'Tile area reflects daily move size', width - 18, height - 10, 22, '#FFFFFF', 'right')

  const filename = `TNI-${kind}-${sector === 'all'
    ? 'sp500' : sector.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  }.png`

  return { canvas, title, filename }
}

export default function MarketSnapshotSharing(props: Props) {
  const [status, setStatus] = useState('')

  async function exportCard(kind: Kind, share: boolean) {
    try {
      setStatus('')
      const { canvas, title, filename } =
        createImage({ ...props, kind })

      // Synchronous PNG generation preserves share-button activation.
      const dataURL = canvas.toDataURL('image/png')
      const binary = atob(dataURL.split(',')[1])
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const file = new File([bytes], filename, {
        type: 'image/png'
      })

      if (share && navigator.share &&
          navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: `TradingNInvestment market snapshot: ${title}`
        })
        setStatus('Share action completed.')
        return
      }

      const a = document.createElement('a')
      a.href = dataURL
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()

      setStatus(share
        ? 'PNG downloaded. You can upload it to your social app.'
        : `Downloaded ${filename}`)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setStatus(error instanceof Error
        ? error.message
        : 'Unable to generate PNG.')
    }
  }


  async function shareSocial(kind: Kind, platform: 'linkedin' | 'x') {
    const composer = window.open('about:blank', '_blank')
    if (!composer) {
      setStatus('Allow the sharing window and try again.')
      return
    }
    composer.opener = null
    try {
      setStatus('Preparing the selected chart…')
      const { canvas, title } = createImage({ ...props, kind })
      const dataURL = canvas.toDataURL('image/png')
      const binary = atob(dataURL.slice(dataURL.indexOf(',') + 1))
      const png = new Blob([Uint8Array.from(binary, char => char.charCodeAt(0))],
        { type: 'image/png' })
      const api = new URL(import.meta.env.VITE_API_BASE_URL ||
        'https://quant-ai-agent.onrender.com', window.location.origin)
      const endpoint = new URL(api.href.replace(/\/$/, '') + '/market/share-snapshots')
      const response = await fetch(endpoint, { method: 'POST', body: png })
      if (!response.ok) throw new Error('Could not publish the chart preview. Please retry.')
      const { id } = await response.json()
      if (typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id)) {
        throw new Error('The chart preview returned an invalid identifier.')
      }
      const shareUrl = `https://tradingninvestment.com/market/share-snapshots/${id}`
      const destination = new URL(platform === 'x'
        ? 'https://x.com/intent/tweet'
        : 'https://www.linkedin.com/sharing/share-offsite/')
      destination.searchParams.set('url', shareUrl)
      if (platform === 'x') destination.searchParams.set('text', title)
      if (!composer.closed) composer.location.replace(destination.href)
      setStatus(composer.closed ? 'Sharing window closed.' : 'Chart ready in the sharing window.')
    } catch (error) {
      composer.close()
      setStatus(error instanceof Error ? error.message : 'Unable to share the selected chart.')
    }
  }

  return (
    <section
      aria-label="Download and share market snapshots"
      style={{
        border: '1px solid #B5C1CE',
        borderRadius: 14,
        padding: 18,
        margin: '22px 0',
        background: '#FFFFFF',
        color: '#172536'
      }}
    >
      <h2 style={{
        fontSize: 23,
        fontWeight: 800,
        margin: '0 0 8px'
      }}>
        Share Today's Market Snapshot
      </h2>
      <p style={{
        fontSize: 15,
        fontWeight: 650,
        margin: '0 0 16px'
      }}>
        PNG cards automatically use the selected sector and
        current market snapshot.
      </p>

      <div style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))'
      }}>
        {formats.map(format => (
          <div key={format.key} style={{
            border: '1px solid #B5C1CE',
            borderRadius: 10,
            padding: 13
          }}>
            <strong style={{
              display: 'block',
              fontSize: 16,
              marginBottom: 12
            }}>
              {format.label}
            </strong>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <button type="button"
                disabled={!props.stocks.length}
                onClick={() => void exportCard(format.key, false)}>
                Download PNG
              </button>
              <button type="button"
                disabled={!props.stocks.length}
                onClick={() => void exportCard(format.key, true)}>
                Share
              </button>
              <button type="button"
                disabled={!props.stocks.length}
                onClick={() => shareSocial(format.key, 'linkedin')}>
                LinkedIn
              </button>
              <button type="button"
                disabled={!props.stocks.length}
                onClick={() => shareSocial(format.key, 'x')}>
                Post to X
              </button>
            </div>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#344458',
        marginTop: 14
      }}>
        LinkedIn and X share a link to the selected chart.
      </p>

      <p role="status" style={{
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 0
      }}>{status}</p>
    </section>
  )
}
