import { useEffect, useMemo, useRef, useState } from 'react'
import './StockTotalReturnComparison.css'
import sp500Data from '../../data/sp500-historical-return-methods.json'

type AnnualRow = {
  year: number
  total_return?: number | null
  is_ytd?: boolean
}

type Point = {
  year: number
  asset: number
  benchmark: number
}

const periods = [
  { label: '5Y', value: 5 },
  { label: '10Y', value: 10 },
  { label: '20Y', value: 20 },
  { label: 'Max', value: 0 },
]

export default function StockTotalReturnComparison({
  assetTicker,
  assetData,
}: {
  assetTicker: string
  assetData: AnnualRow[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(900)
  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const measure = () => setContainerWidth(Math.max(280, Math.round(element.getBoundingClientRect().width)))
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const [period, setPeriod] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const points = useMemo(() => {
    const asset = assetData
    const benchmark = new Map(
      (sp500Data.data as AnnualRow[])
        .filter(row => !row.is_ytd && typeof row.total_return === 'number' && Number.isFinite(row.total_return))
        .map(row => [row.year, row.total_return as number]),
    )

    const common = asset
      .filter(row =>
        !row.is_ytd &&
        typeof row.total_return === 'number' &&
        Number.isFinite(row.total_return) &&
        benchmark.has(row.year),
      )
      .sort((a, b) => a.year - b.year)

    // Require consecutive completed years; never compound across a missing year.
    const result: Point[] = []
    let assetGrowth = 10000
    let benchmarkGrowth = 10000

    for (const row of common) {
      if (result.length && row.year !== result[result.length - 1].year + 1) {
        result.length = 0
        assetGrowth = 10000
        benchmarkGrowth = 10000
      }
      const benchmarkReturn = benchmark.get(row.year)!
      assetGrowth *= 1 + row.total_return! / 100
      benchmarkGrowth *= 1 + benchmarkReturn / 100

      result.push({
        year: row.year,
        asset: assetGrowth,
        benchmark: benchmarkGrowth,
      })
    }

    if (result.length) {
      result.unshift({ year: result[0].year - 1, asset: 10000, benchmark: 10000 })
    }
    return result
  }, [assetData])

  const visible = useMemo(() => {
    if (!points.length) return []
    if (!period) return points

    // Rebase the selected window to $10,000.
    const window = points.slice(-(period + 1))
    if (window.length < 2) return points

    const assetBase = window[0].asset
    const benchmarkBase = window[0].benchmark

    return window.map(row => ({
      year: row.year,
      asset: row.asset / assetBase * 10000,
      benchmark: row.benchmark / benchmarkBase * 10000,
    }))
  }, [points, period])

  if (visible.length < 2) return null

  // Use actual chart pixels as SVG units. A fixed 900px viewBox scaled to
  // a 340px phone was shrinking 12px labels to ~4.5px.
  const width = Math.min(900, Math.max(280, containerWidth - (containerWidth < 640 ? 24 : 40)))
  const mobile =
    (typeof window !== 'undefined' && window.innerWidth < 720) ||
    width < 600
  const height = mobile ? 300 : 340
  const left = mobile ? 66 : 78
  const right = mobile ? 12 : 25
  const top = mobile ? 28 : 24
  const bottom = mobile ? 42 : 46

  const chartWidth = width - left - right
  const chartHeight = height - top - bottom

  const max = Math.max(
    ...visible.flatMap(row => [row.asset, row.benchmark]),
    10000,
  )

  const x = (index: number) =>
    left + index / (visible.length - 1) * chartWidth

  const y = (value: number) =>
    top + chartHeight - value / max * chartHeight

  const line = (key: 'asset' | 'benchmark') =>
    visible.map((row, index) =>
      `${index === 0 ? 'M' : 'L'}${x(index).toFixed(2)},${y(row[key]).toFixed(2)}`,
    ).join(' ')

  const activeIndex = selected !== null && selected < visible.length
    ? selected : visible.length - 1
  const active = visible[activeIndex]

  // Stock-agnostic total-return interpretation
  const firstPoint = visible[0]
  const lastPoint = visible[visible.length - 1]

  const assetReturn =
    (lastPoint.asset / firstPoint.asset - 1) * 100
  const benchmarkReturn =
    (lastPoint.benchmark / firstPoint.benchmark - 1) * 100
  const relativeReturn = assetReturn - benchmarkReturn

  const formatPercent = (value: number) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

  const periodLabel =
    period === 0 ? 'maximum available period' : `${period}-year period`

  const relativeDescription =
    relativeReturn > 0.05
      ? 'outperformed'
      : relativeReturn < -0.05
        ? 'underperformed'
        : 'performed approximately in line with'

  const axisMoney = (value: number) => {
    if (value === 0) return '$0'
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`
    if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}k`
    return `$${Math.round(value)}`
  }

  const money = (value: number) =>
    value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })

  return (
    <div ref={containerRef} className="tni-total-return" style={{
      margin: '22px 0 32px',
      padding: '20px',
      border: '1px solid #e4ebf3',
      borderRadius: 14,
      background: '#fbfdff',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14,
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#10233f' }}>
            {assetTicker} vs. S&P 500 — Total Return
          </h3>
          <p style={{ margin: '5px 0', color: '#64748b', fontSize: 13 }}>
            Growth of $10,000 · Dividends reinvested
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {periods.map(option => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                setPeriod(option.value)
                setSelected(null)
              }}
              style={{
                padding: '7px 11px',
                borderRadius: 8,
                border: '1px solid #dce5ef',
                background: period === option.value ? '#10233f' : '#fff',
                color: period === option.value ? '#fff' : '#334155',
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        marginTop: 18,
        fontSize: 13,
      }}>
        <span style={{ color: '#1677ff' }}>
          ● {assetTicker}: <strong>{money(active.asset)}</strong>
        </span>
        <span style={{ color: '#64748b' }}>
          ● S&P 500: <strong>{money(active.benchmark)}</strong>
        </span>
        <span style={{ color: '#64748b' }}>
          {active.year}
        </span>
      </div>

      <svg
        className="tni-total-return__chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${assetTicker} versus S&P 500 cumulative total return`}
        style={{ width: '100%', maxWidth: width, height: 'auto', display: 'block', marginTop: 12 }}
        onMouseLeave={() => setSelected(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map(fraction => {
          const value = max * fraction
          return (
            <g key={fraction}>
              <line
                x1={left}
                x2={width - right}
                y1={y(value)}
                y2={y(value)}
                stroke="#e5eaf1"
              />
              <text
                x={left - 10}
                y={y(value) + 4}
                textAnchor="end"
                fontSize={mobile ? 13 : 12}
                fontWeight={mobile ? 600 : 400}
                fill="#475569"
              >
                {mobile ? axisMoney(value) : money(value)}
              </text>
            </g>
          )
        })}

        <path d={line('benchmark')} fill="none"
          stroke="#94a3b8" strokeWidth="3" />
        <path d={line('asset')} fill="none"
          stroke="#1677ff" strokeWidth="3" />

        {visible.map((row, index) => (
          <rect
            key={row.year}
            x={Math.max(left, x(index) - chartWidth / Math.max(visible.length - 1, 1) / 2)}
            y={top}
            width={Math.min(chartWidth / Math.max(visible.length - 1, 1), width - right - Math.max(left, x(index) - chartWidth / Math.max(visible.length - 1, 1) / 2))}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setSelected(index)}
            onClick={() => setSelected(index)}
            onTouchStart={() => setSelected(index)}
            onFocus={() => setSelected(index)}
            tabIndex={0}
            role="button"
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setSelected(index)
              }
            }}
            aria-label={`${row.year}: ${assetTicker} ${money(row.asset)}, S&P 500 ${money(row.benchmark)}`}
          />
        ))}

        {visible.map((row, index) => {
          const last = visible.length - 1
          // Index-based interpolation ensures <=4 mobile labels, including endpoints.
          const tickCount = mobile ? Math.min(4, visible.length) : Math.min(7, visible.length)
          const tickIndices = new Set(Array.from({ length: tickCount }, (_, i) =>
            Math.round(i * last / Math.max(1, tickCount - 1)),
          ))
          if (!tickIndices.has(index)) return null
          return (
            <text
              key={row.year}
              className="tni-total-return__year"
              x={x(index)}
              y={height - 12}
              textAnchor={index === 0 ? 'start' : index === last ? 'end' : 'middle'}
              fontSize={mobile ? 20 : 12}
              fontWeight={mobile ? 650 : 400}
              fill="#475569"
            >
              {row.year}
            </text>
          )
        })}
      </svg>

      <p style={{ color: '#64748b', fontSize: 12, marginBottom: 0 }}>
        Annual observations through the last completed calendar year.
        Each selected period is rebased to $10,000.
        Sources: Stock adjusted-close total-return series;
        TNI S&P 500 historical total-return dataset.
      </p>

      <section
        aria-label={`${assetTicker} versus S&P 500 total return interpretation`}
        style={{
          marginTop: 24,
          paddingTop: 22,
          borderTop: '1px solid #e4ebf3',
        }}
      >
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.11em',
          textTransform: 'uppercase',
          color: '#64748b',
          marginBottom: 8,
        }}>
          Research Interpretation
        </div>

        <h4 style={{
          color: '#10233f',
          fontSize: 19,
          lineHeight: 1.4,
          margin: '0 0 12px',
        }}>
          {assetTicker} vs. S&amp;P 500: Total Return Analysis
        </h4>

        <p style={{
          color: '#475569',
          fontSize: 14,
          lineHeight: 1.85,
          margin: '0 0 16px',
        }}>
          Over the {periodLabel} ({firstPoint.year}–{lastPoint.year}),
          {assetTicker} generated a cumulative total return of{' '}
          <strong>{formatPercent(assetReturn)}</strong>, compared with{' '}
          <strong>{formatPercent(benchmarkReturn)}</strong> for the
          S&amp;P 500. {assetTicker} {relativeDescription} the benchmark by{' '}
          <strong>{Math.abs(relativeReturn).toFixed(1)} percentage points</strong>.
          Both comparisons incorporate reinvested dividends.
        </p>

        <h5 style={{
          color: '#10233f',
          fontSize: 15,
          margin: '18px 0 7px',
        }}>
          Understanding Relative Performance
        </h5>

        <p style={{
          color: '#475569',
          fontSize: 14,
          lineHeight: 1.85,
          margin: '0 0 14px',
        }}>
          The distance between the two cumulative-return lines
          illustrates how {assetTicker}'s investment performance has
          diverged from the broader market. A widening positive
          gap indicates relative outperformance, while a
          narrowing or negative gap indicates weaker relative
          performance. Results depend on the investment horizon,
          so selecting another period may change the comparison.
        </p>

        <h5 style={{
          color: '#10233f',
          fontSize: 15,
          margin: '18px 0 7px',
        }}>
          What Investors Can Learn
        </h5>

        <p style={{
          color: '#475569',
          fontSize: 14,
          lineHeight: 1.85,
          margin: 0,
        }}>
          {assetTicker} represents exposure to a single company's
          business performance, competitive position, and
          valuation. The S&amp;P 500 provides diversified
          exposure to large U.S. companies. Comparing their
          total returns helps distinguish company-specific
          investment outcomes from broad-market performance,
          although historical results do not predict future returns.
        </p>
      </section>
    </div>
  )
}
