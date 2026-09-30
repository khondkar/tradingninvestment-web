import {
  useMemo,
  useState,
} from 'react'

import type {
  SP500ReturnMethodChartRow,
} from './SP500ReturnMethodChart'

import {
  useEffect,
  useRef,
} from 'react'

import {
  renderDividendCompoundingChart,
} from '../../charts/tni/renderDividendCompoundingChart'

type PeriodKey =
  | 'full'
  | '100'
  | '50'
  | '30'
  | '20'
  | '10'

type Props = {
  data: SP500ReturnMethodChartRow[]
}

type WealthPoint = {
  year: number
  priceWealth: number
  totalWealth: number
  contribution: number
  contributionPct: number
}

const STARTING_INVESTMENT = 10000

const PERIODS: {
  key: PeriodKey
  label: string
  years: number | null
}[] = [
  {
    key: 'full',
    label: 'FULL HISTORY',
    years: null,
  },
  {
    key: '100',
    label: '100Y',
    years: 100,
  },
  {
    key: '50',
    label: '50Y',
    years: 50,
  },
  {
    key: '30',
    label: '30Y',
    years: 30,
  },
  {
    key: '20',
    label: '20Y',
    years: 20,
  },
  {
    key: '10',
    label: '10Y',
    years: 10,
  },
]

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

function formatPercent(
  value: number,
): string {
  return `${value.toFixed(1)}%`
}

function calculateCagr(
  startingValue: number,
  endingValue: number,
  years: number,
): number {
  if (
    startingValue <= 0 ||
    endingValue <= 0 ||
    years <= 0
  ) {
    return 0
  }

  return (
    (
      Math.pow(
        endingValue / startingValue,
        1 / years,
      ) - 1
    ) * 100
  )
}

function buildWealthSeries(
  rows: SP500ReturnMethodChartRow[],
  years: number | null,
) {
  const completed =
    [...rows]
      .filter(
        (row) =>
          !row.is_ytd &&
          Number.isFinite(
            row.price_return,
          ) &&
          Number.isFinite(
            row.total_return,
          ),
      )
      .sort(
        (a, b) =>
          a.year - b.year,
      )

  const selected =
    years === null
      ? completed
      : completed.slice(
          -Math.min(
            years,
            completed.length,
          ),
        )

  if (selected.length === 0) {
    return null
  }

  let priceWealth =
    STARTING_INVESTMENT

  let totalWealth =
    STARTING_INVESTMENT

  const points: WealthPoint[] = [
    {
      year:
        selected[0].year - 1,

      priceWealth:
        STARTING_INVESTMENT,

      totalWealth:
        STARTING_INVESTMENT,

      contribution: 0,

      contributionPct: 0,
    },
  ]

  for (const row of selected) {
    priceWealth *=
      1 +
      row.price_return / 100

    totalWealth *=
      1 +
      row.total_return / 100

    const contribution =
      totalWealth -
      priceWealth

    const contributionPct =
      totalWealth !== 0
        ? (
            contribution /
            totalWealth
          ) * 100
        : 0

    points.push({
      year: row.year,
      priceWealth,
      totalWealth,
      contribution,
      contributionPct,
    })
  }

  const ending =
    points[
      points.length - 1
    ]

  const observationCount =
    selected.length

  return {
    points,

    startYear:
      selected[0].year,

    endYear:
      selected[
        selected.length - 1
      ].year,

    observationCount,

    startingInvestment:
      STARTING_INVESTMENT,

    priceEndingValue:
      ending.priceWealth,

    totalEndingValue:
      ending.totalWealth,

    contribution:
      ending.contribution,

    contributionPct:
      ending.contributionPct,

    priceContributionPct:
      ending.totalWealth !== 0
        ? (
            ending.priceWealth /
            ending.totalWealth
          ) * 100
        : 0,

    priceCagr:
      calculateCagr(
        STARTING_INVESTMENT,
        ending.priceWealth,
        observationCount,
      ),

    totalCagr:
      calculateCagr(
        STARTING_INVESTMENT,
        ending.totalWealth,
        observationCount,
      ),
  }
}

