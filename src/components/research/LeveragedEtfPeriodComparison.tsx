import { useMemo, useState } from 'react'

import { formatReturn } from '../../research/annual-returns/pageShared'

type Period = 'monthly' | 'weekly' | 'daily'

type PeriodRow = {
  date: string
  asset_return: number
  benchmark_return: number
  difference: number
  status: string
}

export type PeriodDataset = {
  asset: string
  benchmark: string
  return_type: string
  price_basis: string
  source: string
  methodology: string
  range: {
    first_date: string
    last_date: string
  }
  monthly: PeriodRow[]
  weekly: PeriodRow[]
  daily: PeriodRow[]
}

const periodLabels: Record<Period, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily',
}

function average(values: number[]) {
  if (values.length === 0) return 0

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  )
}

function formatDate(
  value: string,
  period: Period,
) {
  const date = new Date(
    `${value}T00:00:00Z`,
  )

  if (period === 'monthly') {
    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      },
    ).format(date)
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(date)
}

type Props = {
  dataset: PeriodDataset
}

export default function LeveragedEtfPeriodComparison({
  dataset,
}: Props) {
  const [period, setPeriod] =
    useState<Period>('monthly')

  const [showAll, setShowAll] =
    useState(false)

  const comparison = useMemo(() => {
    const rows = dataset[period]

    const completedRows =
      rows.filter(
        (row) =>
          row.status === 'complete',
      )

    const assetAverage =
      average(
        completedRows.map(
          (row) =>
            row.asset_return,
        ),
      )

    const benchmarkAverage =
      average(
        completedRows.map(
          (row) =>
            row.benchmark_return,
        ),
      )

    const outperformPeriods =
      completedRows.filter(
        (row) =>
          row.difference > 0,
      ).length

    const underperformPeriods =
      completedRows.filter(
        (row) =>
          row.difference < 0,
      ).length

    const ties =
      completedRows.length -
      outperformPeriods -
      underperformPeriods

    const current =
      rows.length > 0
        ? rows[rows.length - 1]
        : null

    return {
      rows,
      completedRows,
      assetAverage,
      benchmarkAverage,
      averageDifference:
        assetAverage -
        benchmarkAverage,
      outperformPeriods,
      underperformPeriods,
      ties,
      current,
    }
  }, [period])

  const visibleRows =
    showAll
      ? [...comparison.rows].reverse()
      : [...comparison.rows]
          .reverse()
          .slice(0, 10)

  const outperformPct =
    comparison.completedRows.length > 0
      ? (
          comparison.outperformPeriods /
          comparison.completedRows.length
        ) * 100
      : 0

  const periodLabel =
    periodLabels[period]

  return (
    <section
      aria-labelledby="leveraged-etf-period-comparison-heading"
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
        id="leveraged-etf-period-comparison-heading"
        style={{
          margin: '0 0 8px',
          color: '#10233f',
          fontSize: '24px',
          letterSpacing:
            '-0.02em',
        }}
      >
        {dataset.asset} vs.{' '}
        {dataset.benchmark} Returns
      </h2>

      <p
        style={{
          maxWidth: '900px',
          margin: '0 0 16px',
          color: '#6b7b90',
          fontSize: '13px',
          lineHeight: 1.7,
        }}
      >
        Compare {dataset.asset} and{' '}
        {dataset.benchmark} total returns
        using synchronized adjusted-close
        data. Difference is{' '}
        {dataset.asset} return minus{' '}
        {dataset.benchmark} return.
      </p>

      <div
        role="tablist"
        aria-label="Return comparison period"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        {(
          [
            'monthly',
            'weekly',
            'daily',
          ] as Period[]
        ).map((candidate) => {
          const active =
            candidate === period

          return (
            <button
              key={candidate}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setPeriod(candidate)
                setShowAll(false)
              }}
              style={{
                padding: '9px 14px',
                border: active
                  ? '1px solid #1677ff'
                  : '1px solid #d8e2ee',
                borderRadius: '8px',
                background: active
                  ? '#f0f6ff'
                  : '#ffffff',
                color: active
                  ? '#1267d6'
                  : '#29415f',
                fontSize: '12px',
                fontWeight: 750,
                cursor: 'pointer',
              }}
            >
              {periodLabels[candidate]}
            </button>
          )
        })}
      </div>

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
          label={`${periodLabel} Periods`}
          value={String(
            comparison.completedRows.length,
          )}
        />

        <MetricCard
          label={`${dataset.asset} Avg. Return`}
          value={formatReturn(
            comparison.assetAverage,
          )}
        />

        <MetricCard
          label={`${dataset.benchmark} Avg. Return`}
          value={formatReturn(
            comparison.benchmarkAverage,
          )}
        />

        <MetricCard
          label="Avg. Difference"
          value={formatReturn(
            comparison.averageDifference,
          )}
        />

        <MetricCard
          label="Outperformed"
          value={`${comparison.outperformPeriods} periods`}
          detail={`${outperformPct.toFixed(
            1,
          )}% of completed periods`}
        />

        <MetricCard
          label="Underperformed"
          value={`${comparison.underperformPeriods} periods`}
          detail={
            comparison.ties > 0
              ? `${comparison.ties} tied`
              : undefined
          }
        />
      </div>

      {comparison.current &&
        comparison.current.status ===
          'partial' && (
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
              Current {periodLabel.toLowerCase()}
              {' '}period through{' '}
              {formatDate(
                comparison.current.date,
                period,
              )}:
            </strong>{' '}
            {dataset.asset}{' '}
            {formatReturn(
              comparison.current
                .asset_return,
            )}
            {' · '}
            {dataset.benchmark}{' '}
            {formatReturn(
              comparison.current
                .benchmark_return,
            )}
            {' · '}
            Difference{' '}
            {formatReturn(
              comparison.current
                .difference,
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
                Period
              </th>

              <th style={headerCellStyle}>
                {dataset.asset}
              </th>

              <th style={headerCellStyle}>
                {dataset.benchmark}
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
                  row.difference > 0
                    ? 'Outperformed'
                    : row.difference < 0
                      ? 'Underperformed'
                      : 'Matched'

                return (
                  <tr
                    key={`${period}-${row.date}`}
                    style={{
                      borderTop:
                        '1px solid #edf1f6',
                    }}
                  >
                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign: 'left',
                        fontWeight: 700,
                        color: '#10233f',
                      }}
                    >
                      {formatDate(
                        row.date,
                        period,
                      )}
                      {row.status ===
                        'partial'
                        ? ' · MTD'
                        : ''}
                    </td>

                    <td style={bodyCellStyle}>
                      {formatReturn(
                        row.asset_return,
                      )}
                    </td>

                    <td style={bodyCellStyle}>
                      {formatReturn(
                        row.benchmark_return,
                      )}
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        fontWeight: 700,
                      }}
                    >
                      {formatReturn(
                        row.difference,
                      )}
                    </td>

                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign: 'left',
                        fontWeight: 700,
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
            setShowAll(
              (current) =>
                !current,
            )
          }
          style={{
            marginTop: '14px',
            padding: '9px 14px',
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
          {showAll
            ? `Show Recent 10 ${periodLabel} Periods`
            : `Show All ${comparison.rows.length} ${periodLabel} Periods`}
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
        Total-return comparison uses
        synchronized adjusted-close data.
        Monthly and weekly statistics exclude
        an in-progress period. Daily returns
        compare consecutive synchronized
        trading days.
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
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
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
