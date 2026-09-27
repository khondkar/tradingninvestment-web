import {
  lazy,
  Suspense,
  useMemo,
  useState,
} from 'react'

import datasetJson from '../../data/sp500-historical-return-methods.json'

import type {
  SP500ReturnMethodChartRow,
  SP500ReturnMode,
} from '../charts/SP500ReturnMethodChart'
import HistoricalPeriodSlider from './HistoricalPeriodSlider'
import './SP500ReturnMethodsResearch.css'

const SP500ReturnMethodChart =
  lazy(
    () =>
      import(
        '../charts/SP500ReturnMethodChart'
      ),
  )

type ReturnMode =
  SP500ReturnMode

type PerformanceFilter =
  | 'all'
  | 'positive'
  | 'negative'

type RangePreset =
  | 'all'
  | '3y'
  | '5y'
  | '10y'
  | '20y'
  | 'custom'

type MethodologyPeriod = {
  start: number
  end: number
  type: string
  description: string
}

type Dataset = {
  dataset: string
  start_year: number
  end_year: number
  current_year_is_ytd: boolean
  methodology_periods: MethodologyPeriod[]
  real_return_formula: string
  data: SP500ReturnMethodChartRow[]
}

type ModeConfig = {
  label: string
  shortLabel: string
  metricLabel: string
  definition: string
}

type Statistics = {
  average: number
  median: number
  positiveYears: number
  negativeYears: number
  positivePct: number
  negativePct: number
  bestYear: {
    year: number
    value: number
  }
  worstYear: {
    year: number
    value: number
  }
}

const dataset =
  datasetJson as Dataset

const MODE_CONFIG: Record<
  ReturnMode,
  ModeConfig
> = {
  total_return: {
    label:
      'TOTAL RETURN (DIVIDENDS REINVESTED)',

    shortLabel:
      'TOTAL RETURN',

    metricLabel:
      'Total Return',

    definition:
      'Total return measures market performance including dividends reinvested. It is the broadest nominal measure of long-run shareholder return in this dataset.',
  },

  price_return: {
    label:
      'PRICE RETURN',

    shortLabel:
      'PRICE RETURN',

    metricLabel:
      'Price Return',

    definition:
      'Price return measures the change in the market index level and excludes the effect of reinvested dividends.',
  },

  real_total_return: {
    label:
      'REAL TOTAL RETURN (INFLATION ADJUSTED)',

    shortLabel:
      'REAL TOTAL RETURN',

    metricLabel:
      'Real Total Return',

    definition:
      'Real total return starts with dividend-reinvested total return and adjusts it for inflation to estimate the change in purchasing power.',
  },
}

const RANGE_OPTIONS: {
  key: RangePreset
  label: string
}[] = [
  {
    key: 'all',
    label: 'ALL',
  },
  {
    key: '3y',
    label: '3Y',
  },
  {
    key: '5y',
    label: '5Y',
  },
  {
    key: '10y',
    label: '10Y',
  },
  {
    key: '20y',
    label: '20Y',
  },
  {
    key: 'custom',
    label: 'CUSTOM',
  },
]

const PERFORMANCE_OPTIONS: {
  key: PerformanceFilter
  label: string
}[] = [
  {
    key: 'all',
    label: 'ALL',
  },
  {
    key: 'positive',
    label: 'POSITIVE',
  },
  {
    key: 'negative',
    label: 'NEGATIVE',
  },
]

function formatPercent(
  value: number,
) {
  const sign =
    value > 0
      ? '+'
      : ''

  return `${sign}${value.toFixed(
    2,
  )}%`
}

function formatDate(
  value: string,
) {
  if (!value) {
    return ''
  }

  return value
}

function median(
  values: number[],
) {
  if (
    values.length ===
    0
  ) {
    return 0
  }

  const sorted =
    [...values].sort(
      (a, b) =>
        a - b,
    )

  const middle =
    Math.floor(
      sorted.length / 2,
    )

  if (
    sorted.length %
      2 ===
    0
  ) {
    return (
      sorted[
        middle - 1
      ] +
      sorted[
        middle
      ]
    ) / 2
  }

  return sorted[
    middle
  ]
}


type SummaryReturnMode =
  | 'price_return'
  | 'total_return'
  | 'real_total_return'

type HistoricalSummaryRow = {
  key: string
  label: string
  startYear: number
  endYear: number
  observationCount: number
  isYtd: boolean
  price_return: number | null
  total_return: number | null
  real_total_return: number | null
}

const SUMMARY_PERIODS = [
  1,
  2,
  3,
  5,
  10,
  20,
  30,
  50,
  100,
  150,
] as const

function compoundAnnualizedReturn(
  rows: SP500ReturnMethodChartRow[],
  mode: SummaryReturnMode,
): number | null {
  if (rows.length === 0) {
    return null
  }

  let growth =
    1

  for (const row of rows) {
    const value =
      row[mode]

    if (
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      return null
    }

    growth *=
      1 +
      value / 100
  }

  if (
    growth <= 0
  ) {
    return null
  }

  return (
    (
      Math.pow(
        growth,
        1 / rows.length,
      ) -
      1
    ) *
    100
  )
}

function buildHistoricalSummary(
  rows: SP500ReturnMethodChartRow[],
): HistoricalSummaryRow[] {
  if (
    rows.length === 0
  ) {
    return []
  }

  const sorted =
    [...rows].sort(
      (a, b) =>
        a.year -
        b.year,
    )

  const completed =
    sorted.filter(
      (row) =>
        !row.is_ytd,
    )

  if (
    completed.length === 0
  ) {
    return []
  }

  const result:
    HistoricalSummaryRow[] =
    []

  const ytdRow =
    [...sorted]
      .reverse()
      .find(
        (row) =>
          row.is_ytd,
      )

  if (ytdRow) {
    result.push({
      key: 'ytd',
      label: 'YTD',
      startYear:
        ytdRow.year,
      endYear:
        ytdRow.year,
      observationCount:
        1,
      isYtd: true,
      price_return:
        ytdRow.price_return,
      total_return:
        ytdRow.total_return,
      real_total_return:
        ytdRow.real_total_return,
    })
  }

  for (
    const period of
      SUMMARY_PERIODS
  ) {
    if (
      completed.length <
      period
    ) {
      continue
    }

    const periodRows =
      completed.slice(
        -period,
      )

    result.push({
      key: `${period}y`,
      label:
        period === 1
          ? '1 Year'
          : `${period} Years`,
      startYear:
        periodRows[0].year,
      endYear:
        periodRows[
          periodRows.length -
            1
        ].year,
      observationCount:
        periodRows.length,
      isYtd: false,
      price_return:
        compoundAnnualizedReturn(
          periodRows,
          'price_return',
        ),
      total_return:
        compoundAnnualizedReturn(
          periodRows,
          'total_return',
        ),
      real_total_return:
        compoundAnnualizedReturn(
          periodRows,
          'real_total_return',
        ),
    })
  }

  result.push({
    key: 'full-history',
    label: 'Full History',
    startYear:
      completed[0].year,
    endYear:
      completed[
        completed.length -
          1
      ].year,
    observationCount:
      completed.length,
    isYtd: false,
    price_return:
      compoundAnnualizedReturn(
        completed,
        'price_return',
      ),
    total_return:
      compoundAnnualizedReturn(
        completed,
        'total_return',
      ),
    real_total_return:
      compoundAnnualizedReturn(
        completed,
        'real_total_return',
      ),
  })

  return result
}

