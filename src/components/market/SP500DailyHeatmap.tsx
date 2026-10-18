import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { MarketRecord } from '../../hooks/useMarketTodaySnapshot'
import './SP500DailyHeatmap.css'

export function formatReturn(value: number) {
  return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : '—'
}
function color(value: number) {
  if (Math.abs(value) < .05) return '#536477'
  const intensity = .28 + Math.min(Math.abs(value) / 5, 1) * .72
  return d3.interpolateRgb(value > 0 ? '#174b3a' : '#5b2a30', value > 0 ? '#00a85a' : '#df3341')(intensity)
}
export function StockDetails({stock, titleId}: {stock: MarketRecord; titleId?: string}) {
  return <><h3 id={titleId}>{stock.ticker} · {stock.company}</h3><p className="tni-hm-detail-sector">{stock.sector} · Daily performance</p><p className={`tni-hm-detail-return ${stock.change_pct < 0 ? 'negative' : 'positive'}`}>{formatReturn(stock.change_pct)}</p><dl className="tni-hm-detail-grid"><dt>Price</dt><dd>${stock.price.toFixed(2)}</dd><dt>Change</dt><dd>{Number.isFinite(stock.change) ? `${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}` : '—'}</dd><dt>Industry</dt><dd>{stock.industry || '—'}</dd><dt>Price timestamp</dt><dd>{stock.price_timestamp || 'Not provided'}</dd></dl></>
}

type Node = {name: string; stock?: MarketRecord; children?: Node[]}
function SectorTiles({name, stocks, focused, onSelect, onHover}: {name: string; stocks: MarketRecord[]; focused: boolean; onSelect: (stock: MarketRecord) => void; onHover: (stock: MarketRecord | null, x?: number, y?: number) => void}) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(300)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => setWidth(Math.max(1, Math.floor(element.clientWidth)))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  // Give every sector enough room for the full constituent set on phones.
  const height = focused ? Math.max(400, Math.ceil(stocks.length / 5) * 44) : Math.max(180, Math.ceil(stocks.length / (width < 250 ? 4 : 7)) * 32)
  const leaves = useMemo(() => {
    const root = d3.hierarchy<Node>({name, children: stocks.map(stock => ({name: stock.ticker, stock}))})
      .sum(node => node.stock ? Math.pow(Math.min(8, Math.max(.25, Math.abs(node.stock.change_pct))), 1.45) : 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    return d3.treemap<Node>().size([width, height]).paddingInner(2).round(true)(root).leaves()
  }, [name, stocks, width, height])
  const average = d3.mean(stocks, s => s.change_pct) ?? 0
  return <section className={`tni-hm-sector${focused ? ' is-focused' : ''}`}>
    <h3><span>{name}</span><b className={average < 0 ? 'negative' : 'positive'} title="Equal-weight average daily return">{formatReturn(average)}</b></h3>
    <div ref={ref}><svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} aria-label={`${name} daily stock returns`}>
      {leaves.map(leaf => {
        const stock = leaf.data.stock!
        const w = leaf.x1 - leaf.x0, h = leaf.y1 - leaf.y0
        const ticker = w >= stock.ticker.length * 7 + 4 && h >= 18
        const showReturn = ticker && w >= 48 && h >= 35
        return <g key={stock.ticker} role="button" tabIndex={0} className="tni-hm-tile" aria-label={`${stock.company} (${stock.ticker}), ${formatReturn(stock.change_pct)}, view details`}
          onClick={() => {onHover(null); onSelect(stock)}} onKeyDown={e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); onHover(null); onSelect(stock)}}}
          onMouseMove={e => {if (window.matchMedia('(hover: hover)').matches) onHover(stock, e.clientX, e.clientY)}} onMouseLeave={() => onHover(null)}>
          <rect x={leaf.x0} y={leaf.y0} width={Math.max(0, w)} height={Math.max(0, h)} fill={color(stock.change_pct)} rx={2} />
          {ticker && <text x={(leaf.x0 + leaf.x1) / 2} y={(leaf.y0 + leaf.y1) / 2 + (showReturn ? -3 : 4)} textAnchor="middle">{stock.ticker}</text>}
          {showReturn && <text className="tni-hm-tile-return" x={(leaf.x0 + leaf.x1) / 2} y={(leaf.y0 + leaf.y1) / 2 + 13} textAnchor="middle">{formatReturn(stock.change_pct)}</text>}
        </g>
      })}
    </svg></div>
  </section>
}

export default function SP500DailyHeatmap({stocks, sector, onSelect}: {stocks: MarketRecord[]; sector: string; onSelect: (stock: MarketRecord) => void}) {
  const [hover, setHover] = useState<{stock: MarketRecord; x: number; y: number} | null>(null)
  const groups = useMemo(() => [...d3.group(stocks, s => s.sector)].sort((a, b) => b[1].length - a[1].length), [stocks])
  useEffect(() => { setHover(null) }, [sector, stocks])
  useEffect(() => {
    const clear = () => setHover(null)
    window.addEventListener('scroll', clear, true)
    window.addEventListener('resize', clear)
    return () => {window.removeEventListener('scroll', clear, true); window.removeEventListener('resize', clear)}
  }, [])
  return <section className="tni-hm-map-section" aria-label="Interactive sector heatmap">
    <div className={`tni-hm-map${sector !== 'all' ? ' is-focused' : ''}`}>{groups.filter(([name]) => sector === 'all' || name === sector).map(([name, rows]) => <SectorTiles key={name} name={name} stocks={rows} focused={sector !== 'all'} onSelect={onSelect} onHover={(stock, x = 0, y = 0) => setHover(stock ? {stock, x, y} : null)} />)}{!stocks.length && <p className="tni-hm-empty">No stock prices are available in this snapshot.</p>}</div>
    <div className="tni-hm-legend"><span className="tni-hm-gradient" /><span>−5% · 0% · +5%</span><span>Tile size = daily move magnitude · Color = daily return</span></div>
    {hover && <div className="tni-hm-tooltip" role="tooltip" style={{left: Math.max(8, Math.min(hover.x + 16, window.innerWidth - 302)), top: Math.max(8, Math.min(hover.y + 16, window.innerHeight - 310))}}><StockDetails stock={hover.stock} /></div>}
  </section>
}
