import { useMemo, useState } from 'react'

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
  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null)

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
  const height = 410
  const left = 64
  const right = 24
  const top = 34
  const bottom = 58

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

  const assetTicker =
    assetDataset.ticker ||
    assetDataset.symbol ||
    assetName

  const benchmarkTicker =
    benchmarkDataset.ticker ||
    benchmarkDataset.symbol ||
    benchmarkName

  const selected =
    selectedIndex === null
      ? points[points.length - 1]
      : points[selectedIndex]

  const selectedYearIndex =
    selectedIndex === null
      ? points.length - 1
      : selectedIndex

  const excess =
    selected.asset - selected.benchmark

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

      <h2 className="tni-rolling-title">
        {assetTicker} vs. {benchmarkTicker}
      </h2>

      <p className="tni-rolling-subtitle">
        Rolling 10-Year Annualized Returns
      </p>

      <p className="tni-rolling-description">
        Each point shows the annualized price return
        over the trailing 10 completed calendar years.
        Select a year to compare the long-term return
        for {assetTicker} and {benchmarkTicker}.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px 22px',
          marginBottom: '14px',
          color: '#10233f',
          fontSize: 'inherit',
          fontWeight: 800,
        }}
        className="tni-rolling-legend"
      >
        <span>
          <span
            style={{
              color: '#1677ff',
              fontSize: '17px',
            }}
          >
            ●
          </span>{' '}
          {assetTicker}
        </span>

        <span>
          <span
            style={{
              color: '#7d8da3',
              fontSize: '17px',
            }}
          >
            ●
          </span>{' '}
          {benchmarkTicker}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, minmax(0, 1fr))',
          gap: '8px',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '9px',
            background: '#f5f9ff',
          }}
        >
          <div
            style={{
              color: '#6b7b90',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {selected.year}
          </div>

          <strong
            style={{
              display: 'block',
              marginTop: '3px',
              color: '#1677ff',
            }}
            className="tni-rolling-value"
          >
            {selected.asset.toFixed(2)}%
          </strong>

          <span
            style={{
              color: '#6b7b90',
              fontSize: '11px',
            }}
          >
            {assetTicker}
          </span>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: '9px',
            background: '#f7f8fa',
          }}
        >
          <div
            style={{
              color: '#6b7b90',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {selected.year}
          </div>

          <strong
            style={{
              display: 'block',
              marginTop: '3px',
              color: '#43546a',
            }}
            className="tni-rolling-value"
          >
            {selected.benchmark.toFixed(2)}%
          </strong>

          <span
            style={{
              color: '#6b7b90',
              fontSize: '11px',
            }}
          >
            {benchmarkTicker}
          </span>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: '9px',
            background:
              excess >= 0
                ? '#f1faf5'
                : '#fff6f5',
          }}
        >
          <div
            style={{
              color: '#6b7b90',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Excess
          </div>

          <strong
            style={{
              display: 'block',
              marginTop: '3px',
              color:
                excess >= 0
                  ? '#067647'
                  : '#b42318',
            }}
            className="tni-rolling-value"
          >
            {excess >= 0 ? '+' : ''}
            {excess.toFixed(2)}%
          </strong>

          <span
            style={{
              color: '#6b7b90',
              fontSize: '11px',
            }}
          >
            {assetTicker} − {benchmarkTicker}
          </span>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${assetTicker} versus ${benchmarkTicker} rolling 10-year annualized returns`}
          style={{
            display: 'block',
            width: '100%',
            minWidth: '620px',
            height: 'auto',
            cursor: 'crosshair',
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
            strokeWidth="3"
          />

          <path
            d={pathFor('asset')}
            fill="none"
            stroke="#1677ff"
            strokeWidth="4"
          />

          {points.map((point, index) => {
            const isSelected =
              index === selectedYearIndex

            return (
              <g key={point.year}>
                <circle
                  cx={x(index)}
                  cy={y(point.asset)}
                  r={isSelected ? 7 : 5}
                  fill="#1677ff"
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 3 : 1}
                  style={{
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() =>
                    setSelectedIndex(index)
                  }
                  onClick={() =>
                    setSelectedIndex(index)
                  }
                  tabIndex={0}
                  role="button"
                  aria-label={`${point.year}: ${assetTicker} ${point.asset.toFixed(
                    2,
                  )}%, ${benchmarkTicker} ${point.benchmark.toFixed(
                    2,
                  )}%`}
                />

                <circle
                  cx={x(index)}
                  cy={y(point.benchmark)}
                  r={isSelected ? 6 : 4}
                  fill="#ffffff"
                  stroke="#7d8da3"
                  strokeWidth="2"
                  style={{
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() =>
                    setSelectedIndex(index)
                  }
                  onClick={() =>
                    setSelectedIndex(index)
                  }
                />

                {isSelected && (
                  <line
                    x1={x(index)}
                    x2={x(index)}
                    y1={top}
                    y2={height - bottom}
                    stroke="#c8d5e5"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    pointerEvents="none"
                  />
                )}
              </g>
            )
          })}

          <text
            x={left}
            y={height - 18}
            fill="#43546a"
            className="tni-rolling-svg-label"
            fontWeight="700"
          >
            {firstYear}
          </text>

          <text
            x={width - right}
            y={height - 18}
            textAnchor="end"
            fill="#43546a"
            className="tni-rolling-svg-label"
            fontWeight="700"
          >
            {lastYear}
          </text>

          <text
            x="16"
            y={height / 2}
            transform={`rotate(-90 16 ${height / 2})`}
            textAnchor="middle"
            fill="#43546a"
            className="tni-rolling-svg-axis-title"
            fontWeight="700"
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
        exclude the current incomplete year. Hover or tap
        a year to inspect the values.
      </p>
    </section>
  )
}