function formatSummaryReturn(
  value: number | null,
): string {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  const prefix =
    value > 0
      ? '+'
      : ''

  return `${prefix}${value.toFixed(
    2,
  )}%`
}

function calculateStatistics(
  rows: SP500ReturnMethodChartRow[],
  mode: ReturnMode,
): Statistics | null {
  const completed =
    rows.filter(
      (row) =>
        !row.is_ytd,
    )

  if (
    completed.length ===
    0
  ) {
    return null
  }

  const values =
    completed.map(
      (row) =>
        row[mode],
    )

  const average =
    values.reduce(
      (
        total,
        value,
      ) =>
        total +
        value,
      0,
    ) /
    values.length

  const positiveYears =
    completed.filter(
      (row) =>
        row[mode] >
        0,
    ).length

  const negativeYears =
    completed.filter(
      (row) =>
        row[mode] <
        0,
    ).length

  const bestYear =
    completed.reduce(
      (
        best,
        row,
      ) =>
        row[mode] >
        best[mode]
          ? row
          : best,
    )

  const worstYear =
    completed.reduce(
      (
        worst,
        row,
      ) =>
        row[mode] <
        worst[mode]
          ? row
          : worst,
    )

  return {
    average,

    median:
      median(values),

    positiveYears,

    negativeYears,

    positivePct:
      (
        positiveYears /
        completed.length
      ) *
      100,

    negativePct:
      (
        negativeYears /
        completed.length
      ) *
      100,

    bestYear: {
      year:
        bestYear.year,

      value:
        bestYear[
          mode
        ],
    },

    worstYear: {
      year:
        worstYear.year,

      value:
        worstYear[
          mode
        ],
    },
  }
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="tni-return-stat">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {detail}
      </small>
    </div>
  )
}

