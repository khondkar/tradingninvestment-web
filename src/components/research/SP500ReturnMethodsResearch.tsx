import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import datasetJson from '../../data/sp500-historical-return-methods.json'

import type {
  SP500ReturnMethodChartRow,
  SP500ReturnMode,
} from '../charts/SP500ReturnMethodChart'
import HistoricalPeriodSlider from './HistoricalPeriodSlider'
import ResearchShareButton from './ResearchShareButton'
import './SP500ReturnMethodsResearch.css'

const SP500ReturnMethodChart =
  lazy(
    () =>
      import(
        '../charts/SP500ReturnMethodChart'
      ),
  )

const loadDividendCompoundingExplorer =
  () =>
    import(
      '../charts/DividendCompoundingExplorer'
    )

const DividendCompoundingExplorer =
  lazy(
    loadDividendCompoundingExplorer,
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

type DividendCompoundingSummary = {
  startYear: number
  endYear: number
  observationCount: number
  startingInvestment: number
  priceEndingValue: number
  totalEndingValue: number
  dividendWealthDifference: number
  priceCagr: number | null
  totalCagr: number | null
}

type DividendPeriodComparison = {
  label: string
  startYear: number
  endYear: number
  observationCount: number
  startingInvestment: number
  priceEndingValue: number
  totalEndingValue: number
  dividendReinvestmentContribution: number
  priceCagr: number | null
  totalCagr: number | null
  contributionPct: number
}

const DIVIDEND_COMPARISON_PERIODS = [
  1,
  2,
  3,
  5,
  10,
  30,
  50,
  100,
  150,
] as const

function buildDividendPeriodComparison(
  rows: SP500ReturnMethodChartRow[],
  years: number | null,
  startingInvestment = 10000,
): DividendPeriodComparison | null {
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

  if (completed.length === 0) {
    return null
  }

  if (
    years !== null &&
    completed.length < years
  ) {
    return null
  }

  const selected =
    years === null
      ? completed
      : completed.slice(-years)

  let priceEndingValue =
    startingInvestment

  let totalEndingValue =
    startingInvestment

  for (const row of selected) {
    priceEndingValue *=
      1 +
      row.price_return / 100

    totalEndingValue *=
      1 +
      row.total_return / 100
  }

  const observationCount =
    selected.length

  const priceCagr =
    priceEndingValue > 0
      ? (
          Math.pow(
            priceEndingValue /
              startingInvestment,
            1 / observationCount,
          ) - 1
        ) * 100
      : null

  const totalCagr =
    totalEndingValue > 0
      ? (
          Math.pow(
            totalEndingValue /
              startingInvestment,
            1 / observationCount,
          ) - 1
        ) * 100
      : null

  const dividendReinvestmentContribution =
    totalEndingValue -
    priceEndingValue

  const contributionPct =
    totalEndingValue !== 0
      ? (
          dividendReinvestmentContribution /
          totalEndingValue
        ) * 100
      : 0

  return {
    label:
      years === null
        ? `Full History · ${observationCount} Years`
        : `${years} ${
            years === 1
              ? 'Year'
              : 'Years'
          }`,
    startYear:
      selected[0].year,
    endYear:
      selected[
        selected.length - 1
      ].year,
    observationCount,
    startingInvestment,
    priceEndingValue,
    totalEndingValue,
    dividendReinvestmentContribution,
    priceCagr,
    totalCagr,
    contributionPct,
  }
}

function buildDividendComparisonTable(
  rows: SP500ReturnMethodChartRow[],
): DividendPeriodComparison[] {
  const periodRows =
    DIVIDEND_COMPARISON_PERIODS
      .map((years) =>
        buildDividendPeriodComparison(
          rows,
          years,
        ),
      )
      .filter(
        (
          row,
        ): row is DividendPeriodComparison =>
          row !== null,
      )

  const fullHistory =
    buildDividendPeriodComparison(
      rows,
      null,
    )

  if (fullHistory) {
    periodRows.push(
      fullHistory,
    )
  }

  return periodRows
}

function formatDividendTableMoney(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return '—'
  }

  const absolute =
    Math.abs(value)

  const sign =
    value < 0
      ? '-'
      : ''

  if (
    absolute >=
    1_000_000_000
  ) {
    return `${sign}$${(
      absolute /
      1_000_000_000
    ).toFixed(2)}B`
  }

  if (
    absolute >=
    1_000_000
  ) {
    return `${sign}$${(
      absolute /
      1_000_000
    ).toFixed(2)}M`
  }

  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

function formatDividendContributionMoney(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return '—'
  }

  const formatted =
    formatDividendTableMoney(
      Math.abs(value),
    )

  if (value > 0) {
    return `+${formatted}`
  }

  if (value < 0) {
    return `-${formatted}`
  }

  return formatted
}

