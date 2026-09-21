import { useMemo, useState } from 'react'

import {
  formatReturn,
  type AnnualReturnsPageData,
} from '../../research/annual-returns/pageShared'

type Props = {
  assetName: string
  assetDataset: AnnualReturnsPageData
  benchmarkName?: string
  benchmarkDataset: AnnualReturnsPageData
  assetAsOfDate?: string
  benchmarkAsOfDate?: string
}

type ComparisonRow = {
  year: number
  assetReturn: number
  benchmarkReturn: number
  excessReturn: number
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  )
}

export default function AnnualReturnsBenchmarkComparison({
  assetName,
  assetDataset,
  benchmarkName = 'S&P 500',
  benchmarkDataset,
  assetAsOfDate,
  benchmarkAsOfDate,
}: Props) {
  const comparison = useMemo(() => {
    const currentYear =
      assetDataset.current_year.year

    const benchmarkByYear =
      new Map(
        benchmarkDataset.data.map(
          (record) => [
            record.year,
            record.value,
          ],
        ),
      )

    const rows: ComparisonRow[] =
      assetDataset.data
        .filter(
          (record) =>
            record.year < currentYear &&
            benchmarkByYear.has(
              record.year,
            ),
        )
        .map((record) => {
          const benchmarkReturn =
            benchmarkByYear.get(
              record.year,
            ) as number

          return {
            year: record.year,
            assetReturn:
              record.value,
            benchmarkReturn,
            excessReturn:
              record.value -
              benchmarkReturn,
          }
        })

    const assetAverage =
      average(
        rows.map(
          (row) =>
            row.assetReturn,
        ),
      )

    const benchmarkAverage =
      average(
        rows.map(
          (row) =>
            row.benchmarkReturn,
        ),
      )

    const outperformYears =
      rows.filter(
        (row) =>
          row.excessReturn > 0,
      ).length

    const underperformYears =
      rows.filter(
        (row) =>
          row.excessReturn < 0,
      ).length

    const tieYears =
      rows.length -
      outperformYears -
      underperformYears

    const assetCurrent =
      assetDataset.data.find(
        (record) =>
          record.year ===
          currentYear,
      )

    const benchmarkCurrent =
      benchmarkDataset.data.find(
        (record) =>
          record.year ===
          currentYear,
      )

    const currentYearComparison =
      assetCurrent &&
      benchmarkCurrent
        ? {
            year: currentYear,
            assetReturn:
              assetCurrent.value,
            benchmarkReturn:
              benchmarkCurrent.value,
            excessReturn:
              assetCurrent.value -
              benchmarkCurrent.value,
          }
        : null

    return {
      rows,
      assetAverage,
      benchmarkAverage,
      averageExcessReturn:
        assetAverage -
        benchmarkAverage,
      outperformYears,
      underperformYears,
      tieYears,
      currentYearComparison,
    }
  }, [
    assetDataset,
    benchmarkDataset,
  ])

  const [showAllYears, setShowAllYears] =
    useState(false)

  if (
    comparison.rows.length === 0
  ) {
    return null
  }

  const firstYear =
    comparison.rows[0].year

  const lastYear =
    comparison.rows[
      comparison.rows.length - 1
    ].year

  const visibleRows =
    showAllYears
      ? [...comparison.rows].reverse()
      : [...comparison.rows]
          .reverse()
          .slice(0, 10)

  const outperformPct =
    comparison.rows.length > 0
      ? (
          comparison.outperformYears /
          comparison.rows.length *
          100
        )
      : 0

  return (
    <section
      aria-labelledby="benchmark-comparison-heading"
      style={{
        marginBottom: '34px',
        padding: '22px',
        border:
          '1px solid #e4ebf3',
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
          letterSpacing:
            '0.08em',
          textTransform:
            'uppercase',
        }}
      >
        Benchmark Comparison
      </div>

      <h2
        id="benchmark-comparison-heading"
        style={{
          margin: '0 0 8px',
          color: '#10233f',
          fontSize: '24px',
          letterSpacing:
            '-0.02em',
        }}
      >
        {assetName} vs.{' '}
        {benchmarkName} Returns
      </h2>

      <p
        style={{
          maxWidth: '900px',
          margin: '0 0 20px',
          color: '#6b7b90',
          fontSize: '13px',
          lineHeight: 1.7,
        }}
      >
        Annual price-return comparison
        across overlapping completed
        calendar years from {firstYear}{' '}
        through {lastYear}. Excess return
        is {assetName} return minus{' '}
        {benchmarkName} return.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '22px',
        }}
      >
        <MetricCard
          label="Years Compared"
          value={String(
            comparison.rows.length,
          )}
        />

        <MetricCard
          label={`${assetName} Avg. Return`}
          value={formatReturn(
            comparison.assetAverage,
          )}
        />

        <MetricCard
          label={`${benchmarkName} Avg. Return`}
          value={formatReturn(
            comparison.benchmarkAverage,
          )}
        />

        <MetricCard
          label="Avg. Excess Return"
          value={formatReturn(
            comparison.averageExcessReturn,
          )}
        />

        <MetricCard
          label="Outperformed"
          value={`${comparison.outperformYears} years`}
          detail={`${outperformPct.toFixed(
            1,
          )}% of comparable years`}
        />

        <MetricCard
          label="Underperformed"
          value={`${comparison.underperformYears} years`}
          detail={
            comparison.tieYears > 0
              ? `${comparison.tieYears} tied`
              : undefined
          }
        />
      </div>

      {comparison.currentYearComparison && (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 16px',
            border:
              '1px solid #dfe8f3',
            borderRadius: '10px',
            background: '#f8fbff',
            color: '#334a68',
            fontSize: '13px',
            lineHeight: 1.7,
          }}
        >
          <strong
            style={{
              color: '#10233f',
            }}
          >
            {
              comparison
                .currentYearComparison
                .year
            }{' '}
            YTD:
          </strong>{' '}
          {assetName}{' '}
          {formatReturn(
            comparison
              .currentYearComparison
              .assetReturn,
          )}
          {assetAsOfDate
            ? ` (through ${assetAsOfDate})`
            : ''}
          {' · '}
          {benchmarkName}{' '}
          {formatReturn(
            comparison
              .currentYearComparison
              .benchmarkReturn,
          )}
          {benchmarkAsOfDate
            ? ` (through ${benchmarkAsOfDate})`
            : ''}
          {' · '}
          Difference{' '}
          {formatReturn(
            comparison
              .currentYearComparison
              .excessReturn,
          )}
        </div>
      )}

      <div
        style={{
          overflowX: 'auto',
          border:
            '1px solid #e4ebf3',
          borderRadius: '10px',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse:
              'collapse',
            minWidth: '620px',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  '#f8fbff',
                color: '#53657c',
                textAlign: 'right',
              }}
            >
              <th
                style={{
                  ...headerCellStyle,
                  textAlign: 'left',
                }}
              >
                Year
              </th>

              <th style={headerCellStyle}>
                {assetName}
              </th>

              <th style={headerCellStyle}>
                {benchmarkName}
              </th>

              <th style={headerCellStyle}>
                Difference
              </th>

              <th
                style={{
                  ...headerCellStyle,
                  textAlign: 'left',
                }}
              >
                Result
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map(
              (row) => {
                const result =
                  row.excessReturn > 0
                    ? 'Outperformed'
                    : row.excessReturn < 0
                      ? 'Underperformed'
                      : 'Matched'

                return (
                  <tr
                    key={row.year}
                    style={{
                      borderTop:
                        '1px solid #edf1f6',
                    }}
                  >
                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign:
                          'left',
                        fontWeight:
                          700,
                        color:
                          '#10233f',
                      }}
                    >
                      {row.year}
                    </td>

                    <td
                      style={
                        bodyCellStyle
                      }
                    >
                      {formatReturn(
                        row.assetReturn,
                      )}
                    </td>

                    <td
                      style={
                        bodyCellStyle
                      }
                    >
                      {formatReturn(
                        row.benchmarkReturn,
                      )}
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        fontWeight:
                          700,
                      }}
                    >
                      {formatReturn(
                        row.excessReturn,
                      )}
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign:
                          'left',
                        fontWeight:
                          700,
                      }}
                    >
                      {result}
                    </td>
                  </tr>
                )
              },
            )}
          </tbody>
        </table>
      </div>

      {comparison.rows.length > 10 && (
        <button
          type="button"
          onClick={() =>
            setShowAllYears(
              (current) =>
                !current,
            )
          }
          style={{
            marginTop: '14px',
            padding:
              '9px 14px',
            border:
              '1px solid #d8e2ee',
            borderRadius: '8px',
            background: '#ffffff',
            color: '#29415f',
            fontSize: '12px',
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          {showAllYears
            ? 'Show Recent 10 Years'
            : `Show All ${comparison.rows.length} Years`}
        </button>
      )}

      <p
        style={{
          margin: '14px 0 0',
          color: '#7a899c',
          fontSize: '11px',
          lineHeight: 1.6,
        }}
      >
        Comparison uses calendar-year
        price returns over the common
        historical period. Current-year
        YTD performance is shown
        separately and is excluded from
        completed-year statistics.
      </p>
    </section>
  )
}

const headerCellStyle = {
  padding: '11px 12px',
  fontWeight: 750,
} as const

const bodyCellStyle = {
  padding: '10px 12px',
  textAlign: 'right',
  color: '#44566d',
} as const

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div
      style={{
        padding: '14px',
        border:
          '1px solid #e4ebf3',
        borderRadius: '10px',
        background: '#f8fbff',
      }}
    >
      <div
        style={{
          marginBottom: '6px',
          color: '#6b7b90',
          fontSize: '11px',
          fontWeight: 750,
          letterSpacing:
            '0.04em',
          textTransform:
            'uppercase',
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: '#10233f',
          fontSize: '20px',
          fontWeight: 800,
        }}
      >
        {value}
      </div>

      {detail && (
        <div
          style={{
            marginTop: '4px',
            color: '#7a899c',
            fontSize: '11px',
          }}
        >
          {detail}
        </div>
      )}
    </div>
  )
}