export default function SP500ReturnMethodsResearch() {
  const [mode, setMode] =
    useState<ReturnMode>(
      'total_return',
    )

  const [
    performanceFilter,
    setPerformanceFilter,
  ] =
    useState<PerformanceFilter>(
      'all',
    )

  const [
    rangePreset,
    setRangePreset,
  ] =
    useState<RangePreset>(
      'all',
    )

  const [
    customStartYear,
    setCustomStartYear,
  ] =
    useState<number>(
      dataset.start_year,
    )

  const [
    customEndYear,
    setCustomEndYear,
  ] =
    useState<number>(
      dataset.end_year,
    )

  const activeMode =
    MODE_CONFIG[mode]

  const latestRow =
    dataset.data[
      dataset.data.length -
        1
    ]

  const rangeFilteredData =
    useMemo(() => {
      if (
        rangePreset ===
        'all'
      ) {
        return dataset.data
      }

      if (
        rangePreset ===
        'custom'
      ) {
        const start =
          Math.min(
            customStartYear,
            customEndYear,
          )

        const end =
          Math.max(
            customStartYear,
            customEndYear,
          )

        return dataset.data.filter(
          (row) =>
            row.year >=
              start &&
            row.year <=
              end,
        )
      }

      const years =
        Number(
          rangePreset.replace(
            'y',
            '',
          ),
        )

      const latestYear =
        dataset.data[
          dataset.data.length -
            1
        ].year

      const startYear =
        latestYear -
        years +
        1

      return dataset.data.filter(
        (row) =>
          row.year >=
          startYear,
      )
    }, [
      rangePreset,
      customStartYear,
      customEndYear,
    ])

  const filteredData =
    useMemo(() => {
      if (
        performanceFilter ===
        'all'
      ) {
        return rangeFilteredData
      }

      return rangeFilteredData.filter(
        (row) => {
          const value =
            row[mode]

          if (
            performanceFilter ===
            'positive'
          ) {
            return value >
              0
          }

          return value <
            0
        },
      )
    }, [
      rangeFilteredData,
      performanceFilter,
      mode,
    ])

  const completedFilteredData =
    useMemo(
      () =>
        filteredData.filter(
          (row) =>
            !row.is_ytd,
        ),
      [
        filteredData,
      ],
    )

  const statistics =
    useMemo(
      () =>
        calculateStatistics(
          filteredData,
          mode,
        ),
      [
        filteredData,
        mode,
      ],
    )


  const historicalSummary =
    useMemo(
      () =>
        buildHistoricalSummary(
          dataset.data,
        ),
      [],
    )

  const twentyYearSummary =
    historicalSummary.find(
      (row) =>
        row.key === '20y',
    )

  const fullHistorySummary =
    historicalSummary.find(
      (row) =>
        row.key === 'full-history',
    )

  const annualHistoryInsights =
    useMemo(() => {
      const completed =
        dataset.data.filter(
          (row) =>
            !row.is_ytd,
        )

      if (
        completed.length === 0
      ) {
        return null
      }

      const positiveTotalYears =
        completed.filter(
          (row) =>
            row.total_return >
            0,
        ).length

      const negativeTotalYears =
        completed.filter(
          (row) =>
            row.total_return <
            0,
        ).length

      const bestTotalYear =
        completed.reduce(
          (best, row) =>
            row.total_return >
            best.total_return
              ? row
              : best,
        )

      const worstTotalYear =
        completed.reduce(
          (worst, row) =>
            row.total_return <
            worst.total_return
              ? row
              : worst,
        )

      return {
        startYear:
          completed[0].year,

        endYear:
          completed[
            completed.length -
              1
          ].year,

        completedYears:
          completed.length,

        positiveTotalYears,

        negativeTotalYears,

        positivePct:
          (
            positiveTotalYears /
            completed.length
          ) *
          100,

        negativePct:
          (
            negativeTotalYears /
            completed.length
          ) *
          100,

        bestTotalYear,

        worstTotalYear,
      }
    }, [])

  const rangeSummary =
    useMemo(() => {
      if (
        filteredData.length ===
        0
      ) {
        return 'No matching observations'
      }

      const first =
        filteredData[0]
          .year

      const last =
        filteredData[
          filteredData.length -
            1
        ].year

      return first ===
        last
        ? String(first)
        : `${first}–${last}`
    }, [
      filteredData,
    ])

  const filtersAreActive =
    performanceFilter !==
      'all' ||
    rangePreset !==
      'all'

  function resetFilters() {
    setPerformanceFilter(
      'all',
    )

    setRangePreset(
      'all',
    )

    setCustomStartYear(
      dataset.start_year,
    )

    setCustomEndYear(
      dataset.end_year,
    )
  }

  return (
    <section className="tni-return-methods">
      <header className="tni-return-methods__header">
        <span className="tni-return-methods__eyebrow">
          TNI HISTORICAL RETURN RESEARCH
        </span>

        <h1>
          Average Stock Market Return:
          <span>S&amp;P 500 Returns by Year</span>
        </h1>

        <div className="tni-return-methods__byline">
          <span>By Kamal Khondkar</span>
          <span aria-hidden="true">·</span>
          <span>TradingNInvestment Research</span>
        </div>

        <p>
          Explore U.S. stock market returns
          from {dataset.start_year} through{' '}
          {dataset.end_year}
          {dataset.current_year_is_ytd
            ? ' YTD'
            : ''}, comparing total return
          with dividends reinvested,
          inflation-adjusted real total
          return, and price return.
        </p>

        <p>
          Total return is the primary
          measure in this research because
          it includes reinvested dividends.
          Real total return shows the
          historical result after
          inflation, while price return is
          provided as a comparison
          benchmark.
        </p>
      </header>

      {/* =====================================================
          RETURN METHOD
      ===================================================== */}

      <div className="tni-return-methods__selector">
        {(
          Object.keys(
            MODE_CONFIG,
          ) as ReturnMode[]
        ).map(
          (
            option,
          ) => (
            <button
              key={
                option
              }
              type="button"
              aria-pressed={
                mode ===
                option
              }
              className={
                mode ===
                option
                  ? 'is-active'
                  : ''
              }
              onClick={() =>
                setMode(
                  option,
                )
              }
            >
              {
                MODE_CONFIG[
                  option
                ].label
              }
            </button>
          ),
        )}
      </div>

      {/* =====================================================
          RETURN EXPLORER
      ===================================================== */}

      <section className="tni-return-methods__explorer">
        <div className="tni-return-methods__explorer-group">
          <span className="tni-return-methods__explorer-label">
            PERFORMANCE
          </span>

          <HistoricalPeriodSlider
            minYear={dataset.start_year}
            maxYear={dataset.end_year}
            startYear={
              rangePreset === 'custom'
                ? customStartYear
                : rangeFilteredData[0]?.year ??
                  dataset.start_year
            }
            endYear={
              rangePreset === 'custom'
                ? customEndYear
                : rangeFilteredData[
                    rangeFilteredData.length - 1
                  ]?.year ??
                  dataset.end_year
            }
            currentYearIsYtd={
              dataset.current_year_is_ytd
            }
            onChange={(
              startYear,
              endYear,
            ) => {
              setCustomStartYear(
                startYear,
              )
  
              setCustomEndYear(
                endYear,
              )
  
              setRangePreset(
                'custom',
              )
            }}
          />


          <div className="tni-return-methods__explorer-buttons">
            {PERFORMANCE_OPTIONS.map(
              (
                option,
              ) => (
                <button
                  key={
                    option.key
                  }
                  type="button"
                  aria-pressed={
                    performanceFilter ===
                    option.key
                  }
                  className={
                    performanceFilter ===
                    option.key
                      ? 'is-active'
                      : ''
                  }
                  onClick={() =>
                    setPerformanceFilter(
                      option.key,
                    )
                  }
                >
                  {
                    option.label
                  }
                </button>
              ),
            )}
          </div>
        </div>





        <div className="tni-return-methods__explorer-group">
          <span className="tni-return-methods__explorer-label">
            PERIOD
          </span>

          <div className="tni-return-methods__explorer-buttons">
            {RANGE_OPTIONS.map(
              (
                option,
              ) => (
                <button
                  key={
                    option.key
                  }
                  type="button"
                  aria-pressed={
                    rangePreset ===
                    option.key
                  }
                  className={
                    rangePreset ===
                    option.key
                      ? 'is-active'
                      : ''
                  }
                  onClick={() =>
                    setRangePreset(
                      option.key,
                    )
                  }
                >
                  {
                    option.label
                  }
                </button>
              ),
            )}
          </div>
        </div>

        <div className="tni-return-methods__explorer-footer">
          <div>
            <strong>
              {
                rangeSummary
              }
            </strong>

            <span>
              {' '}•{' '}
              {
                filteredData.length
              }{' '}
              {
                filteredData.length ===
                1
                  ? 'observation'
                  : 'observations'
              }
            </span>

            {performanceFilter !==
              'all' && (
              <span>
                {' '}•{' '}
                {
                  performanceFilter ===
                  'positive'
                    ? 'Positive years only'
                    : 'Negative years only'
                }
              </span>
            )}
          </div>

          {filtersAreActive && (
            <button
              type="button"
              className="tni-return-methods__reset"
              onClick={
                resetFilters
              }
            >
              RESET FILTERS
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          D3 CHART
      ===================================================== */}

      <div className="tni-return-methods__chart">
        {filteredData.length >
        0 ? (
          <Suspense
            fallback={
              <div className="tni-return-methods__chart-loading">
                Loading interactive
                chart…
              </div>
            }
          >
            <SP500ReturnMethodChart
              key={`${mode}-${rangePreset}-${performanceFilter}-${customStartYear}-${customEndYear}`}
              mode={
                mode
              }
              data={
                filteredData
              }
              rangeLabel={`${rangeSummary} · ${activeMode.metricLabel}`}
            />
          </Suspense>
        ) : (
          <div className="tni-return-methods__chart-loading">
            No observations match the
            selected filters.
          </div>
        )}
      </div>

      {/* =====================================================
          UNDERSTANDING THE AVERAGE STOCK MARKET RETURN
      ===================================================== */}

      <section
        className="tni-return-methods__research-introduction"
        id="understanding-average-stock-market-return"
      >
        <h2>
          Understanding the Average Stock Market Return
        </h2>

        <p>
          The average stock market return depends on{' '}
          <strong>
            what we mean by “return.”
          </strong>{' '}
          A price index measures how stock prices changed,
          but price appreciation alone does not represent
          the full historical return earned by an investor.
          Investors may also receive dividends, reinvest
          those dividends, and experience changes in
          purchasing power caused by inflation. For that
          reason, looking only at price return can leave out
          two important forces that shape long-term
          investment results:{' '}
          <strong>
            dividend compounding and inflation
          </strong>.
        </p>

        <p>
          <strong>
            When evaluating the historical average stock
            market return, the measurement method matters.
          </strong>{' '}
          S&amp;P 500 price return reflects changes in index
          prices, while S&amp;P 500 total return includes
          reinvested dividends. Inflation-adjusted total
          return, also called real total return, measures
          the return remaining after accounting for changes
          in purchasing power. Comparing these measures
          across different time periods provides a more
          complete picture of historical stock market
          performance than relying on a single average
          return.
        </p>

        <p>
          <strong>
            In this analysis, total return is the primary
            measure of stock market performance. Real total
            return—the return after inflation—is the second
            major measure. Price return is included as a
            comparison benchmark.
          </strong>{' '}
          Total return incorporates dividends and assumes
          those distributions are reinvested, allowing the
          effect of compounding to become part of the
          historical return. Real total return goes one
          step further by adjusting those investment
          results for inflation, providing a measure of how
          much purchasing power an investor actually gained
          or lost.
        </p>

        <p>
          These differences become increasingly important
          over long investment horizons. Reinvested
          dividends can compound for decades, potentially
          creating a substantial gap between the movement
          of a price index and the accumulated return of an
          investor. Inflation works in the opposite
          direction by reducing the purchasing power of
          accumulated wealth. The interactive chart above
          therefore lets you examine the historical market
          from three perspectives—<strong>
            Total Return (Dividends Reinvested), Real Total
            Return (Inflation Adjusted), and Price Return
          </strong>—and change the historical period to see
          how the results differ.
        </p>

        <p>
          The purpose of this research is therefore broader
          than simply measuring how much the S&amp;P 500
          price index rose or fell. It asks a more useful
          long-term question:{' '}
          <strong>
            What has the U.S. stock market historically
            returned to investors after accounting for
            dividends, compounding, and inflation?
          </strong>{' '}
          The sections below examine that question across
          different investment horizons and historical
          market environments. Historical returns provide
          useful context for understanding long-term market
          behavior, but they are not forecasts of future
          returns.
        </p>
      </section>

      {/* =====================================================
          FILTERED STATISTICS
      ===================================================== */}

      <section className="tni-return-methods__statistics">
        <h3>
          Interactive{' '}
          {
            activeMode.shortLabel
          }{' '}
          Statistics
        </h3>

        <p className="tni-return-methods__statistics-intro">
          Statistics below update with
          the selected return method and
          filters. Average, median, best
          and worst annual returns use
          completed calendar years only,
          so the current YTD period does
          not distort historical annual
          statistics.
        </p>

        <div className="tni-return-methods__summary">
          {statistics ? (
            <>
              <StatCard
                label="Average Annual Return"
                value={
                  formatPercent(
                    statistics.average,
                  )
                }
                detail={`${completedFilteredData.length} completed ${
                  completedFilteredData.length ===
                  1
                    ? 'year'
                    : 'years'
                }`}
              />

              <StatCard
                label="Median Annual Return"
                value={
                  formatPercent(
                    statistics.median,
                  )
                }
                detail="Completed years only"
              />

              <StatCard
                label="Positive Years"
                value={String(
                  statistics.positiveYears,
                )}
                detail={`${statistics.positivePct.toFixed(
                  2,
                )}% of completed years`}
              />

              <StatCard
                label="Negative Years"
                value={String(
                  statistics.negativeYears,
                )}
                detail={`${statistics.negativePct.toFixed(
                  2,
                )}% of completed years`}
              />

              <StatCard
                label="Best Year"
                value={
                  formatPercent(
                    statistics.bestYear.value,
                  )
                }
                detail={String(
                  statistics.bestYear.year,
                )}
              />

              <StatCard
                label="Worst Year"
                value={
                  formatPercent(
                    statistics.worstYear.value,
                  )
                }
                detail={String(
                  statistics.worstYear.year,
                )}
              />
            </>
          ) : (
            <p>
              No completed calendar years
              match the selected filters.
            </p>
          )}
        </div>
      </section>

      {/* =====================================================
          DEFINITION
      ===================================================== */}

      <section className="tni-return-methods__definition">
        <h3>
          What does{' '}
          {
            activeMode.metricLabel
          }{' '}
          mean?
        </h3>

        <p>
          {
            activeMode.definition
          }
        </p>

        <p className="tni-return-methods__current">
          Latest observation:{' '}
          <strong>
            {
              latestRow.year
            }
            {
              latestRow.is_ytd
                ? ' YTD'
                : ''
            }
          </strong>{' '}
          —{' '}
          <strong>
            {formatPercent(
              latestRow[
                mode
              ],
            )}
          </strong>
          . Data through{' '}
          {
            mode ===
            'real_total_return'
              ? formatDate(
                  latestRow.real_return_through,
                )
              : formatDate(
                  latestRow.data_through,
                )
          }
          .
        </p>
      </section>


      {/* =====================================================
          SECTION 2 — HISTORICAL RETURN SUMMARY
      ===================================================== */}

      <section
        id="historical-return-summary"
        className="tni-return-methods__summary-section"
      >
        <header className="tni-return-methods__section-header">
          <span className="tni-return-methods__section-eyebrow">
            HISTORICAL RETURN SUMMARY
          </span>

          <h2>
            Stock Market Returns Over
            Different Time Periods
          </h2>

          <p>
            Compare annualized historical
            stock market returns across
            multiple investment horizons.
            Price return measures index
            price changes, total return
            includes reinvested dividends,
            and real total return adjusts
            for inflation.
          </p>
        </header>

        <div className="tni-return-methods__summary-table-wrap">
          <table className="tni-return-methods__summary-table">
            <thead>
              <tr>
                <th scope="col">
                  Period
                </th>

                <th scope="col">
                  Years
                </th>

                <th scope="col">
                  Price Return
                </th>

                <th scope="col">
                  Total Return
                </th>

                <th scope="col">
                  After Inflation
                </th>
              </tr>
            </thead>

            <tbody>
              {historicalSummary.map(
                (row) => (
                  <tr
                    key={
                      row.key
                    }
                  >
                    <th
                      scope="row"
                    >
                      {
                        row.label
                      }

                      {!row.isYtd &&
                        row.observationCount >
                          1 && (
                          <span className="tni-return-methods__summary-period-note">
                            Annualized
                          </span>
                        )}
                    </th>

                    <td>
                      {row.isYtd
                        ? `${row.endYear} YTD`
                        : row.startYear ===
                            row.endYear
                          ? String(
                              row.endYear,
                            )
                          : `${row.startYear}–${row.endYear}`}
                    </td>

                    <td>
                      <strong>
                        {formatSummaryReturn(
                          row.price_return,
                        )}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {formatSummaryReturn(
                          row.total_return,
                        )}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {formatSummaryReturn(
                          row.real_total_return,
                        )}
                      </strong>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        <div className="tni-return-methods__summary-notes">
          <p>
            <strong>
              How to read this table:
            </strong>{' '}
            YTD shows the actual return
            recorded for the current
            partial year. Multi-year
            periods show compounded
            annualized returns using
            completed calendar years.
          </p>

          <p>
            The Full History row begins
            with the earliest completed
            observation available in this
            research dataset and ends with
            the latest completed calendar
            year. The date range updates
            automatically with the
            underlying dataset.
          </p>
        </div>

        <div className="tni-return-methods__summary-explanation">
          <h3>
            What Do These Historical
            Returns Mean?
          </h3>

          <p>
            Stock market returns can look
            very different depending on
            the time period and how
            returns are measured.
            Short-term results can change
            substantially from year to
            year, while longer periods
            provide a broader view of how
            U.S. stocks performed across
            many different market
            environments.
          </p>

          <p>
            <strong>
              Price return
            </strong>{' '}
            measures only the change in
            stock prices.{' '}
            <strong>
              Total return
            </strong>{' '}
            includes dividends and
            assumes those dividends are
            reinvested. Over long
            periods, the difference
            between these measures shows
            how dividends and compounding
            contributed to historical
            investor returns.{' '}
            <strong>
              Real total return
            </strong>{' '}
            adjusts total return for
            inflation, providing a view
            of how purchasing power
            changed.
          </p>

          {twentyYearSummary && (
            <p>
              Over the latest{' '}
              <strong>
                {
                  twentyYearSummary.observationCount
                }{' '}
                completed years
              </strong>
              , from{' '}
              <strong>
                {
                  twentyYearSummary.startYear
                }
              </strong>{' '}
              through{' '}
              <strong>
                {
                  twentyYearSummary.endYear
                }
              </strong>
              , the market produced an
              annualized total return of{' '}
              <strong>
                {formatSummaryReturn(
                  twentyYearSummary.total_return,
                )}
              </strong>
              , compared with an
              annualized price return of{' '}
              <strong>
                {formatSummaryReturn(
                  twentyYearSummary.price_return,
                )}
              </strong>{' '}
              and an inflation-adjusted
              annualized total return of{' '}
              <strong>
                {formatSummaryReturn(
                  twentyYearSummary.real_total_return,
                )}
              </strong>
              .
            </p>
          )}

          {fullHistorySummary && (
            <p>
              Across the full historical
              dataset from{' '}
              <strong>
                {
                  fullHistorySummary.startYear
                }
              </strong>{' '}
              through{' '}
              <strong>
                {
                  fullHistorySummary.endYear
                }
              </strong>
              , the annualized price
              return was{' '}
              <strong>
                {formatSummaryReturn(
                  fullHistorySummary.price_return,
                )}
              </strong>
              , while the annualized
              total return with dividends
              reinvested was{' '}
              <strong>
                {formatSummaryReturn(
                  fullHistorySummary.total_return,
                )}
              </strong>
              . After adjusting for
              inflation, the annualized
              real total return was{' '}
              <strong>
                {formatSummaryReturn(
                  fullHistorySummary.real_total_return,
                )}
              </strong>
              . This is why the answer to
              “What is the average stock
              market return?” depends on
              whether return means price
              appreciation, total return
              with dividends, or return
              after inflation.
            </p>
          )}

          <p className="tni-return-methods__summary-caution">
            <strong>
              Historical returns are not
              forecasts.
            </strong>{' '}
            These results describe what
            happened over the periods
            shown. They include strong
            bull markets, market
            declines, recessions,
            inflationary periods,
            financial crises and
            recoveries. Future returns
            can differ substantially from
            historical averages.
          </p>
        </div>

      </section>

      {/* =====================================================
          METHODOLOGY
      ===================================================== */}

      <section
        id="methodology-sources-verification"
        className="tni-return-methods__methodology tni-return-methods__major-section"
      >
        <header className="tni-return-methods__section-header">
          <span className="tni-return-methods__section-eyebrow">
            METHODOLOGY · DATA SOURCES · VERIFICATION
          </span>

          <h2>
            How TNI Constructed This
            Historical Stock Market
            Return Dataset
          </h2>

          <p>
            This dataset combines
            historical U.S. equity-market
            observations, predecessor
            large-cap index history,
            modern S&amp;P 500 index
            observations and U.S.
            inflation data. TNI keeps the
            historical reconstruction
            separate from the modern
            S&amp;P 500 series so the
            provenance of the long-run
            record remains explicit.
          </p>
        </header>

        <div className="tni-research-standard">
          <span>
            TNI RESEARCH STANDARD
          </span>

          <strong>
            SOURCED · REPRODUCIBLE ·
            CROSS-CHECKED · UPDATED
          </strong>
        </div>

        <h3>
          Historical Coverage and
          Construction
        </h3>

        <div className="tni-methodology-grid">
          {dataset.methodology_periods.map(
            (
              period,
            ) => (
              <article
                key={
                  period.type
                }
                className="tni-methodology-card"
              >
                <strong>
                  {
                    period.start
                  }
                  –
                  {
                    period.end
                  }
                  {
                    period.end ===
                      dataset.end_year &&
                    dataset.current_year_is_ytd
                      ? ' YTD'
                      : ''
                  }
                </strong>

                <p>
                  {
                    period.description
                  }
                </p>
              </article>
            ),
          )}
        </div>

        <p>
          For the earliest historical
          period, TNI reconstructs annual
          returns from Robert Shiller /
          Yale monthly U.S. equity-market
          observations. This historical
          extension represents the
          broader U.S. equity market and
          is not presented as the modern
          S&amp;P 500.
        </p>

        <p>
          The conventional historical
          period combines TNI annual
          price-return history with
          Aswath Damodaran / NYU Stern
          dividend-inclusive large-cap /
          S&amp;P return data. The modern
          period uses observations for
          the S&amp;P 500 Price Index and
          S&amp;P 500 Total Return Index.
        </p>

        <h3>
          Data Sources
        </h3>

        <p>
          The source used depends on the
          return component and historical
          period. TNI then standardizes
          these observations into the
          common annual dataset used by
          the charts, tables and
          calculations on this page.
        </p>

        <div className="tni-source-table-wrap">
          <table className="tni-source-table">
            <thead>
              <tr>
                <th scope="col">
                  Data Component
                </th>

                <th scope="col">
                  Source
                </th>

                <th scope="col">
                  Use in TNI Research
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <th scope="row">
                  Early U.S. equity
                  history
                </th>

                <td>
                  <a
                    href="https://shillerdata.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Robert J. Shiller —
                    Historical U.S. Stock
                    Market Data
                  </a>

                  <br />

                  <a
                    href="https://economics.yale.edu/people/robert-shiller"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Yale University —
                    Robert J. Shiller
                  </a>
                </td>

                <td>
                  Monthly price,
                  dividend and inflation
                  observations used for
                  the historical U.S.
                  equity-market
                  extension.
                </td>
              </tr>

              <tr>
                <th scope="row">
                  Historical
                  dividend-inclusive
                  returns
                </th>

                <td>
                  <a
                    href="https://pages.stern.nyu.edu/~adamodar/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Aswath Damodaran /
                    NYU Stern
                  </a>
                </td>

                <td>
                  Historical large-cap /
                  S&amp;P
                  dividend-inclusive
                  return observations.
                </td>
              </tr>

              <tr>
                <th scope="row">
                  Modern S&amp;P 500
                  price observations
                </th>

                <td>
                  <a
                    href="https://finance.yahoo.com/quote/%5EGSPC/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Yahoo Finance —
                    ^GSPC
                  </a>
                </td>

                <td>
                  Modern S&amp;P 500
                  Price Index
                  observations used to
                  calculate price
                  returns.
                </td>
              </tr>

              <tr>
                <th scope="row">
                  Modern S&amp;P 500
                  total-return
                  observations
                </th>

                <td>
                  <a
                    href="https://finance.yahoo.com/quote/%5ESP500TR/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Yahoo Finance —
                    ^SP500TR
                  </a>
                </td>

                <td>
                  Modern S&amp;P 500
                  Total Return Index
                  observations used for
                  dividend-reinvested
                  returns.
                </td>
              </tr>

              <tr>
                <th scope="row">
                  U.S. inflation
                </th>

                <td>
                  <a
                    href="https://fred.stlouisfed.org/series/CPIAUCNS"
                    target="_blank"
                    rel="noreferrer"
                  >
                    U.S. BLS CPI-U via
                    FRED
                  </a>
                </td>

                <td>
                  Consumer Price Index
                  data used to convert
                  nominal total returns
                  into real,
                  inflation-adjusted
                  returns.
                </td>
              </tr>

              <tr>
                <th scope="row">
                  Index methodology
                  reference
                </th>

                <td>
                  <a
                    href="https://www.spglobal.com/spdji/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    S&amp;P Dow Jones
                    Indices
                  </a>
                </td>

                <td>
                  Reference source for
                  S&amp;P index
                  definitions and
                  methodology.
                </td>
              </tr>

              <tr>
                <th scope="row">
                  Derived research
                  calculations
                </th>

                <td>
                  TradingNInvestment
                  Research
                </td>

                <td>
                  Annual return
                  transformations, real
                  returns, CAGR,
                  averages, statistics,
                  historical summaries
                  and interactive
                  analytics.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="tni-source-disclosure">
          Yahoo Finance is used as a
          retrieval source for modern
          index observations. S&amp;P Dow
          Jones Indices defines and
          maintains the underlying
          S&amp;P index methodology.
        </p>

        <h3>
          Return Calculation
        </h3>

        <p>
          Price return measures the
          change in the market index
          level. Total return includes
          dividends and assumes those
          distributions are reinvested.
          Real total return adjusts the
          dividend-reinvested total
          return for changes in consumer
          prices.
        </p>

        <div className="tni-return-methods__formula">
          Real total return ={' '}
          {
            dataset.real_return_formula
          }
        </div>

        <h3>
          Current-Year and Inflation
          Alignment
        </h3>

        {latestRow.is_ytd ? (
          <p>
            The newest observation is
            year-to-date rather than a
            completed calendar year.
            Market price and total-return
            data are through{' '}
            <strong>
              {
                latestRow.data_through
              }
            </strong>
            . Inflation data are
            available through{' '}
            <strong>
              {
                latestRow.inflation_through
              }
            </strong>
            . To avoid combining market
            and inflation observations
            from different endpoints,
            the current real-return
            calculation uses market data
            aligned through{' '}
            <strong>
              {
                latestRow.real_return_through
              }
            </strong>
            .
          </p>
        ) : (
          <p>
            The latest observation
            represents a completed
            calendar year. Current-year
            partial observations are
            identified separately when
            present in the dataset.
          </p>
        )}

        <h3>
          Verification and Research
          Controls
        </h3>

        <div className="tni-verification-grid">
          <article>
            <strong>
              Source provenance
            </strong>
            <p>
              Historical and modern
              observations retain their
              source and methodology
              distinctions rather than
              being presented as one
              uninterrupted modern index
              series.
            </p>
          </article>

          <article>
            <strong>
              Continuity checks
            </strong>
            <p>
              TNI checks the historical
              series for chronological
              continuity before the
              derived research dataset is
              generated.
            </p>
          </article>

          <article>
            <strong>
              Cross-source validation
            </strong>
            <p>
              Modern and historical
              return observations are
              cross-checked against
              independent reference data
              where appropriate before
              publication.
            </p>
          </article>

          <article>
            <strong>
              Completed years vs. YTD
            </strong>
            <p>
              Completed-year statistics
              exclude the current partial
              year, while current YTD
              performance is identified
              separately throughout the
              research.
            </p>
          </article>

          <article>
            <strong>
              Inflation alignment
            </strong>
            <p>
              Real-return calculations
              align the market endpoint
              with the latest available
              inflation observation
              rather than mixing
              mismatched periods.
            </p>
          </article>

          <article>
            <strong>
              Reproducible calculations
            </strong>
            <p>
              Charts, tables and summary
              statistics are generated
              from the same underlying
              return dataset instead of
              manually entered article
              values.
            </p>
          </article>
        </div>

        <p className="tni-source-disclosure">
          Source data providers supply
          underlying observations and
          reference series. Unless
          otherwise stated, calculations,
          transformations, historical
          comparisons, tables,
          visualizations and analytical
          summaries on this page are
          produced by TradingNInvestment
          Research.
        </p>
      </section>

      {/* =====================================================
          ANNUAL TABLE
      ===================================================== */}

      <section
        id="stock-market-returns-by-year"
        className="tni-return-table-section tni-return-methods__major-section"
      >
        <header className="tni-return-methods__section-header">
          <span className="tni-return-methods__section-number">
            SECTION 03
          </span>

          <span className="tni-return-methods__section-eyebrow">
            RETURNS BY YEAR
          </span>

          <h2>
            Stock Market Returns by Year:
            Price, Dividends &amp;
            Inflation
          </h2>

          <p>
            Compare annual U.S. stock
            market performance using
            three different measures:
            price return, total return
            with dividends reinvested,
            and real total return after
            inflation. The newest
            observation appears first so
            recent performance can be
            compared directly with the
            longer historical record.
          </p>
        </header>

        <div className="tni-return-table-wrap">
          <table className="tni-return-table">
            <thead>
              <tr>
                <th scope="col">
                  Year
                </th>

                <th scope="col">
                  Price Return
                </th>

                <th scope="col">
                  Total Return
                </th>

                <th scope="col">
                  Real Total Return
                </th>
              </tr>
            </thead>

            <tbody>
              {[...dataset.data]
                .reverse()
                .map(
                  (
                    row,
                  ) => (
                    <tr
                      key={
                        row.year
                      }
                    >
                      <th scope="row">
                        {
                          row.year
                        }
                        {
                          row.is_ytd
                            ? ' YTD'
                            : ''
                        }
                      </th>

                      <td
                        className={
                          row.price_return >=
                          0
                            ? 'is-positive'
                            : 'is-negative'
                        }
                      >
                        {formatPercent(
                          row.price_return,
                        )}
                      </td>

                      <td
                        className={
                          row.total_return >=
                          0
                            ? 'is-positive'
                            : 'is-negative'
                        }
                      >
                        {formatPercent(
                          row.total_return,
                        )}
                      </td>

                      <td
                        className={
                          row.real_total_return >=
                          0
                            ? 'is-positive'
                            : 'is-negative'
                        }
                      >
                        {formatPercent(
                          row.real_total_return,
                        )}
                      </td>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
        </div>

        {latestRow.is_ytd && (
          <p className="tni-return-table-note">
            {
              latestRow.year
            }{' '}
            is year-to-date. Market
            returns are through{' '}
            {
              latestRow.data_through
            }
            . Inflation is available
            through{' '}
            {
              latestRow.inflation_through
            }
            , so real total return is
            aligned through{' '}
            {
              latestRow.real_return_through
            }
            .
          </p>
        )}

        {annualHistoryInsights && (
          <div className="tni-return-methods__annual-explanation">
            <h3>
              What Does the Year-by-Year
              History Show?
            </h3>

            <p>
              From{' '}
              <strong>
                {
                  annualHistoryInsights.startYear
                }
              </strong>{' '}
              through{' '}
              <strong>
                {
                  annualHistoryInsights.endYear
                }
              </strong>
              , this dataset contains{' '}
              <strong>
                {
                  annualHistoryInsights.completedYears
                }{' '}
                completed annual
                observations
              </strong>
              . Using total return, which
              includes reinvested
              dividends,{' '}
              <strong>
                {
                  annualHistoryInsights.positiveTotalYears
                }
              </strong>{' '}
              of those years were
              positive and{' '}
              <strong>
                {
                  annualHistoryInsights.negativeTotalYears
                }
              </strong>{' '}
              were negative.
            </p>

            <p>
              That means the market
              produced a positive
              dividend-reinvested annual
              return in{' '}
              <strong>
                {annualHistoryInsights.positivePct.toFixed(
                  1,
                )}
                %
              </strong>{' '}
              of completed observations,
              compared with{' '}
              <strong>
                {annualHistoryInsights.negativePct.toFixed(
                  1,
                )}
                %
              </strong>{' '}
              that were negative. This
              describes historical
              frequency, not the
              probability of a positive
              return in any future year.
            </p>

            <p>
              The strongest completed
              total-return year in the
              dataset was{' '}
              <strong>
                {
                  annualHistoryInsights.bestTotalYear.year
                }
              </strong>{' '}
              at{' '}
              <strong>
                {formatPercent(
                  annualHistoryInsights.bestTotalYear.total_return,
                )}
              </strong>
              , while the weakest was{' '}
              <strong>
                {
                  annualHistoryInsights.worstTotalYear.year
                }
              </strong>{' '}
              at{' '}
              <strong>
                {formatPercent(
                  annualHistoryInsights.worstTotalYear.total_return,
                )}
              </strong>
              .
            </p>

            <p>
              Comparing the three columns
              year by year also shows why
              the definition of
              “stock market return”
              matters. Price return
              excludes dividends, total
              return includes reinvested
              dividends, and real total
              return shows what remained
              after inflation. In some
              years, a positive nominal
              return can therefore
              translate into a much
              smaller gain in purchasing
              power.
            </p>
          </div>
        )}

      </section>

      <style>{`
        .tni-return-methods {
          width: 100%;
          color: inherit;
        }

        .tni-return-methods__header {
          margin-bottom: 24px;
        }

        .tni-return-methods__eyebrow {
          display: block;
          margin-bottom: 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          opacity: 0.65;
        }

        .tni-return-methods__header h2 {
          margin: 0 0 14px;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.05;
          letter-spacing: -0.035em;
        }

        .tni-return-methods__header p {
          max-width: 850px;
          margin: 0;
          font-size: 16px;
          line-height: 1.7;
          opacity: 0.76;
        }

        .tni-return-methods__selector {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin: 24px 0 18px;
        }

        .tni-return-methods__selector button {
          min-height: 48px;
          padding: 10px 14px;
          border: 1px solid #d8e1ec;
          border-radius: 9px;
          background: #ffffff;
          color: #10233f;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.025em;
          cursor: pointer;
        }

        .tni-return-methods__selector button.is-active {
          border-color: #10233f;
          background: #10233f;
          color: #ffffff;
        }

        .tni-return-methods__explorer {
          margin: 18px 0;
          padding: 18px;
          border: 1px solid #e4ebf3;
          border-radius: 12px;
          background: #ffffff;
          color: #10233f;
        }

        .tni-return-methods__explorer-group {
          margin-bottom: 16px;
        }

        .tni-return-methods__explorer-label {
          display: block;
          margin-bottom: 8px;
          color: #6b7b90;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .tni-return-methods__explorer-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tni-return-methods__explorer-buttons button,
        .tni-return-methods__reset {
          appearance: none;
          padding: 8px 12px;
          border: 1px solid #d8e1ec;
          border-radius: 8px;
          background: #ffffff;
          color: #10233f;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .tni-return-methods__explorer-buttons button.is-active {
          border-color: #10233f;
          background: #10233f;
          color: #ffffff;
        }

        .tni-return-methods__custom-range {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 12px;
          margin: 4px 0 16px;
        }

        .tni-return-methods__custom-range label {
          display: grid;
          gap: 6px;
          color: #6b7b90;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .tni-return-methods__custom-range select {
          min-width: 112px;
          padding: 9px 30px 9px 10px;
          border: 1px solid #d8e1ec;
          border-radius: 8px;
          background: #ffffff;
          color: #10233f;
          font: inherit;
          font-size: 13px;
        }

        .tni-return-methods__range-arrow {
          padding-bottom: 9px;
          color: #6b7b90;
        }

        .tni-return-methods__explorer-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid #edf1f6;
          color: #6b7b90;
          font-size: 12px;
        }

        .tni-return-methods__explorer-footer strong {
          color: #10233f;
        }

        .tni-return-methods__reset {
          padding: 7px 10px;
        }

        .tni-return-methods__chart {
          width: 100%;
          min-width: 0;
          margin: 28px 0 48px;
        }

        .tni-return-methods__chart-loading {
          display: grid;
          place-items: center;
          min-height: 320px;
          border: 1px solid #e4ebf3;
          border-radius: 12px;
          color: #6b7b90;
          font-size: 13px;
        }

        .tni-return-methods__statistics {
          margin: 42px 0;
        }

        .tni-return-methods__statistics h3,
        .tni-return-methods__definition h3,
        .tni-return-methods__methodology h3,
        .tni-return-table-section h3 {
          margin: 0 0 12px;
          font-size: 24px;
          letter-spacing: -0.02em;
        }

        .tni-return-methods__statistics-intro {
          max-width: 820px;
          margin: 0 0 18px;
          font-size: 13px;
          line-height: 1.65;
          opacity: 0.75;
        }

        .tni-return-methods__summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .tni-return-stat {
          padding: 18px;
          border: 1px solid rgba(128, 128, 128, 0.22);
          border-radius: 12px;
        }

        .tni-return-stat span {
          display: block;
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.05em;
          opacity: 0.68;
        }

        .tni-return-stat strong {
          display: block;
          margin-bottom: 5px;
          font-size: 25px;
          letter-spacing: -0.025em;
        }

        .tni-return-stat small {
          font-size: 11px;
          opacity: 0.65;
        }

        .tni-return-methods__definition {
          margin: 42px 0;
          padding: 20px;
          border: 1px solid rgba(128, 128, 128, 0.22);
          border-radius: 12px;
        }

        .tni-return-methods__definition p {
          margin: 6px 0 0;
          line-height: 1.65;
        }

        .tni-return-methods__current {
          font-size: 13px;
          opacity: 0.75;
        }

        .tni-return-methods__methodology {
          margin: 48px 0;
        }

        .tni-methodology-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin: 24px 0;
        }

        .tni-methodology-card {
          padding: 20px;
          border: 1px solid rgba(128, 128, 128, 0.22);
          border-radius: 12px;
        }

        .tni-methodology-card strong {
          display: block;
          margin-bottom: 8px;
          font-size: 17px;
        }

        .tni-methodology-card p {
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
          opacity: 0.76;
        }


        .tni-research-standard {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin: 28px 0 34px;
          padding: 18px 20px;
          border: 1px solid rgba(128, 128, 128, 0.24);
          border-radius: 12px;
        }

        .tni-research-standard span {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          opacity: 0.58;
        }

        .tni-research-standard strong {
          font-size: 0.82rem;
          letter-spacing: 0.08em;
          text-align: right;
        }

        .tni-source-table-wrap {
          width: 100%;
          margin: 22px 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid rgba(128, 128, 128, 0.22);
          border-radius: 12px;
        }

        .tni-source-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
        }

        .tni-source-table th,
        .tni-source-table td {
          padding: 15px 16px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.18);
          text-align: left;
          vertical-align: top;
          font-size: 0.9rem;
          line-height: 1.55;
        }

        .tni-source-table thead th {
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.7;
        }

        .tni-source-table tbody tr:last-child th,
        .tni-source-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .tni-source-table a {
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .tni-source-disclosure {
          max-width: 920px;
          margin: 18px 0 34px;
          font-size: 0.9rem;
          line-height: 1.7;
          opacity: 0.76;
        }

        .tni-verification-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin: 22px 0;
        }

        .tni-verification-grid article {
          padding: 18px;
          border: 1px solid rgba(128, 128, 128, 0.22);
          border-radius: 12px;
        }

        .tni-verification-grid strong {
          display: block;
          margin-bottom: 7px;
          font-size: 0.95rem;
        }

        .tni-verification-grid p {
          margin: 0;
          font-size: 0.88rem;
          line-height: 1.65;
          opacity: 0.76;
        }

        @media (max-width: 700px) {
          .tni-research-standard {
            align-items: flex-start;
            flex-direction: column;
          }

          .tni-research-standard strong {
            text-align: left;
          }

          .tni-verification-grid {
            grid-template-columns: 1fr;
          }
        }

        .tni-return-methods__formula {
          padding: 16px 18px;
          border: 1px solid rgba(128, 128, 128, 0.22);
          border-radius: 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
        }


        .tni-return-methods__major-section {
          margin-top: 72px;
          padding-top: 48px;
          border-top: 1px solid rgba(148, 163, 184, 0.22);
          scroll-margin-top: 96px;
        }

        .tni-return-methods__section-number {
          display: block;
          margin-bottom: 8px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.48;
        }

        .tni-return-methods__annual-explanation {
          max-width: 920px;
          margin-top: 34px;
          padding-top: 30px;
          border-top: 1px solid rgba(148, 163, 184, 0.18);
        }

        .tni-return-methods__annual-explanation h3 {
          margin: 0 0 18px;
          font-size: clamp(1.25rem, 2vw, 1.6rem);
          line-height: 1.2;
        }

        .tni-return-methods__annual-explanation p {
          margin: 0 0 16px;
          line-height: 1.72;
          font-size: 0.98rem;
          opacity: 0.86;
        }

        .tni-return-methods__annual-explanation strong {
          font-weight: 750;
          opacity: 1;
        }

        .tni-return-table-section {
          margin: 52px 0;
        }

        .tni-return-table-wrap {
          width: 100%;
          margin-top: 24px;
          overflow-x: auto;
          border: 1px solid rgba(128, 128,128, 0.22);
          border-radius: 12px;
        }

        .tni-return-table {
          width: 100%;
          min-width: 680px;
          border-collapse: collapse;
          font-variant-numeric: tabular-nums;
        }

        .tni-return-table th,
        .tni-return-table td {
          padding: 13px 18px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.16);
          text-align: right;
          white-space: nowrap;
        }

        .tni-return-table th:first-child,
        .tni-return-table td:first-child {
          text-align: left;
        }

        .tni-return-table thead th {
          position: sticky;
          top: 0;
          z-index: 1;
          font-size: 12px;
          letter-spacing: 0.035em;
          text-transform: uppercase;
          background: inherit;
        }

        .tni-return-table tbody tr:last-child th,
        .tni-return-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .tni-return-table tbody tr:hover {
          background: rgba(128, 128, 128, 0.07);
        }

        .tni-return-table .is-positive,
        .tni-return-table .is-negative {
          font-weight: 700;
        }

        .tni-return-table-note {
          margin-top: 14px;
          font-size: 12px;
          line-height: 1.6;
          opacity: 0.7;
        }


        .tni-return-methods__summary-section {
          margin-top: 72px;
          padding-top: 48px;
          border-top: 1px solid rgba(148, 163, 184, 0.22);
          scroll-margin-top: 96px;
        }

        .tni-return-methods__section-header {
          max-width: 900px;
          margin-bottom: 28px;
        }

        .tni-return-methods__section-eyebrow {
          display: block;
          margin-bottom: 10px;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #d500c7;
        }

        .tni-return-methods__section-header h2 {
          margin: 0 0 14px;
          font-size: clamp(1.65rem, 3vw, 2.35rem);
          line-height: 1.12;
        }

        .tni-return-methods__section-header p {
          margin: 0;
          max-width: 820px;
          line-height: 1.7;
          opacity: 0.82;
        }

        .tni-return-methods__summary-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
        }

        .tni-return-methods__summary-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
          font-variant-numeric: tabular-nums;
        }

        .tni-return-methods__summary-table th,
        .tni-return-methods__summary-table td {
          padding: 15px 16px;
          text-align: right;
          border-bottom: 1px solid rgba(148, 163, 184, 0.14);
          white-space: nowrap;
        }

        .tni-return-methods__summary-table th:first-child,
        .tni-return-methods__summary-table td:first-child,
        .tni-return-methods__summary-table th:nth-child(2),
        .tni-return-methods__summary-table td:nth-child(2) {
          text-align: left;
        }

        .tni-return-methods__summary-table thead th {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.055em;
          text-transform: uppercase;
          opacity: 0.72;
        }

        .tni-return-methods__summary-table tbody tr:last-child th,
        .tni-return-methods__summary-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .tni-return-methods__summary-table tbody tr:hover {
          background: rgba(213, 0, 199, 0.045);
        }

        .tni-return-methods__summary-period-note {
          display: block;
          margin-top: 3px;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          opacity: 0.5;
        }


        .tni-return-methods__summary-explanation {
          max-width: 920px;
          margin-top: 34px;
          padding-top: 30px;
          border-top: 1px solid rgba(148, 163, 184, 0.18);
        }

        .tni-return-methods__summary-explanation h3 {
          margin: 0 0 18px;
          font-size: clamp(1.25rem, 2vw, 1.6rem);
          line-height: 1.2;
        }

        .tni-return-methods__summary-explanation p {
          margin: 0 0 16px;
          line-height: 1.72;
          font-size: 0.98rem;
          opacity: 0.86;
        }

        .tni-return-methods__summary-explanation strong {
          font-weight: 750;
          opacity: 1;
        }

        .tni-return-methods__summary-caution {
          margin-top: 24px !important;
          padding: 16px 18px;
          border-left: 3px solid #d500c7;
          background: rgba(213, 0, 199, 0.045);
          border-radius: 0 10px 10px 0;
        }

        .tni-return-methods__summary-notes {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 18px;
        }

        .tni-return-methods__summary-notes p {
          margin: 0;
          padding: 16px 18px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 12px;
          line-height: 1.65;
          font-size: 0.9rem;
          opacity: 0.78;
        }

        @media (max-width: 900px) {

          .tni-return-methods__summary-section {
            margin-top: 52px;
            padding-top: 36px;
          }

          .tni-return-methods__summary-table-wrap {
            margin-left: 0;
            margin-right: 0;
            border-radius: 12px;
            -webkit-overflow-scrolling: touch;
          }

          .tni-return-methods__summary-table {
            min-width: 680px;
          }

          .tni-return-methods__summary-table th,
          .tni-return-methods__summary-table td {
            padding: 13px 12px;
          }

          .tni-return-methods__summary-notes {
            grid-template-columns: 1fr;
          }


          .tni-return-methods__summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .tni-methodology-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .tni-return-methods__selector {
            grid-template-columns: 1fr;
          }

          .tni-return-methods__selector button {
            text-align: left;
          }

          .tni-return-methods__summary {
            grid-template-columns: 1fr 1fr;
          }

          .tni-return-methods__explorer {
            padding: 14px;
          }

          .tni-return-methods__explorer-buttons button {
            flex: 1 1 auto;
          }

          .tni-return-methods__explorer-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .tni-return-stat {
            padding: 14px;
          }
        }

        @media (max-width: 480px) {
          .tni-return-methods__summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
