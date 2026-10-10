import { useMemo, useState } from 'react'
import nikeData from '../../data/charts/nkeReturnMethods.json'
import sp500Data from '../../data/sp500-historical-return-methods.json'

type AnnualRow = {
  year: number
  total_return?: number | null
  is_ytd?: boolean
}

type Point = {
  year: number
  nike: number
  benchmark: number
}

const periods = [
  { label: '5Y', value: 5 },
  { label: '10Y', value: 10 },
  { label: '20Y', value: 20 },
  { label: 'Max', value: 0 },
]

export default function StockTotalReturnComparison() {
  const [period, setPeriod] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const points = useMemo(() => {
    const nike = (nikeData.data as AnnualRow[])
    const benchmark = new Map(
      (sp500Data.data as AnnualRow[])
        .filter(row => typeof row.total_return === 'number')
        .map(row => [row.year, row.total_return as number]),
    )

    const common = nike
      .filter(row =>
        !row.is_ytd &&
        typeof row.total_return === 'number' &&
        benchmark.has(row.year),
      )
      .sort((a, b) => a.year - b.year)

    const result: Point[] = []
    let nikeGrowth = 10000
    let benchmarkGrowth = 10000

    for (const row of common) {
      const benchmarkReturn = benchmark.get(row.year)!
      nikeGrowth *= 1 + row.total_return! / 100
      benchmarkGrowth *= 1 + benchmarkReturn / 100

      result.push({
        year: row.year,
        nike: nikeGrowth,
        benchmark: benchmarkGrowth,
      })
    }

    return result
  }, [])

  const visible = useMemo(() => {
    if (!points.length) return []
    if (!period) return points

    // Rebase the selected window to $10,000.
    const window = points.slice(-(period + 1))
    if (window.length < 2) return points

    const nikeBase = window[0].nike
    const benchmarkBase = window[0].benchmark

    return window.map(row => ({
      year: row.year,
      nike: row.nike / nikeBase * 10000,
      benchmark: row.benchmark / benchmarkBase * 10000,
    }))
  }, [points, period])

  if (visible.length < 2) return null

  const width = 900
  const height = 340
  const left = 78
  const right = 25
  const top = 24
  const bottom = 46

  const chartWidth = width - left - right
  const chartHeight = height - top - bottom

  const max = Math.max(
    ...visible.flatMap(row => [row.nike, row.benchmark]),
    10000,
  )

  const x = (index: number) =>
    left + index / (visible.length - 1) * chartWidth

  const y = (value: number) =>
    top + chartHeight - value / max * chartHeight

  const line = (key: 'nike' | 'benchmark') =>
    visible.map((row, index) =>
      `${index === 0 ? 'M' : 'L'}${x(index).toFixed(2)},${y(row[key]).toFixed(2)}`,
    ).join(' ')

  const activeIndex = selected ?? visible.length - 1
  const active = visible[activeIndex]

  // NKE_TOTAL_RETURN_INTERPRETATION
  const firstPoint = visible[0]
  const lastPoint = visible[visible.length - 1]

  const nikeReturn =
    (lastPoint.nike / firstPoint.nike - 1) * 100
  const benchmarkReturn =
    (lastPoint.benchmark / firstPoint.benchmark - 1) * 100
  const relativeReturn = nikeReturn - benchmarkReturn

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

  const money = (value: number) =>
    value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })

  return (
    <div style={{
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
            Nike vs. S&P 500 — Total Return
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
          ● Nike: <strong>{money(active.nike)}</strong>
        </span>
        <span style={{ color: '#64748b' }}>
          ● S&P 500: <strong>{money(active.benchmark)}</strong>
        </span>
        <span style={{ color: '#64748b' }}>
          {active.year}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Nike versus S&P 500 cumulative total return"
        style={{ width: '100%', display: 'block', marginTop: 12 }}
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
                fontSize="12"
                fill="#64748b"
              >
                {money(value)}
              </text>
            </g>
          )
        })}

        <path d={line('benchmark')} fill="none"
          stroke="#94a3b8" strokeWidth="3" />
        <path d={line('nike')} fill="none"
          stroke="#1677ff" strokeWidth="3" />

        {visible.map((row, index) => (
          <rect
            key={row.year}
            x={x(index) - chartWidth / visible.length / 2}
            y={top}
            width={chartWidth / visible.length}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setSelected(index)}
            onFocus={() => setSelected(index)}
            tabIndex={0}
            aria-label={`${row.year}: Nike ${money(row.nike)}, S&P 500 ${money(row.benchmark)}`}
          />
        ))}

        {visible
          .filter((_, index) =>
            index === 0 ||
            index === visible.length - 1 ||
            index % Math.max(1, Math.ceil(visible.length / 6)) === 0,
          )
          .map(row => (
            <text
              key={row.year}
              x={x(visible.indexOf(row))}
              y={height - 12}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {row.year}
            </text>
          ))}
      </svg>

      <p style={{ color: '#64748b', fontSize: 12, marginBottom: 0 }}>
        Annual observations through the last completed calendar year.
        Each selected period is rebased to $10,000.
        Sources: Yahoo Finance adjusted close (NKE);
        TNI S&P 500 historical total-return dataset.
      </p>

      <section
        aria-label="Nike versus S&P 500 total return interpretation"
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
          Nike vs. S&amp;P 500: Total Return Analysis
        </h4>

        <p style={{
          color: '#475569',
          fontSize: 14,
          lineHeight: 1.85,
          margin: '0 0 16px',
        }}>
          Over the {periodLabel} ({firstPoint.year}–{lastPoint.year}),
          Nike generated a cumulative total return of{' '}
          <strong>{formatPercent(nikeReturn)}</strong>, compared with{' '}
          <strong>{formatPercent(benchmarkReturn)}</strong> for the
          S&amp;P 500. Nike {relativeDescription} the benchmark by{' '}
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
          illustrates how Nike's investment performance has
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
          Nike represents exposure to a single company's
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
