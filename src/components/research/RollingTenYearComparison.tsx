import { useMemo } from 'react'

import type {
  AnnualReturnsPageData,
} from '../../research/annual-returns/pageShared'

type Props = {
  assetName: string
  assetDataset: AnnualReturnsPageData
  benchmarkName?: string
  benchmarkDataset: AnnualReturnsPageData
}

type RollingPoint = {
  year: number
  asset: number
  benchmark: number
}

function rollingCagr(
  returns: number[],
): number {
  const growth = returns.reduce(
    (value, annualReturn) =>
      value * (1 + annualReturn / 100),
    1,
  )

  return (
    (Math.pow(growth, 1 / returns.length) - 1) *
    100
  )
}

export default function RollingTenYearComparison({
  assetName,
  assetDataset,
  benchmarkName = 'S&P 500',
  benchmarkDataset,
}: Props) {
  const points = useMemo(() => {
    const benchmarkByYear = new Map(
      benchmarkDataset.data.map((row) => [
        row.year,
        row.value,
      ]),
    )

    const common = assetDataset.data
      .filter((row) =>
        benchmarkByYear.has(row.year),
      )
      .map((row) => ({
        year: row.year,
        asset: row.value,
        benchmark:
          benchmarkByYear.get(row.year) as number,
      }))
      .sort((a, b) => a.year - b.year)

    const result: RollingPoint[] = []

    for (let i = 9; i < common.length; i += 1) {
      const window = common.slice(i - 9, i + 1)

      const consecutive =
        window[9].year - window[0].year === 9

      if (!consecutive) {
        continue
      }

      result.push({
        year: window[9].year,
        asset: rollingCagr(
          window.map((row) => row.asset),
        ),
        benchmark: rollingCagr(
          window.map((row) => row.benchmark),
        ),
      })
    }

    return result
  }, [assetDataset, benchmarkDataset])

  if (!points.length) {
    return null
  }

  const width = 900
  const height = 390
  const left = 62
  const right = 24
  const top = 28
  const bottom = 52

  const values = points.flatMap((point) => [
    point.asset,
    point.benchmark,
  ])

  const minValue = Math.min(...values, 0)
  const maxValue = Math.max(...values, 0)

  const range =
    maxValue - minValue || 1

  const x = (index: number) =>
    left +
    (index / Math.max(points.length - 1, 1)) *
      (width - left - right)

  const y = (value: number) =>
    top +
    ((maxValue - value) / range) *
      (height - top - bottom)

  const pathFor = (
    key: 'asset' | 'benchmark',
  ) =>
    points
      .map(
        (point, index) =>
          `${index === 0 ? 'M' : 'L'} ${x(
            index,
          ).toFixed(2)} ${y(
            point[key],
          ).toFixed(2)}`,
      )
      .join(' ')

  const firstYear = points[0].year
  const lastYear = points[points.length - 1].year

  return (
    <section
      style={{
        marginBottom: '34px',
        padding: '22px',
        border: '1px solid #e4ebf3',
        borderRadius: '14px',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          marginBottom: '6px',
          color: '#1677ff',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Comparative Intelligence
      </div>

      <h2
        style={{
          margin: '0 0 8px',
          color: '#10233f',
          fontSize: '24px',
          letterSpacing: '-0.02em',
        }}
      >
        {assetName} vs. {benchmarkName} —
        Rolling 10-Year Annualized Returns
      </h2>

      <p
        style={{
          maxWidth: '900px',
          margin: '0 0 18px',
          color: '#6b7b90',
          fontSize: '13px',
          lineHeight: 1.7,
        }}
      >
        Each point shows the annualized price return
        over the trailing 10 completed calendar years.
        This provides a long-horizon comparison without
        relying on a single calendar year's result.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '18px',
          marginBottom: '8px',
          color: '#43546a',
          fontSize: '12px',
          fontWeight: 700,
        }}
      >
        <span>● {assetName}</span>
        <span>○ {benchmarkName}</span>
      </div>

      <div
        style={{
          width: '100%',
          overflowX: 'auto',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${assetName} versus ${benchmarkName} rolling 10-year annualized returns`}
          style={{
            display: 'block',
            width: '100%',
            minWidth: '620px',
            height: 'auto',
          }}
        >
          <line
            x1={left}
            x2={width - right}
            y1={y(0)}
            y2={y(0)}
            stroke="#dfe8f3"
            strokeWidth="1"
          />

          <path
            d={pathFor('benchmark')}
            fill="none"
            stroke="#9aa9bc"
            strokeWidth="2.5"
          />

          <path
            d={pathFor('asset')}
            fill="none"
            stroke="#1677ff"
            strokeWidth="3"
          />

          {points.map((point, index) => (
            <g key={point.year}>
              <circle
                cx={x(index)}
                cy={y(point.asset)}
                r="5"
                fill="#1677ff"
              >
                <title>
                  {`${point.year} — ${assetName}: ${point.asset.toFixed(
                    2,
                  )}% | ${benchmarkName}: ${point.benchmark.toFixed(
                    2,
                  )}% | Excess: ${(point.asset - point.benchmark).toFixed(
                    2,
                  )}%`}
                </title>
              </circle>

              <circle
                cx={x(index)}
                cy={y(point.benchmark)}
                r="4"
                fill="#ffffff"
                stroke="#7d8da3"
                strokeWidth="2"
              >
                <title>
                  {`${point.year} — ${benchmarkName}: ${point.benchmark.toFixed(
                    2,
                  )}%`}
                </title>
              </circle>
            </g>
          ))}

          <text
            x={left}
            y={height - 18}
            fill="#6b7b90"
            fontSize="11"
          >
            {firstYear}
          </text>

          <text
            x={width - right}
            y={height - 18}
            textAnchor="end"
            fill="#6b7b90"
            fontSize="11"
          >
            {lastYear}
          </text>

          <text
            x="16"
            y={height / 2}
            transform={`rotate(-90 16 ${height / 2})`}
            textAnchor="middle"
            fill="#6b7b90"
            fontSize="11"
          >
            Annualized Return (%)
          </text>
        </svg>
      </div>

      <p
        style={{
          margin: '12px 0 0',
          color: '#7a899c',
          fontSize: '11px',
          lineHeight: 1.6,
        }}
      >
        Price-return comparison. Rolling results are
        calculated from annual calendar-year returns and
        exclude the current incomplete year.
      </p>
    </section>
  )
}