function formatDividendTablePercent(
  value: number | null,
  digits = 2,
): string {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  return `${value.toFixed(
    digits,
  )}%`
}

function buildDividendCompoundingSummary(
  rows: SP500ReturnMethodChartRow[],
  startingInvestment = 10000,
): DividendCompoundingSummary | null {
  const completed =
    [...rows]
      .filter(
        (row) =>
          !row.is_ytd &&
          Number.isFinite(row.price_return) &&
          Number.isFinite(row.total_return),
      )
      .sort(
        (a, b) =>
          a.year - b.year,
      )

  if (completed.length === 0) {
    return null
  }

  let priceEndingValue =
    startingInvestment

  let totalEndingValue =
    startingInvestment

  for (const row of completed) {
    priceEndingValue *=
      1 + row.price_return / 100

    totalEndingValue *=
      1 + row.total_return / 100
  }

  return {
    startYear:
      completed[0].year,

    endYear:
      completed[
        completed.length - 1
      ].year,

    observationCount:
      completed.length,

    startingInvestment,

    priceEndingValue,

    totalEndingValue,

    dividendWealthDifference:
      totalEndingValue -
      priceEndingValue,

    priceCagr:
      compoundAnnualizedReturn(
        completed,
        'price_return',
      ),

    totalCagr:
      compoundAnnualizedReturn(
        completed,
        'total_return',
      ),
  }
}

