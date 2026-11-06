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

  const width = kind === 'heatmap' || kind === 'top5' || kind === 'leaders' ? 1600 : 1200
  const height = kind === 'heatmap'
    ? (all ? 1600 : 1060)
    : kind === 'top5' ? (all ? 2850 : 2150)
    : kind === 'leaders' ? (all ? 2350 : 1900) : 800

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const c = canvas.getContext('2d')
  if (!c) throw new Error('Canvas export is unavailable.')

  c.fillStyle = '#FFFFFF'
  c.fillRect(0, 0, width, height)

  box(c, 0, 0, width, 218, '#14263C', 0)

  // Reuse the visible header logo when it is a loaded image.
  const logo = document.querySelector<HTMLImageElement>(
    'header img[alt*="logo" i], header a[href="/"] img'
  )

  let logoDrawn = false
  if (logo?.complete && logo.naturalWidth) {
    try {
      const source = new URL(logo.currentSrc || logo.src, location.href)
      if (source.origin === location.origin) {
        box(c, 55, 27, 105, 95, '#FFFFFF', 10)
        const scale = Math.min(
          91 / logo.naturalWidth, 81 / logo.naturalHeight)
        const iw = logo.naturalWidth * scale
        const ih = logo.naturalHeight * scale
        c.drawImage(logo, 55 + (105 - iw) / 2,
          27 + (95 - ih) / 2, iw, ih)
        logoDrawn = true
      }
    } catch {
      logoDrawn = false
    }
  }

  if (!logoDrawn) {
    box(c, 55, 27, 105, 95, '#FFFFFF', 10)
    write(c, 'TNI', 107, 86, 35, '#14263C', 'center')
  }

  write(c, 'TradingNInvestment', 55, 168, 34, '#FFFFFF')
  write(c, 'STOCK MARKET TODAY',
    width - 55, 80, 23, '#E2EAF4', 'right')

  const date = timestamp && !Number.isNaN(Date.parse(timestamp))
    ? new Date(timestamp).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit'
      }) + ' ET'
    : 'Snapshot time unavailable'

  write(c, title, 55, 290, kind === 'heatmap' ? 44 : 47)
  write(c, `Market snapshot: ${date}`, 55, 331, 22, '#39495B')

  if (kind === 'leaders') {
    const rows = all
      ? (sectors.length ? sectors : sectorSummaries(stocks))
          .filter(s => Number.isFinite(s.average_change_pct))
          .map(s => ({
            name: shortSector(s.sector),
            ticker: 'SECTOR',
            value: s.average_change_pct
          }))
      : filtered.map(s => ({
          name: s.company,
          ticker: s.ticker,
          value: s.change_pct
        }))

    rows.sort((a, b) => b.value - a.value)
    const leaders = [
      { data: rows[0], label: all ? 'LEADING SECTOR' : 'LEADING STOCK' },
      { data: rows[rows.length - 1],
        label: all ? 'LAGGING SECTOR' : 'LAGGING STOCK' }
    ]

    leaders.forEach(({ data, label }, i) => {
      const x = i === 0 ? 55 : 610
      box(c, x, 380, 535, 290, i === 0 ? '#087544' : '#B42332', 15)
      write(c, label, x + 25, 431, 23, '#FFFFFF')
      write(c, data.name.slice(0, 30), x + 25, 495, 29, '#FFFFFF')
      if (!all) write(c, data.ticker, x + 25, 541, 24, '#FFFFFF')
      write(c, pct(data.value), x + 25, 625, 61, '#FFFFFF')
    })
  }


  if (kind === 'top5') {
    const lists = [
      {
        title: 'TOP 5 GAINERS',
        color: '#087544',
        background: '#EAF6EE',
        rows: [...filtered]
          .filter(s => s.change_pct > 0)
          .sort((a, b) => b.change_pct - a.change_pct)
          .slice(0, 5)
      },
      {
        title: 'TOP 5 LOSERS',
        color: '#B42332',
        background: '#FCEEEF',
        rows: [...filtered]
          .filter(s => s.change_pct < 0)
          .sort((a, b) => a.change_pct - b.change_pct)
          .slice(0, 5)
      }
    ]

    lists.forEach(({ title, color, background, rows }, column) => {
      const x = column === 0 ? 55 : 610

      box(c, x, 380, 535, 64, color, 12)
      write(c, title, x + 20, 423, 25, '#FFFFFF')

      if (!rows.length) {
        write(c, 'None in this snapshot', x + 18, 500, 20)
      }

      rows.forEach((stock, i) => {
        const y = 462 + i * 112

        box(c, x, y, 535, 100, background, 9)

        write(c, `${i + 1}. ${stock.ticker}`,
          x + 15, y + 35, 26)

        write(c, stock.company.slice(0, 27),
          x + 15, y + 73, 17, '#203047')

        write(c, pct(stock.change_pct),
          x + 518, y + 50, 26, color, 'right')
      })
    })
  }


  if (kind === 'heatmap' || kind === 'top5' || kind === 'leaders') {
    const highlightedTickers = new Set(
      [...filtered]
        .sort((a, b) =>
          Math.abs(b.change_pct) - Math.abs(a.change_pct))
        .slice(0, 10)
        .map(stock => stock.ticker)
    )

    const x0 = 55
    const y0 = kind === 'top5' ? 1110 : kind === 'leaders' ? 760 : 365
    const mapWidth = width - 110
    const mapHeight = height - y0 - 120

    if (kind === 'top5') {
      write(
        c,
        `${sectorName} HEAT MAP`,
        55, 1070, 29, '#14263C'
      )
    }

    if (kind === 'leaders') {
      write(
        c,
        `${sectorName} HEAT MAP`,
        55, 720, 29, '#14263C'
      )
    }

    const tree = makeHeatmapLayout(
      filtered, mapWidth, mapHeight
    )

    for (const group of tree.children ?? []) {
      const x = x0 + group.x0
      const y = y0 + group.y0
      const w = group.x1 - group.x0
      const h = group.y1 - group.y0

      box(c, x, y, w, h, '#1B1B1B', 7)

      if (w >= 95 && h >= 38) {
        write(
          c,
          shortSector(group.data.name).slice(
            0, w < 190 ? 12 : 25
          ),
          x + 10, y + 26,
          w < 190 ? 13 : 20,
          '#FFFFFF'
        )
      }

      for (const leaf of group.leaves()) {
        const stock = leaf.data.stock!
        const lx = x0 + leaf.x0
        const ly = y0 + leaf.y0
        const lw = leaf.x1 - leaf.x0
        const lh = leaf.y1 - leaf.y0

        if (lw <= 0 || lh <= 0) continue

        box(c, lx, ly, lw, lh,
          tileColor(stock.change_pct), 2)

        const highlighted =
          highlightedTickers.has(stock.ticker) ||
          Math.abs(stock.change_pct) >= 10

        if (highlighted && lw > 6 && lh > 6) {
          c.save()
          c.strokeStyle = '#FFD740'
          c.lineWidth = 4
          c.strokeRect(
            lx + 2, ly + 2,
            lw - 4, lh - 4
          )
          c.restore()
        }

        if (lw >= stock.ticker.length * 12 + 12 &&
            lh >= 28) {
          const cx = lx + lw / 2
          const cy = ly + lh / 2
          const hasReturn = lw >= 92 && lh >= 56

          write(c, stock.ticker, cx,
            cy + (hasReturn ? -5 : 6),
            16, '#FFFFFF', 'center')

          if (hasReturn) {
            write(c, pct(stock.change_pct), cx,
              cy + 19, 14, '#FFFFFF', 'center')
          }
        }
      }
    }
  }

  c.fillStyle = '#14263C'
  c.fillRect(0, height - 78, width, 78)
  write(c, 'tradingninvestment.com', 55, height - 28,
    25, '#FFFFFF')
  write(c, 'Daily price change · Data may be delayed',
    width - 55, height - 28, 20, '#E2EAF4', 'right')

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
            </div>
          </div>
        ))}
      </div>

      <p role="status" style={{
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 0
      }}>{status}</p>
    </section>
  )
}
