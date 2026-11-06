import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { MarketRecord } from '../../hooks/useMarketTodaySnapshot'
import { makeHeatmapLayout } from './marketHeatmapLayout'
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


export default function SP500DailyHeatmap({
  stocks, sector, onSelect
}: {
  stocks: MarketRecord[]
  sector: string
  onSelect: (stock: MarketRecord) => void
}) {
  const [hover, setHover] = useState<{
    stock: MarketRecord; x: number; y: number
  } | null>(null)

  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(950)

  useEffect(() => {
    const el = host.current
    if (!el) return

    const update = () =>
      setWidth(Math.max(250, Math.floor(el.clientWidth)))

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const visible = useMemo(
    () => sector === 'all'
      ? stocks
      : stocks.filter(s => s.sector === sector),
    [stocks, sector]
  )

  const highlightedTickers = useMemo(
    () => new Set(
      [...visible]
        .sort((a, b) =>
          Math.abs(b.change_pct) - Math.abs(a.change_pct))
        .slice(0, 10)
        .map(stock => stock.ticker)
    ),
    [visible]
  )

  const height = useMemo(() => {
    if (sector !== 'all') {
      return Math.max(500, Math.ceil(visible.length / 5) * 62)
    }
    if (width < 600) {
      return Math.max(1800, Math.round(visible.length * 4.4))
    }
    if (width < 950) {
      return Math.max(1300, Math.round(visible.length * 2.9))
    }
    return Math.max(1020, Math.round(visible.length * 2.2))
  }, [width, visible.length, sector])

  const tree = useMemo(
    () => makeHeatmapLayout(visible, width, height),
    [visible, width, height]
  )

  useEffect(() => setHover(null), [sector, stocks])

  useEffect(() => {
    const clear = () => setHover(null)
    window.addEventListener('scroll', clear, true)
    window.addEventListener('resize', clear)
    return () => {
      window.removeEventListener('scroll', clear, true)
      window.removeEventListener('resize', clear)
    }
  }, [])

  const shortName = (name: string) =>
    name.replace('Information Technology', 'Technology')
      .replace('Communication Services', 'Communication')

  return (
    <section className="tni-hm-map-section"
      aria-label="Interactive sector heatmap">

      <div ref={host}
        className="tni-hm-map tni-hm-dynamic"
        style={{ display: 'block' }}>

        {!visible.length && (
          <p className="tni-hm-empty">
            No stock prices are available in this snapshot.
          </p>
        )}

        {!!visible.length && (
          <svg width="100%" height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="S&P 500 sectors sized by stock volatility">

            {(tree.children ?? []).map(group => {
              const gw = group.x1 - group.x0
              const gh = group.y1 - group.y0
              const values = group.leaves()
                .map(leaf => leaf.data.stock!.change_pct)
              const average = d3.mean(values) ?? 0

              return (
                <g key={group.data.name}>
                  <rect x={group.x0} y={group.y0}
                    width={Math.max(0, gw)}
                    height={Math.max(0, gh)}
                    rx={5}
                    fill="#1B1B1B"
                    stroke="#777777"
                    strokeWidth={1.5}/>

                  {gw >= 95 && gh >= 38 && (
                    <text x={group.x0 + 9}
                      y={group.y0 + 25}
                      fill="#FFFFFF"
                      fontSize={gw < 190 ? 12 : 16}
                      fontWeight={850}>
                      {shortName(group.data.name).slice(
                        0, gw < 190 ? 12 : 25
                      )}
                    </text>
                  )}

                  {gw >= 240 && gh >= 38 && (
                    <text x={group.x1 - 9}
                      y={group.y0 + 25}
                      textAnchor="end"
                      fill={average >= 0 ? '#74F1AF' : '#FF9DA7'}
                      fontSize={15}
                      fontWeight={850}>
                      {formatReturn(average)}
                    </text>
                  )}

                  {group.leaves().map(leaf => {
                    const stock = leaf.data.stock!
                    const highlighted =
                      highlightedTickers.has(stock.ticker) ||
                      Math.abs(stock.change_pct) >= 10
                    const w = leaf.x1 - leaf.x0
                    const h = leaf.y1 - leaf.y0
                    const showTicker =
                      (w >= stock.ticker.length * 10 + 14 &&
                       h >= 28) ||
                      (highlighted &&
                       w >= stock.ticker.length * 8 + 10 &&
                       h >= 30)
                    const showReturn =
                      showTicker &&
                      (w >= 92 || (highlighted && w >= 75)) &&
                      h >= 56

                    return (
                      <g key={stock.ticker}
                        className="tni-hm-tile"
                        role="button"
                        tabIndex={0}
                        aria-label={`${stock.company} (${stock.ticker}), ${formatReturn(stock.change_pct)}, view details`}
                        onClick={() => {
                          setHover(null)
                          onSelect(stock)
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setHover(null)
                            onSelect(stock)
                          }
                        }}
                        onMouseMove={e => {
                          if (window.matchMedia('(hover: hover)').matches) {
                            setHover({
                              stock,
                              x: e.clientX,
                              y: e.clientY
                            })
                          }
                        }}
                        onMouseLeave={() => setHover(null)}>

                        <rect x={leaf.x0} y={leaf.y0}
                          width={Math.max(0, w)}
                          height={Math.max(0, h)}
                          fill={color(stock.change_pct)}
                          stroke={highlighted ? '#FFD740' : 'none'}
                          strokeWidth={highlighted ? 4 : 0}
                          rx={2}/>

                        {showTicker && (
                          <text
                            x={(leaf.x0 + leaf.x1) / 2}
                            y={(leaf.y0 + leaf.y1) / 2 +
                              (showReturn ? -9 : 5)}
                            textAnchor="middle">
                            {stock.ticker}
                          </text>
                        )}

                        {showReturn && (
                          <text
                            className="tni-hm-tile-return"
                            x={(leaf.x0 + leaf.x1) / 2}
                            y={(leaf.y0 + leaf.y1) / 2 + 19}
                            textAnchor="middle">
                            {formatReturn(stock.change_pct)}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </svg>
        )}
      </div>

      <div className="tni-hm-legend">
        <span className="tni-hm-gradient"/>
        <span>−5% · 0% · +5%</span>
        <span>
          Sector area = volatility activity ·
          Stock tile size = daily move magnitude · Gold = top 10 movers or ≥10% daily change
        </span>
      </div>

      {hover && (
        <div className="tni-hm-tooltip"
          role="tooltip"
          style={{
            left: Math.max(
              8, Math.min(hover.x + 16, window.innerWidth - 302)
            ),
            top: Math.max(
              8, Math.min(hover.y + 16, window.innerHeight - 310)
            )
          }}>
          <StockDetails stock={hover.stock}/>
        </div>
      )}
    </section>
  )
}