export default function DividendCompoundingExplorer({
  data,
}: Props) {
  const [
    selectedPeriod,
    setSelectedPeriod,
  ] =
    useState<PeriodKey>('20')

  const [
    showAllRows,
    setShowAllRows,
  ] =
    useState(false)

  const chartRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const period =
    PERIODS.find(
      (item) =>
        item.key === selectedPeriod,
    ) ?? PERIODS[0]

  const analysis =
    useMemo(
      () =>
        buildWealthSeries(
          data,
          period.years,
        ),
      [
        data,
        period.years,
      ],
    )

  if (analysis === null) {
    return null
  }

  const annualRows =
    analysis.points.slice(1)

  const visibleRows =
    showAllRows ||
    annualRows.length <= 6
      ? annualRows
      : [
          ...annualRows.slice(0, 3),
          ...annualRows.slice(-3),
        ]

  function selectPeriod(
    key: PeriodKey,
  ) {
    setSelectedPeriod(key)
    setShowAllRows(false)
  }

  useEffect(() => {
    const container =
      chartRef.current

    if (
      container === null ||
      analysis === null
    ) {
      return
    }

    const cleanup =
      renderDividendCompoundingChart(
        container,
        {
          title:
            `Growth of ${formatCurrency(
              analysis.startingInvestment,
            )}: Price Return vs. Total Return`,

          subtitle:
            `${analysis.startYear}–${analysis.endYear}`
            + ` · ${analysis.observationCount} completed years`
            + ' · Dividends reinvested in total return',

          data:
            analysis.points,

          height: 540,
        },
      )

    return cleanup
  }, [analysis])

  return (
    <div className="tni-dividend-explorer">
      <div className="tni-dividend-explorer__periods">
        {PERIODS.map(
          (item) => (
            <button
              key={item.key}
              type="button"
              className={
                selectedPeriod ===
                item.key
                  ? 'is-active'
                  : ''
              }
              onClick={() =>
                selectPeriod(
                  item.key,
                )
              }
            >
              {item.label}
            </button>
          ),
        )}
      </div>

      <div
        className="tni-dividend-explorer__chart"
        ref={chartRef}
      />

      <section className="tni-dividend-explorer__breakdown">
        <div className="tni-dividend-explorer__section-heading">
          <span>
            RETURN BREAKDOWN
          </span>

          <strong>
            {analysis.observationCount}
            -Year Comparison
          </strong>
        </div>

        <div className="tni-dividend-explorer__table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  Return Component
                </th>

                <th>
                  Ending Value
                </th>

                <th>
                  CAGR
                </th>

                <th>
                  Contribution
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <th>
                  Price Return
                </th>

                <td>
                  {formatCurrency(
                    analysis
                      .priceEndingValue,
                  )}
                </td>

                <td>
                  {formatPercent(
                    analysis.priceCagr,
                  )}
                </td>

                <td>
                  <strong className="tni-dividend-explorer__pct">
                    {formatPercent(
                      analysis
                        .priceContributionPct,
                    )}
                  </strong>
                </td>
              </tr>

              <tr className="is-contribution">
                <th>
                  Dividend +
                  Reinvestment
                </th>

                <td>
                  +
                  {formatCurrency(
                    analysis.contribution,
                  )}
                </td>

                <td>
                  —
                </td>

                <td>
                  <strong className="tni-dividend-explorer__pct">
                    {formatPercent(
                      analysis
                        .contributionPct,
                    )}
                  </strong>
                </td>
              </tr>

              <tr className="is-total">
                <th>
                  Total Return
                </th>

                <td>
                  {formatCurrency(
                    analysis
                      .totalEndingValue,
                  )}
                </td>

                <td>
                  {formatPercent(
                    analysis.totalCagr,
                  )}
                </td>

                <td>
                  <strong>
                    100.0%
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="tni-dividend-explorer__history">
        <div className="tni-dividend-explorer__section-heading">
          <span>
            CONTRIBUTION THROUGH TIME
          </span>

          <strong>
            How Reinvestment
            Compounded
          </strong>
        </div>

        <div className="tni-dividend-explorer__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Year</th>

                <th>
                  Price Wealth
                </th>

                <th>
                  Total Wealth
                </th>

                <th>
                  Dividend +
                  Reinvestment
                </th>

                <th>
                  Contribution
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.map(
                (
                  row,
                  index,
                ) => {
                  const needsDivider =
                    !showAllRows &&
                    annualRows.length >
                      6 &&
                    index === 3

                  return (
                    <tr
                      key={row.year}
                      className={
                        needsDivider
                          ? 'has-gap'
                          : ''
                      }
                    >
                      <th>
                        {needsDivider && (
                          <span className="tni-dividend-explorer__ellipsis">
                            ···
                          </span>
                        )}

                        {row.year}
                      </th>

                      <td>
                        {formatCurrency(
                          row.priceWealth,
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          row.totalWealth,
                        )}
                      </td>

                      <td>
                        +
                        {formatCurrency(
                          row.contribution,
                        )}
                      </td>

                      <td>
                        <strong className="tni-dividend-explorer__pct">
                          {formatPercent(
                            row.contributionPct,
                          )}
                        </strong>
                      </td>
                    </tr>
                  )
                },
              )}
            </tbody>
          </table>
        </div>

        {annualRows.length > 6 && (
          <button
            type="button"
            className="tni-dividend-explorer__show-all"
            onClick={() =>
              setShowAllRows(
                (current) =>
                  !current,
              )
            }
          >
            {showAllRows
              ? 'SHOW SUMMARY ↑'
              : (
                `SHOW ALL ${
                  annualRows.length
                } YEARS ↓`
              )}
          </button>
        )}
      </section>

      <p className="tni-dividend-explorer__definition">
        Contribution % represents
        the share of ending
        total-return wealth
        associated with the
        difference between the
        dividend-reinvested
        total-return path and the
        price-only path. It is not
        the historical dividend
        yield.
      </p>

      <style>{`
        .tni-dividend-explorer {
          margin-top: 24px;
        }

        .tni-dividend-explorer__periods {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 16px;
        }

        .tni-dividend-explorer__periods button {
          padding: 8px 11px;
          border: 1px solid #d8e1ec;
          border-radius: 7px;
          background: #f7f9fc;
          color: #52667c;
          font: inherit;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
        }

        .tni-dividend-explorer__periods button.is-active {
          border-color: #185c38;
          background: #185c38;
          color: #ffffff;
        }

        .tni-dividend-explorer__chart {
          width: 100%;
          min-width: 0;
          min-height: 430px;
          overflow: hidden;
          border: 1px solid #dce4ec;
          border-radius: 12px;
          background: #ffffff;
        }

        .tni-dividend-explorer__section-heading span {
          display: block;
          margin-bottom: 7px;
          color: #185c38;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .tni-dividend-explorer__section-heading strong {
          display: block;
          color: #10233f;
          font-size: 20px;
          line-height: 1.2;
        }

        .tni-dividend-explorer__breakdown,
        .tni-dividend-explorer__history {
          margin-top: 24px;
        }

        .tni-dividend-explorer__section-heading {
          margin-bottom: 12px;
        }

        .tni-dividend-explorer__table-wrap {
          overflow-x: auto;
          border: 1px solid #dce4ec;
          border-radius: 10px;
        }

        .tni-dividend-explorer table {
          width: 100%;
          min-width: 660px;
          border-collapse: collapse;
          background: #ffffff;
        }

        .tni-dividend-explorer th,
        .tni-dividend-explorer td {
          padding: 13px 15px;
          border-bottom: 1px solid #e7edf3;
          text-align: right;
          white-space: nowrap;
        }

        .tni-dividend-explorer th:first-child,
        .tni-dividend-explorer td:first-child {
          text-align: left;
        }

        .tni-dividend-explorer thead th {
          background: #f7f9fc;
          color: #617286;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .tni-dividend-explorer tbody th {
          color: #10233f;
          font-size: 12px;
        }

        .tni-dividend-explorer tbody td {
          color: #42566c;
          font-size: 12px;
        }

        .tni-dividend-explorer tbody tr:last-child th,
        .tni-dividend-explorer tbody tr:last-child td {
          border-bottom: 0;
        }

        .tni-dividend-explorer tr.is-contribution {
          background: #f0f8f3;
        }

        .tni-dividend-explorer tr.is-total {
          background: #f6f9fd;
        }

        .tni-dividend-explorer__pct {
          display: inline-block;
          padding: 4px 7px;
          border-radius: 999px;
          background: #e3f3e9;
          color: #185c38;
          font-weight: 800;
        }

        .tni-dividend-explorer__ellipsis {
          display: block;
          margin-bottom: 7px;
          color: #9aa8b5;
          letter-spacing: 0.18em;
        }

        .tni-dividend-explorer__show-all {
          display: block;
          margin: 14px auto 0;
          padding: 9px 15px;
          border: 1px solid #b8c8d8;
          border-radius: 7px;
          background: #ffffff;
          color: #173c65;
          font: inherit;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          cursor: pointer;
        }

        .tni-dividend-explorer__show-all:hover {
          border-color: #173c65;
        }

        .tni-dividend-explorer__definition {
          margin: 18px 0 0;
          color: #68798b;
          font-size: 11px;
          line-height: 1.65;
        }

        @media (max-width: 720px) {
          .tni-dividend-explorer__periods {
            flex-wrap: nowrap;
            overflow-x: auto;
            padding-bottom: 3px;
          }

          .tni-dividend-explorer__periods button {
            flex: 0 0 auto;
          }

          .tni-dividend-explorer__chart {
            min-height: 430px;
          }
        }
      `}</style>
    </div>
  )
}