function formatWealthValue(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return '—'
  }

  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  ).format(value)
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


  const [
    shouldLoadDividendExplorer,
    setShouldLoadDividendExplorer,
  ] =
    useState(false)

  const dividendSectionRef =
    useRef<HTMLElement | null>(
      null,
    )

  const historicalSummary =
    useMemo(
      () =>
        buildHistoricalSummary(
          dataset.data,
        ),
      [],
    )

  useEffect(() => {
    if (
      shouldLoadDividendExplorer
    ) {
      return
    }

    const section =
      dividendSectionRef.current

    if (section === null) {
      return
    }

    if (
      typeof IntersectionObserver ===
      'undefined'
    ) {
      setShouldLoadDividendExplorer(
        true,
      )

      return
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) =>
                entry.isIntersecting,
            )
          ) {
            void loadDividendCompoundingExplorer()

            setShouldLoadDividendExplorer(
              true,
            )

            observer.disconnect()
          }
        },
        {
          rootMargin:
            '500px 0px 500px 0px',

          threshold: 0,
        },
      )

    observer.observe(section)

    return () => {
      observer.disconnect()
    }
  }, [
    shouldLoadDividendExplorer,
  ])

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

  const dividendCompoundingSummary =
    useMemo(
      () =>
        buildDividendCompoundingSummary(
          dataset.data,
        ),
      [],
    )

  const dividendComparisonRows =
    useMemo(
      () =>
        buildDividendComparisonTable(
          dataset.data,
        ),
      [],
    )

  const dividendComparisonFullHistory =
    dividendComparisonRows.length > 0
      ? dividendComparisonRows[
          dividendComparisonRows.length -
            1
        ]
      : null

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

        {latestRow?.data_through && (
          <div
            style={{
              marginTop: '10px',
              color: '#123B73',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            Market data through{' '}
            {new Date(
              `${latestRow.data_through}T00:00:00`,
            ).toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              },
            )}
          </div>
        )}

        <div className="tni-return-methods__byline">
          <span>By Kamal Khondkar</span>
          <span aria-hidden="true">·</span>
          <span>TradingNInvestment Research</span>
        </div>

        <div className="tni-return-methods__share">
          <ResearchShareButton
            title="Average Stock Market Return: S&P 500 Returns by Year"
            text={`Explore U.S. stock market returns from ${dataset.start_year} through ${dataset.end_year}${dataset.current_year_is_ytd ? ' YTD' : ''}, including dividends and inflation.`}
            url="https://tradingninvestment.com/average-stock-market-return/"
          />
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

      <nav
        className="tni-return-methods__article-nav"
        aria-label="Article sections"
      >
        <a
          href="#historical-return-summary"
          className="tni-return-methods__nav-item"
        >
          RETURNS
        </a>

        <div className="tni-return-methods__nav-dropdown">
          <a
            href="#dividends-and-compounding"
            className="tni-return-methods__nav-item tni-return-methods__nav-item--dividends"
            aria-label="Dividends and Compounding"
            onClick={() => {
              void loadDividendCompoundingExplorer()

              setShouldLoadDividendExplorer(
                true,
              )
            }}
          >
            DIVIDENDS
          </a>

          <a
            href="#dividends-and-compounding"
            className="tni-return-methods__nav-subitem"
            tabIndex={-1}
            onClick={() => {
              void loadDividendCompoundingExplorer()

              setShouldLoadDividendExplorer(
                true,
              )
            }}
          >
            COMPOUNDING
          </a>
        </div>

        <a
          href="#methodology-sources-verification"
          className="tni-return-methods__nav-item"
        >
          METHODOLOGY
        </a>

        <a
          href="#stock-market-returns-by-year"
          className="tni-return-methods__nav-item"
        >
          RETURNS BY YEAR
        </a>
      </nav>

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

      <div className="tni-return-methods__chart-context">
        <p>
          <strong>Three return measures:</strong>{' '}
          <strong>Price Return</strong> measures changes in
          the market index level and excludes reinvested
          dividends. <strong>Total Return</strong> includes
          dividends and assumes they are reinvested.{' '}
          <strong>Real Total Return</strong> starts with
          dividend-reinvested total return and adjusts it
          for inflation. These are distinct measures and
          should not be interpreted interchangeably.
        </p>
      </div>

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
          SECTION 3 — DIVIDENDS & COMPOUNDING
      ===================================================== */}

      {dividendCompoundingSummary && (
        <section
          id="dividends-and-compounding"
          ref={dividendSectionRef}
          className="tni-return-methods__dividend-section tni-return-methods__major-section"
        >
          <header className="tni-return-methods__section-header">
            <span className="tni-return-methods__section-number">
              SECTION 3
            </span>

            <span className="tni-return-methods__section-eyebrow">
              DIVIDENDS &amp; COMPOUNDING
            </span>

            <h2>
              How Dividends Changed Long-Term
              Stock Market Returns
            </h2>

            <p>
              Stock-price appreciation tells only
              part of the historical return story.
              Investors may also receive dividends,
              and when those dividends are
              reinvested they purchase additional
              shares that can participate in future
              price gains and future dividends.
            </p>
          </header>

          <div className="tni-dividend-intro">
            <p>
              TNI separates{' '}
              <strong>price return</strong> from{' '}
              <strong>total return</strong> so the
              effect of reinvested dividends can be
              seen directly. Price return measures
              changes in market prices alone. Total
              return includes dividends and assumes
              those distributions are reinvested.
            </p>

            <p>
              Across long holding periods, even a
              modest difference in annualized return
              can produce a very large difference in
              ending wealth because each year's
              return compounds on the value created
              in previous years.
            </p>
          </div>

          <div className="tni-dividend-comparison">
            <div className="tni-dividend-comparison__heading">
              <span>
                HISTORICAL COMPOUNDING COMPARISON
              </span>

              <h3>
                What $10,000 Would Have Become:
                Price Return vs. Total Return
              </h3>

              <p>
                Hypothetical growth across the{' '}
                {
                  dividendCompoundingSummary.observationCount
                }{' '}
                completed annual observations from{' '}
                <strong>
                  {
                    dividendCompoundingSummary.startYear
                  }
                </strong>{' '}
                through{' '}
                <strong>
                  {
                    dividendCompoundingSummary.endYear
                  }
                </strong>
                .
              </p>
            </div>

            <div className="tni-dividend-cards">
              <article className="tni-dividend-card">
                <span>
                  STARTING INVESTMENT
                </span>

                <strong>
                  {formatWealthValue(
                    dividendCompoundingSummary.startingInvestment,
                  )}
                </strong>

                <small>
                  Same hypothetical starting value
                  for both return methods
                </small>
              </article>

              <article className="tni-dividend-card">
                <span>
                  PRICE RETURN
                </span>

                <strong>
                  {formatWealthValue(
                    dividendCompoundingSummary.priceEndingValue,
                  )}
                </strong>

                <small>
                  {
                    formatSummaryReturn(
                      dividendCompoundingSummary.priceCagr,
                    )
                  }{' '}
                  annualized · excludes dividends
                </small>
              </article>

              <article className="tni-dividend-card tni-dividend-card--primary">
                <span>
                  TOTAL RETURN
                </span>

                <strong>
                  {formatWealthValue(
                    dividendCompoundingSummary.totalEndingValue,
                  )}
                </strong>

                <small>
                  {
                    formatSummaryReturn(
                      dividendCompoundingSummary.totalCagr,
                    )
                  }{' '}
                  annualized · dividends reinvested
                </small>
              </article>
            </div>

            <div className="tni-dividend-difference">
              <span>
                COMPOUNDING DIFFERENCE
              </span>

              <strong>
                {formatWealthValue(
                  dividendCompoundingSummary.dividendWealthDifference,
                )}
              </strong>

              <p>
                Difference between the hypothetical
                ending values produced by the
                dividend-reinvested total-return
                series and the price-only series.
              </p>
            </div>
          </div>

          <div className="tni-dividend-explorer-shell">
            {shouldLoadDividendExplorer ? (
              <Suspense
                fallback={
                  <div
                    className="tni-dividend-explorer-loading"
                    aria-live="polite"
                  >
                    Loading interactive
                    dividend analysis…
                  </div>
                }
              >
                <DividendCompoundingExplorer
                  data={dataset.data}
                />
              </Suspense>
            ) : (
              <div
                className="tni-dividend-explorer-loading"
                aria-hidden="true"
              >
                Interactive dividend
                analysis loads as this
                section approaches.
              </div>
            )}
          </div>

          {dividendComparisonRows.length >
            0 && (
            <div className="tni-dividend-period-comparison">
              <div className="tni-dividend-period-comparison__heading">
                <span>
                  RETURNS BY INVESTMENT
                  PERIOD
                </span>

                <h3>
                  Stock Market Returns
                  With and Without
                  Dividends by Investment
                  Period
                </h3>

                <p
                  id="dividend-return-table-description"
                >
                  This historical comparison shows
                  how a hypothetical{' '}
                  <strong>
                    {formatWealthValue(
                      dividendComparisonRows[
                        0
                      ].startingInvestment,
                    )}
                  </strong>{' '}
                  investment would have grown using
                  price return alone versus total
                  return with dividends reinvested.
                  Each investment period is calculated
                  independently from completed
                  calendar-year observations, allowing
                  direct comparison of the effect of
                  dividend reinvestment across short-
                  and long-term holding periods.
                </p>
              </div>

              <div className="tni-dividend-period-table-shell">
                <table
                  className="tni-dividend-period-table"
                  aria-describedby="dividend-return-table-description"
                >
                  <caption>
                    Historical stock market price return,
                    total return with dividends reinvested,
                    and dividend plus reinvestment
                    contribution by investment period,
                    based on a hypothetical $10,000
                    starting investment.
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col">
                        PERIOD
                      </th>

                      <th scope="col">
                        PRICE RETURN
                      </th>

                      <th scope="col">
                        TOTAL RETURN
                      </th>

                      <th scope="col">
                        DIVIDEND +
                        REINVESTMENT
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {
                      dividendComparisonRows.map(
                        (row) => (
                          <tr
                            key={`${row.label}-${row.startYear}-${row.endYear}`}
                          >
                            <th scope="row">
                              <strong>
                                {
                                  row.label
                                }
                              </strong>

                              <small>
                                {
                                  row.startYear
                                }
                                –
                                {
                                  row.endYear
                                }
                              </small>
                            </th>

                            <td>
                              <strong>
                                {
                                  formatDividendTableMoney(
                                    row.priceEndingValue,
                                  )
                                }
                              </strong>

                              <small>
                                {
                                  formatDividendTablePercent(
                                    row.priceCagr,
                                  )
                                }{' '}
                                {
                                  row.observationCount ===
                                  1
                                    ? 'return'
                                    : 'CAGR'
                                }
                              </small>
                            </td>

                            <td>
                              <strong>
                                {
                                  formatDividendTableMoney(
                                    row.totalEndingValue,
                                  )
                                }
                              </strong>

                              <small>
                                {
                                  formatDividendTablePercent(
                                    row.totalCagr,
                                  )
                                }{' '}
                                {
                                  row.observationCount ===
                                  1
                                    ? 'return'
                                    : 'CAGR'
                                }
                              </small>
                            </td>

                            <td className="tni-dividend-period-table__contribution">
                              <strong>
                                {
                                  formatDividendContributionMoney(
                                    row.dividendReinvestmentContribution,
                                  )
                                }
                              </strong>

                              <small>
                                <span className="tni-dividend-period-table__contribution-pill">
                                  {
                                    formatDividendTablePercent(
                                      row.contributionPct,
                                      1,
                                    )
                                  }{' '}
                                  contribution
                                </span>
                              </small>
                            </td>
                          </tr>
                        ),
                      )
                    }
                  </tbody>
                </table>
              </div>

              {
                dividendComparisonFullHistory && (
                  <div className="tni-dividend-table-guide">
                    <h3>
                      How to Read This
                      Table
                    </h3>

                    <p>
                      Every row begins
                      with the same
                      hypothetical{' '}
                      <strong>
                        {
                          formatWealthValue(
                            dividendComparisonFullHistory
                              .startingInvestment,
                          )
                        }
                      </strong>{' '}
                      investment and
                      compounds the
                      completed annual
                      observations for
                      that period. The{' '}
                      <strong>
                        Price Return
                      </strong>{' '}
                      column shows the
                      ending value and
                      annualized return
                      from market-price
                      changes alone. The{' '}
                      <strong>
                        Total Return
                      </strong>{' '}
                      column shows the
                      ending value and
                      annualized return
                      when dividends are
                      reinvested.
                    </p>

                    <p>
                      The{' '}
                      <strong>
                        Dividend +
                        Reinvestment
                      </strong>{' '}
                      column is the
                      difference between
                      those two ending
                      wealth paths. Its
                      contribution
                      percentage measures
                      the share of ending
                      total-return wealth
                      represented by that
                      difference. It is{' '}
                      <strong>
                        not a historical
                        dividend yield
                      </strong>{' '}
                      and should not be
                      interpreted as a
                      standalone dividend
                      return.
                    </p>

                    <p>
                      Across the full{' '}
                      <strong>
                        {
                          dividendComparisonFullHistory
                            .observationCount
                        }
                        -year
                      </strong>{' '}
                      completed history
                      from{' '}
                      <strong>
                        {
                          dividendComparisonFullHistory
                            .startYear
                        }
                      </strong>{' '}
                      through{' '}
                      <strong>
                        {
                          dividendComparisonFullHistory
                            .endYear
                        }
                      </strong>
                      , the hypothetical{' '}
                      <strong>
                        {
                          formatWealthValue(
                            dividendComparisonFullHistory
                              .startingInvestment,
                          )
                        }
                      </strong>{' '}
                      price-only
                      investment grew to{' '}
                      <strong>
                        {
                          formatDividendTableMoney(
                            dividendComparisonFullHistory
                              .priceEndingValue,
                          )
                        }
                      </strong>
                      , compared with{' '}
                      <strong>
                        {
                          formatDividendTableMoney(
                            dividendComparisonFullHistory
                              .totalEndingValue,
                          )
                        }
                      </strong>{' '}
                      using the
                      dividend-reinvested
                      total-return series.
                      The{' '}
                      <strong>
                        {
                          formatDividendContributionMoney(
                            dividendComparisonFullHistory
                              .dividendReinvestmentContribution,
                          )
                        }
                      </strong>{' '}
                      difference
                      represents{' '}
                      <strong>
                        {
                          formatDividendTablePercent(
                            dividendComparisonFullHistory
                              .contributionPct,
                            1,
                          )
                        }
                      </strong>{' '}
                      of ending
                      total-return wealth
                      in this historical
                      comparison.
                    </p>

                    <div className="tni-dividend-table-takeaway">
                      <h4>
                        What the Historical Data Shows
                      </h4>

                      <p>
                        Over the full{' '}
                        <strong>
                          {
                            dividendComparisonFullHistory
                              .observationCount
                          }
                          -year
                        </strong>{' '}
                        completed history from{' '}
                        <strong>
                          {
                            dividendComparisonFullHistory
                              .startYear
                          }
                        </strong>{' '}
                        through{' '}
                        <strong>
                          {
                            dividendComparisonFullHistory
                              .endYear
                          }
                        </strong>
                        , a hypothetical{' '}
                        <strong>
                          {
                            formatWealthValue(
                              dividendComparisonFullHistory
                                .startingInvestment,
                            )
                          }
                        </strong>{' '}
                        following the price-return
                        series grew to approximately{' '}
                        <strong>
                          {
                            formatDividendTableMoney(
                              dividendComparisonFullHistory
                                .priceEndingValue,
                            )
                          }
                        </strong>
                        . Using the
                        dividend-reinvested
                        total-return series, the same
                        hypothetical starting
                        investment grew to
                        approximately{' '}
                        <strong>
                          {
                            formatDividendTableMoney(
                              dividendComparisonFullHistory
                                .totalEndingValue,
                            )
                          }
                        </strong>
                        .
                      </p>

                      <p>
                        The difference between these
                        two historical wealth paths
                        was approximately{' '}
                        <strong>
                          {
                            formatDividendContributionMoney(
                              dividendComparisonFullHistory
                                .dividendReinvestmentContribution,
                            )
                          }
                        </strong>
                        . That difference represents{' '}
                        <strong>
                          {
                            formatDividendTablePercent(
                              dividendComparisonFullHistory
                                .contributionPct,
                              1,
                            )
                          }
                        </strong>{' '}
                        of ending total-return wealth
                        in this historical comparison.
                      </p>

                      <p>
                        The dividend + reinvestment
                        contribution is not a dividend
                        yield or a standalone dividend
                        return. It measures the
                        difference between the
                        dividend-reinvested
                        total-return wealth path and
                        the price-only wealth path,
                        including the long-term
                        compounding effect of
                        reinvested dividends.
                      </p>
                    </div>

                    <p className="tni-dividend-table-guide__note">
                      Historical results
                      are hypothetical and
                      do not include
                      taxes, fees,
                      transaction costs
                      or other
                      investor-specific
                      effects. Past
                      performance is not
                      a forecast of future
                      returns.
                    </p>
                  </div>
                )
              }
            </div>
          )}

          {fullHistorySummary && (
            <div className="tni-dividend-explanation">
              <h3>
                Why Reinvested Dividends Matter
              </h3>

              <p>
                Over the completed historical period
                from{' '}
                <strong>
                  {fullHistorySummary.startYear}
                </strong>{' '}
                through{' '}
                <strong>
                  {fullHistorySummary.endYear}
                </strong>
                , the annualized price return was{' '}
                <strong>
                  {formatSummaryReturn(
                    fullHistorySummary.price_return,
                  )}
                </strong>
                , compared with an annualized total
                return of{' '}
                <strong>
                  {formatSummaryReturn(
                    fullHistorySummary.total_return,
                  )}
                </strong>{' '}
                when dividends were reinvested.
              </p>

              <p>
                The gap between those annualized
                returns may appear relatively small
                when viewed one year at a time. Over
                many decades, however, compounding
                repeatedly applies that difference
                to an increasingly larger base.
                That is why long-run price-index
                performance and long-run investor
                total return can tell very different
                stories.
              </p>

              <p>
                Dividend reinvestment does not
                eliminate market risk. Total-return
                investors still experienced major
                bear markets, recessions and
                financial crises. The comparison
                isolates how the treatment of
                dividends changes the measurement
                of historical market performance.
              </p>
            </div>
          )}

          {twentyYearSummary && (
            <div className="tni-dividend-recent">
              <span>
                RECENT PERSPECTIVE
              </span>

              <p>
                During the latest{' '}
                <strong>
                  {
                    twentyYearSummary.observationCount
                  } completed years
                </strong>
                , from{' '}
                <strong>
                  {twentyYearSummary.startYear}
                </strong>{' '}
                through{' '}
                <strong>
                  {twentyYearSummary.endYear}
                </strong>
                , annualized total return was{' '}
                <strong>
                  {formatSummaryReturn(
                    twentyYearSummary.total_return,
                  )}
                </strong>
                , compared with annualized price
                return of{' '}
                <strong>
                  {formatSummaryReturn(
                    twentyYearSummary.price_return,
                  )}
                </strong>
                .
              </p>
            </div>
          )}

          <p className="tni-dividend-note">
            <strong>Methodology note:</strong>{' '}
            This is a historical illustration based
            on TNI's annual return series, not the
            performance of an investable account.
            It assumes annual compounding and, for
            total return, reinvestment of dividends.
            It does not include taxes, transaction
            costs, management fees or investor cash
            flows. Historical results do not predict
            future returns.
          </p>
        </section>
      )}

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
          RELATED HISTORICAL RESEARCH
      ===================================================== */}

      <aside
        className="tni-return-methods__related-research"
        aria-labelledby="related-historical-research"
      >
        <span className="tni-return-methods__section-eyebrow">
          RELATED HISTORICAL RESEARCH
        </span>

        <h2 id="related-historical-research">
          Continue Exploring U.S. Market History
        </h2>

        <p>
          Compare this long-run total-return research with
          TradingNInvestment&apos;s established historical
          market studies and original visual research.
        </p>

        <div className="tni-return-methods__related-links">
          <a href="/sp-500-returns/">
            <strong>
              S&amp;P 500 Historical Returns by Year
            </strong>
            <span>
              Explore annual S&amp;P 500 price returns and
              long-term performance.
            </span>
          </a>

          <a href="/stock-market-historical-returns/">
            <strong>
              Dow Jones Historical Returns
            </strong>
            <span>
              Explore more than a century of Dow Jones
              annual market history.
            </span>
          </a>

          <a href="/wp-content/uploads/2016/03/Dow-Jones-History-1920-to-1940.jpg">
            <strong>
              Original Dow Jones History 1920–1940 Chart
            </strong>
            <span>
              View the preserved TradingNInvestment
              historical chart covering the 1920s boom,
              1929 crash and subsequent market decline.
            </span>
          </a>
        </div>
      </aside>

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
                            ? ` YTD · Through ${new Date(
                                `${row.data_through}T00:00:00`,
                              ).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                },
                              )}`
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

        /* ---------------------------------------------
           ARTICLE SECTION NAVIGATION
        --------------------------------------------- */

        .tni-return-methods__article-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 24px 0 30px;
          padding: 5px;
          overflow-x: auto;
          border: 1px solid #e4ebf3;
          border-radius: 12px;
          background: #ffffff;
          scrollbar-width: none;
        }

        .tni-return-methods__article-nav::-webkit-scrollbar {
          display: none;
        }

        .tni-return-methods__nav-item {
          position: relative;
          flex: 0 0 auto;
          padding: 9px 11px;
          border-radius: 7px;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-decoration: none;
          white-space: nowrap;
          transition:
            background 160ms ease,
            color 160ms ease;
        }

        .tni-return-methods__nav-item:hover,
        .tni-return-methods__nav-item:focus-visible {
          background: #f4f7fb;
          color: #10233f;
        }

        /*
          COLORFUL RESEARCH TABS
        */

        .tni-return-methods__article-nav {
          gap: 8px;
          padding: 8px;
          overflow: visible;
          border-color: #d8e1ec;
        }

        .tni-return-methods__nav-item {
          border: 1px solid #bfd1e5;
          background:
            linear-gradient(
              180deg,
              #f5f9ff 0%,
              #e6f0fb 100%
            );
          color: #123b69;
          box-shadow:
            0 3px 10px
            rgba(16, 35, 63, 0.07);
          transition:
            transform 150ms ease,
            box-shadow 150ms ease,
            border-color 150ms ease;
        }

        .tni-return-methods__nav-item:hover,
        .tni-return-methods__nav-item:focus-visible {
          border-color: #789abb;
          box-shadow:
            0 7px 18px
            rgba(16, 35, 63, 0.13);
          transform: translateY(-1px);
        }

        /*
          DIVIDENDS — permanent soft green
        */

        .tni-return-methods__nav-dropdown {
          position: relative;
          flex: 0 0 auto;
        }

        .tni-return-methods__nav-item--dividends {
          display: block;
          border-color: #8eb4a0;
          background:
            linear-gradient(
              180deg,
              #eaf7ef 0%,
              #dcefe4 100%
            );
          color: #185c38;
        }

        .tni-return-methods__nav-item--dividends:hover,
        .tni-return-methods__nav-item--dividends:focus-visible {
          border-color: #5d9674;
          color: #10492c;
        }

        /*
          COMPOUNDING — vertical dropdown
        */

        .tni-return-methods__nav-subitem {
          position: absolute;
          z-index: 40;
          top: calc(100% + 5px);
          left: 0;
          min-width: 100%;
          padding: 9px 11px;
          border: 1px solid #8eb4a0;
          border-radius: 7px;
          background: #ffffff;
          color: #185c38;
          box-shadow:
            0 10px 24px
            rgba(16, 35, 63, 0.14);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.06em;
          opacity: 0;
          pointer-events: none;
          text-align: center;
          text-decoration: none;
          transform: translateY(-5px);
          transition:
            opacity 150ms ease,
            transform 150ms ease;
          white-space: nowrap;
        }

        .tni-return-methods__nav-dropdown:hover
        .tni-return-methods__nav-subitem,
        .tni-return-methods__nav-dropdown:focus-within
        .tni-return-methods__nav-subitem {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }


        /* ---------------------------------------------
           DIVIDENDS & COMPOUNDING
        --------------------------------------------- */

        .tni-return-methods__dividend-section {
          margin: 72px 0;
          padding-top: 8px;
          scroll-margin-top: 90px;
        }

        .tni-return-methods__section-number {
          display: block;
          margin-bottom: 7px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .tni-return-methods__dividend-section
        .tni-return-methods__section-header {
          max-width: 860px;
          margin-bottom: 30px;
        }

        .tni-return-methods__dividend-section
        .tni-return-methods__section-eyebrow {
          display: block;
          margin-bottom: 10px;
          color: #52647b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .tni-return-methods__dividend-section
        .tni-return-methods__section-header h2 {
          max-width: 760px;
          margin: 0 0 16px;
          color: #10233f;
          font-size:
            clamp(30px, 5vw, 46px);
          line-height: 1.08;
          letter-spacing: -0.035em;
        }

        .tni-return-methods__dividend-section p {
          color: #52647b;
          font-size: 15px;
          line-height: 1.75;
        }

        .tni-dividend-intro {
          max-width: 850px;
          margin-bottom: 30px;
        }

        .tni-dividend-intro p {
          margin: 0 0 14px;
        }


        /* ---------------------------------------------
           COMPOUNDING COMPARISON
        --------------------------------------------- */

        .tni-dividend-comparison {
          margin: 32px 0;
          padding:
            clamp(20px, 4vw, 34px);
          border: 1px solid #dfe7f0;
          border-radius: 16px;
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #f8fafc 100%
            );
        }

        .tni-dividend-comparison__heading {
          max-width: 760px;
          margin-bottom: 24px;
        }

        .tni-dividend-comparison__heading > span,
        .tni-dividend-recent > span,
        .tni-dividend-difference > span {
          display: block;
          margin-bottom: 8px;
          color: #718096;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .tni-dividend-comparison__heading h3,
        .tni-dividend-explanation h3 {
          margin: 0 0 10px;
          color: #10233f;
          font-size:
            clamp(22px, 3vw, 30px);
          line-height: 1.15;
          letter-spacing: -0.025em;
        }

        .tni-dividend-comparison__heading p {
          margin: 0;
        }

        .tni-dividend-cards {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .tni-dividend-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid #e1e8f0;
          border-radius: 12px;
          background: #ffffff;
        }

        .tni-dividend-card > span {
          display: block;
          margin-bottom: 12px;
          color: #718096;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.09em;
        }

        .tni-dividend-card > strong {
          display: block;
          margin-bottom: 8px;
          overflow-wrap: anywhere;
          color: #10233f;
          font-size:
            clamp(24px, 3vw, 34px);
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .tni-dividend-card > small {
          color: #718096;
          font-size: 11px;
          line-height: 1.5;
        }

        .tni-dividend-card--primary {
          border-color: #b9c9dc;
          box-shadow:
            0 10px 30px
            rgba(16, 35, 63, 0.07);
        }

        .tni-dividend-card--primary > strong {
          color: #0b315f;
        }


        /* ---------------------------------------------
           COMPOUNDING DIFFERENCE
        --------------------------------------------- */

        .tni-dividend-difference {
          margin-top: 14px;
          padding: 20px;
          border-radius: 12px;
          background: #10233f;
        }

        .tni-dividend-difference > span {
          color: #a9bad0;
        }

        .tni-dividend-difference > strong {
          display: block;
          margin-bottom: 8px;
          overflow-wrap: anywhere;
          color: #ffffff;
          font-size:
            clamp(28px, 5vw, 42px);
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .tni-dividend-difference p {
          max-width: 720px;
          margin: 0;
          color: #d9e3ef;
          font-size: 12px;
        }


        /* ---------------------------------------------
           DIVIDEND EXPLANATION
        --------------------------------------------- */

        .tni-dividend-explanation,
        .tni-dividend-recent {
          max-width: 850px;
          margin-top: 30px;
        }

        .tni-dividend-explanation p,
        .tni-dividend-recent p {
          margin: 0 0 14px;
        }

        .tni-dividend-recent {
          padding: 20px 22px;
          border-left:
            3px solid #10233f;
          background: #f7f9fc;
        }

        .tni-dividend-recent p {
          margin: 0;
        }

        .tni-dividend-note {
          max-width: 850px;
          margin: 28px 0 0;
          padding-top: 18px;
          border-top:
            1px solid #e4ebf3;
          font-size: 12px !important;
          line-height: 1.65 !important;
        }


        /* ---------------------------------------------
           JUMP LINK POSITIONING
        --------------------------------------------- */

        #historical-return-summary,
        #methodology-sources-verification,
        #stock-market-returns-by-year {
          scroll-margin-top: 90px;
        }


        /* ---------------------------------------------
           MOBILE
        --------------------------------------------- */

        @media (max-width: 720px) {
          .tni-return-methods__article-nav {
            margin: 20px -4px 26px;
          }

          /*
            Mobile has no hover.
            Keep only the colorful primary tabs.
          */

          .tni-return-methods__nav-subitem {
            display: none;
          }

          .tni-return-methods__article-nav {
            overflow-x: auto;
            overflow-y: visible;
          }

          .tni-dividend-cards {
            grid-template-columns: 1fr;
          }

          .tni-return-methods__dividend-section {
            margin: 56px 0;
          }

          .tni-dividend-comparison {
            padding: 18px;
            border-radius: 13px;
          }

          .tni-dividend-card {
            padding: 18px;
          }
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

        .tni-return-methods__related-research {
          margin: 64px 0;
          padding: 32px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 18px;
          background:
            linear-gradient(
              135deg,
              rgba(15, 23, 42, 0.035),
              rgba(255, 255, 255, 0)
            );
        }

        .tni-return-methods__related-research h2 {
          margin: 8px 0 10px;
          font-size: clamp(1.45rem, 2.4vw, 2rem);
          line-height: 1.2;
        }

        .tni-return-methods__related-research > p {
          max-width: 760px;
          margin: 0 0 24px;
          line-height: 1.65;
          opacity: 0.78;
        }

        .tni-return-methods__related-links {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .tni-return-methods__related-links a {
          display: flex;
          min-width: 0;
          min-height: 132px;
          padding: 20px;
          flex-direction: column;
          justify-content: space-between;
          gap: 14px;
          color: inherit;
          text-decoration: none;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.62);
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            box-shadow 160ms ease;
        }

        .tni-return-methods__related-links a:hover {
          transform: translateY(-2px);
          border-color: rgba(213, 0, 199, 0.42);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
        }

        .tni-return-methods__related-links a:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 3px;
        }

        .tni-return-methods__related-links strong {
          display: block;
          font-size: 1rem;
          line-height: 1.35;
        }

        .tni-return-methods__related-links span {
          display: block;
          font-size: 0.88rem;
          line-height: 1.55;
          opacity: 0.72;
        }

        @media (max-width: 900px) {

          .tni-return-methods__related-research {
            margin: 52px 0;
            padding: 24px;
          }

          .tni-return-methods__related-links {
            grid-template-columns: 1fr;
          }

          .tni-return-methods__related-links a {
            min-height: 0;
          }

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
