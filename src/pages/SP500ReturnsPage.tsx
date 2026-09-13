import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import SP500AnnualReturnsChart from '../components/charts/SP500AnnualReturnsChart'
import SP500HistoricalReturnsArticle from '../components/research/SP500HistoricalReturnsArticle'
import sp500AnnualReturns from '../data/charts/sp500AnnualReturns.json'

// ============================================================================
// TNI S&P 500 RETURN CENTER — VERIFIED DATA TYPES
// ============================================================================

type AnnualReturnRecord = {
  year: number
  value: number
  label: string
  status: string
}

type SP500PageData = {
  symbol: string
  ticker: string
  metric: string
  return_type: string
  source: string

  methodology: {
    calculation: string
    current_year: string
  }

  summary: {
    completed_years_analyzed: number
    start_year: number
    end_year: number
    positive_years: number
    negative_years: number
    positive_year_pct: number
    negative_year_pct: number
    average_annual_return_pct: number
    median_annual_return_pct: number

    best_year: {
      year: number
      return_pct: number
    }

    worst_year: {
      year: number
      return_pct: number
    }
  }

  current_year: {
    year: number
    label: string
    return_pct: number
  }

  data: AnnualReturnRecord[]
}

const dataset =
  sp500AnnualReturns as SP500PageData

// ============================================================================
// TNI RETURN EXPLORER — FILTER TYPES
// ============================================================================

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

// ============================================================================
// TNI ANNUAL RETURNS — NUMBER FORMATTING
// ============================================================================

function formatReturn(
  value: number,
) {
  const sign =
    value > 0 ? '+' : ''

  return `${sign}${value.toFixed(2)}%`
}

// ============================================================================
// TNI ANNUAL RETURNS — RETURN REGIME
//
// RED    = Negative return
// AMBER  = 0% to <10%
// GREEN  = >=10%
// ============================================================================

function getReturnRegime(
  value: number,
) {
  if (value < 0) {
    return {
      label: 'Negative',
      textColor: '#b42318',
      background: '#fef3f2',
      border: '#fecdca',
    }
  }

  if (value < 10) {
    return {
      label: '0% – <10%',
      textColor: '#9a6700',
      background: '#fffaeb',
      border: '#fedf89',
    }
  }

  return {
    label: '≥10%',
    textColor: '#067647',
    background: '#ecfdf3',
    border: '#abefc6',
  }
}

// ============================================================================
// TNI RETURN EXPLORER — MEDIAN CALCULATION
// ============================================================================

function calculateMedian(
  values: number[],
) {
  if (values.length === 0) {
    return 0
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b,
    )

  const middle =
    Math.floor(
      sorted.length / 2,
    )

  if (
    sorted.length % 2 === 0
  ) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2
  }

  return sorted[middle]
}

// ============================================================================
// TNI RETURN EXPLORER — MAIN PAGE
// ============================================================================

export default function SP500ReturnsPage() {
  // ==========================================================================
  // TNI S&P 500 RETURNS — SEO METADATA & HISTORICAL CANONICAL URL
  //
  // Preserve the original indexed URL:
  // https://tradingninvestment.com/sp-500-returns/
  // ==========================================================================

  useEffect(() => {
    const seoTitle =
      'S&P 500 Returns by Year (1928–2026) | Historical Returns & Average Return'

    const seoDescription =
      'Explore S&P 500 returns by year from 1928 through 2026 YTD, including historical annual returns, average return, positive and negative years, market performance, and interactive return statistics.'

    const canonicalUrl =
      'https://tradingninvestment.com/sp-500-returns/'

    document.title = seoTitle

    let description =
      document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      )

    if (!description) {
      description =
        document.createElement('meta')

      description.name =
        'description'

      document.head.appendChild(
        description,
      )
    }

    description.content =
      seoDescription

    let canonical =
      document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      )

    if (!canonical) {
      canonical =
        document.createElement('link')

      canonical.rel =
        'canonical'

      document.head.appendChild(
        canonical,
      )
    }

    canonical.href =
      canonicalUrl
  }, [])

  // ==========================================================================
  // TNI RETURN EXPLORER — MASTER DATA BOUNDARIES
  // ==========================================================================

  const minimumYear =
    Math.min(
      ...dataset.data.map(
        (row) => row.year,
      ),
    )

  const maximumYear =
    Math.max(
      ...dataset.data.map(
        (row) => row.year,
      ),
    )

  // ==========================================================================
  // TNI RETURN EXPLORER — FILTER STATE
  // ==========================================================================

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
    useState(minimumYear)

  const [
    customEndYear,
    setCustomEndYear,
  ] =
    useState(maximumYear)

  // ==========================================================================
  // TNI RETURN EXPLORER — ACTIVE YEAR RANGE
  // ==========================================================================

  const {
    activeStartYear,
    activeEndYear,
  } =
    useMemo(() => {
      if (
        rangePreset === 'custom'
      ) {
        return {
          activeStartYear:
            customStartYear,

          activeEndYear:
            customEndYear,
        }
      }

      if (
        rangePreset === 'all'
      ) {
        return {
          activeStartYear:
            minimumYear,

          activeEndYear:
            maximumYear,
        }
      }

      const years =
        Number(
          rangePreset.replace(
            'y',
            '',
          ),
        )

      return {
        activeStartYear:
          Math.max(
            minimumYear,
            maximumYear -
              years +
              1,
          ),

        activeEndYear:
          maximumYear,
      }
    }, [
      rangePreset,
      customStartYear,
      customEndYear,
      minimumYear,
      maximumYear,
    ])

  // ==========================================================================
  // TNI RETURN EXPLORER — FILTERED VERIFIED DATA
  //
  // Chart, table and statistics all use this same filtered array.
  // ==========================================================================

  const filteredData =
    useMemo(() => {
      return dataset.data.filter(
        (row) => {
          const withinRange =
            row.year >=
              activeStartYear &&
            row.year <=
              activeEndYear

          if (!withinRange) {
            return false
          }

          if (
            performanceFilter ===
            'positive'
          ) {
            return row.value >= 0
          }

          if (
            performanceFilter ===
            'negative'
          ) {
            return row.value < 0
          }

          return true
        },
      )
    }, [
      activeStartYear,
      activeEndYear,
      performanceFilter,
    ])

  // ==========================================================================
  // TNI RETURN EXPLORER — TABLE ORDER
  // ==========================================================================

  const annualRows =
    useMemo(() => {
      return [
        ...filteredData,
      ].sort(
        (a, b) =>
          b.year - a.year,
      )
    }, [filteredData])

  // ==========================================================================
  // TNI RETURN EXPLORER — COMPLETED YEARS ONLY FOR HISTORICAL STATISTICS
  // ==========================================================================

  const completedFilteredData =
    useMemo(() => {
      return filteredData.filter(
        (row) =>
          row.year <
          dataset.current_year.year,
      )
    }, [filteredData])

  // ==========================================================================
  // TNI RETURN EXPLORER — DYNAMIC STATISTICS
  // ==========================================================================

  const filteredStats =
    useMemo(() => {
      if (
        completedFilteredData.length ===
        0
      ) {
        return null
      }

      const values =
        completedFilteredData.map(
          (row) => row.value,
        )

      const average =
        values.reduce(
          (sum, value) =>
            sum + value,
          0,
        ) / values.length

      const median =
        calculateMedian(values)

      const positiveYears =
        completedFilteredData.filter(
          (row) =>
            row.value >= 0,
        ).length

      const negativeYears =
        completedFilteredData.filter(
          (row) =>
            row.value < 0,
        ).length

      const bestYear =
        completedFilteredData.reduce(
          (best, row) =>
            row.value >
            best.value
              ? row
              : best,
        )

      const worstYear =
        completedFilteredData.reduce(
          (worst, row) =>
            row.value <
            worst.value
              ? row
              : worst,
        )

      return {
        average,
        median,
        positiveYears,
        negativeYears,

        positivePct:
          (
            positiveYears /
            completedFilteredData.length
          ) * 100,

        negativePct:
          (
            negativeYears /
            completedFilteredData.length
          ) * 100,

        bestYear,
        worstYear,
      }
    }, [completedFilteredData])

  // ==========================================================================
  // TNI RETURN EXPLORER — CURRENT YTD VISIBILITY
  // ==========================================================================

  const filteredCurrentYear =
    filteredData.find(
      (row) =>
        row.year ===
        dataset.current_year.year,
    )

  // ==========================================================================
  // TNI RETURN EXPLORER — HUMAN-READABLE RANGE SUMMARY
  // ==========================================================================

  const rangeSummary =
    `${activeStartYear}–${
      activeEndYear ===
      dataset.current_year.year
        ? dataset.current_year.label
        : activeEndYear
    }`

  const observationLabel =
    filteredData.length === 1
      ? 'observation'
      : 'observations'

  // ==========================================================================
  // TNI RETURN EXPLORER — CUSTOM RANGE HANDLERS
  // ==========================================================================

  function handleStartYearChange(
    value: number,
  ) {
    setRangePreset('custom')

    setCustomStartYear(
      value,
    )

    if (
      value >
      customEndYear
    ) {
      setCustomEndYear(
        value,
      )
    }
  }

  function handleEndYearChange(
    value: number,
  ) {
    setRangePreset('custom')

    setCustomEndYear(
      value,
    )

    if (
      value <
      customStartYear
    ) {
      setCustomStartYear(
        value,
      )
    }
  }

  // ==========================================================================
  // TNI RETURN EXPLORER — RESET
  // ==========================================================================

  function resetFilters() {
    setPerformanceFilter(
      'all',
    )

    setRangePreset(
      'all',
    )

    setCustomStartYear(
      minimumYear,
    )

    setCustomEndYear(
      maximumYear,
    )
  }

  const filtersAreActive =
    performanceFilter !==
      'all' ||
    rangePreset !== 'all'

  // ==========================================================================
  // TNI S&P 500 RETURN CENTER — PAGE
  // ==========================================================================

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: '#10233f',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width:
            'min(1180px, calc(100% - 32px))',

          margin: '0 auto',

          padding:
            '52px 0 80px',
        }}
      >
        {/* =================================================================
            TNI S&P 500 RETURN CENTER — PAGE INTRODUCTION
        ================================================================= */}

        <section
          style={{
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              marginBottom: '10px',
              color: '#1677ff',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing:
                '0.08em',
              textTransform:
                'uppercase',
            }}
          >
            TradingNInvestment Research
          </div>

          <h1>
            S&amp;P 500 Returns by Year (1928–2026): Historical Annual Returns
            and Market Performance
          </h1>

          <p
            style={{
              maxWidth: '820px',

              margin:
                '18px 0 0',

              color: '#607086',

              fontSize: '16px',

              lineHeight: 1.7,
            }}
          >
            Explore historical S&P 500 returns by year from 1928 through{' '}
            {dataset.current_year.label}. Analyze positive and negative years,
            S&P 500 average returns, and 3-year, 5-year, 10-year and 20-year
            performance periods using the interactive research explorer.
          </p>
        </section>

        {/* =================================================================
            TNI RETURN CENTER — RESEARCH VIEW NAVIGATION
        ================================================================= */}

        <nav
          aria-label="S&P 500 return research views"
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            marginBottom: '34px',
            paddingBottom: '8px',

            borderBottom:
              '1px solid #e6edf5',
          }}
        >
          {[
            'Annual Returns',
            'Monthly Returns',
            'Weekly Returns',
            'Daily Returns',
            'Seasonality',
          ].map(
            (
              item,
              index,
            ) => (
              <button
                key={item}
                type="button"
                disabled={
                  index !== 0
                }
                style={{
                  flexShrink: 0,

                  minHeight:
                    '42px',

                  padding:
                    '0 16px',

                  border:
                    index === 0
                      ? '1px solid #1677ff'
                      : '1px solid transparent',

                  borderRadius:
                    '8px',

                  background:
                    index === 0
                      ? '#eef6ff'
                      : 'transparent',

                  color:
                    index === 0
                      ? '#0b63ce'
                      : '#8a98aa',

                  fontSize:
                    '13px',

                  fontWeight:
                    700,

                  cursor:
                    index === 0
                      ? 'default'
                      : 'not-allowed',

                  opacity:
                    index === 0
                      ? 1
                      : 0.7,
                }}
              >
                {item}
              </button>
            ),
          )}
        </nav>

        {/* =================================================================
            TNI ANNUAL RETURNS — SECTION HEADER
        ================================================================= */}

        <section
          style={{
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              color: '#1677ff',
              fontSize: '12px',
              fontWeight: 800,

              letterSpacing:
                '0.08em',

              textTransform:
                'uppercase',
            }}
          >
            Annual Returns
          </div>

          <h2
            style={{
              margin:
                '7px 0 0',

              color: '#10233f',

              fontSize: '28px',

              lineHeight: 1.2,

              letterSpacing:
                '-0.025em',
            }}
          >
            S&P 500 Annual Price Returns by Year
          </h2>
        </section>

        {/* =================================================================
            TNI RETURN EXPLORER — PRODUCT DIFFERENTIATOR
        ================================================================= */}

        <section
          className="tni-return-explorer"
          aria-label="Explore S&P 500 returns"
        >
          <div className="tni-return-explorer-header">
            <div>
              <div className="tni-return-explorer-title">
                Explore S&P 500 Returns
              </div>

              <div className="tni-return-explorer-subtitle">
                Filter historical performance to analyze different market periods.
              </div>
            </div>

            <div className="tni-return-explorer-status">
              <strong>
                Showing {rangeSummary}
              </strong>

              <span>
                {filteredData.length}{' '}
                {observationLabel}
              </span>
            </div>
          </div>

          <div className="tni-return-explorer-controls">
            {/* =============================================================
                TNI FILTER — PERFORMANCE
            ============================================================= */}

            <div className="tni-filter-group">
              <div className="tni-filter-label">
                Performance
              </div>

              <div className="tni-filter-button-row">
                <FilterButton
                  active={
                    performanceFilter ===
                    'all'
                  }
                  onClick={() =>
                    setPerformanceFilter(
                      'all',
                    )
                  }
                >
                  All Years
                </FilterButton>

                <FilterButton
                  active={
                    performanceFilter ===
                    'positive'
                  }
                  onClick={() =>
                    setPerformanceFilter(
                      'positive',
                    )
                  }
                >
                  Positive
                </FilterButton>

                <FilterButton
                  active={
                    performanceFilter ===
                    'negative'
                  }
                  onClick={() =>
                    setPerformanceFilter(
                      'negative',
                    )
                  }
                >
                  Negative
                </FilterButton>
              </div>
            </div>

            {/* =============================================================
                TNI FILTER — PRESET TIME PERIOD
            ============================================================= */}

            <div className="tni-filter-group">
              <div className="tni-filter-label">
                Time Period
              </div>

              <div className="tni-filter-button-row tni-filter-period-row">
                <FilterButton
                  active={
                    rangePreset ===
                    'all'
                  }
                  onClick={() =>
                    setRangePreset(
                      'all',
                    )
                  }
                >
                  All
                </FilterButton>

                {[
                  {
                    key: '3y',
                    label: '3Y',
                    aria:
                      'Show 3 year S&P 500 return period',
                  },
                  {
                    key: '5y',
                    label: '5Y',
                    aria:
                      'Show 5 year S&P 500 return period',
                  },
                  {
                    key: '10y',
                    label: '10Y',
                    aria:
                      'Show S&P 500 10 year return period',
                  },
                  {
                    key: '20y',
                    label: '20Y',
                    aria:
                      'Show S&P 500 20 year return period',
                  },
                ].map(
                  (period) => (
                    <FilterButton
                      key={
                        period.key
                      }
                      active={
                        rangePreset ===
                        period.key
                      }
                      ariaLabel={
                        period.aria
                      }
                      onClick={() =>
                        setRangePreset(
                          period.key as RangePreset,
                        )
                      }
                    >
                      {
                        period.label
                      }
                    </FilterButton>
                  ),
                )}
              </div>
            </div>

            {/* =============================================================
                TNI FILTER — CUSTOM RANGE
            ============================================================= */}

            <div className="tni-filter-group tni-filter-custom-group">
              <div className="tni-filter-label">
                Custom Range
              </div>

              <div className="tni-custom-range">
                <div className="tni-custom-select-wrap">
                  <span>
                    From
                  </span>

                  <select
                    aria-label="S&P 500 return start year"
                    value={
                      customStartYear
                    }
                    onChange={(
                      event,
                    ) =>
                      handleStartYearChange(
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                  >
                    {dataset.data.map(
                      (row) => (
                        <option
                          key={
                            row.year
                          }
                          value={
                            row.year
                          }
                        >
                          {
                            row.year
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="tni-custom-range-arrow">
                  →
                </div>

                <div className="tni-custom-select-wrap">
                  <span>
                    To
                  </span>

                  <select
                    aria-label="S&P 500 return end year"
                    value={
                      customEndYear
                    }
                    onChange={(
                      event,
                    ) =>
                      handleEndYearChange(
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                  >
                    {dataset.data.map(
                      (row) => (
                        <option
                          key={
                            row.year
                          }
                          value={
                            row.year
                          }
                        >
                          {
                            row.year
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              TNI RETURN EXPLORER — ACTIVE FILTER SUMMARY
          =============================================================== */}

          <div className="tni-return-explorer-footer">
            <div>
              <strong>
                {rangeSummary}
              </strong>

              <span>
                {' '}•{' '}
                {filteredData.length}{' '}
                {observationLabel}
              </span>

              {performanceFilter !==
                'all' && (
                <span>
                  {' '}•{' '}
                  {performanceFilter ===
                  'positive'
                    ? 'Positive years only'
                    : 'Negative years only'}
                </span>
              )}
            </div>

            {filtersAreActive && (
              <button
                type="button"
                className="tni-filter-reset"
                onClick={
                  resetFilters
                }
              >
                Reset Filters
              </button>
            )}
          </div>
        </section>

        {/* =================================================================
            TNI ANNUAL RETURNS — INTERACTIVE FILTERED CHART
        ================================================================= */}

        <section
          style={{
            marginBottom: '26px',
            padding: '22px',

            border:
              '1px solid #e4ebf3',

            borderRadius:
              '14px',

            background:
              '#ffffff',
          }}
        >
          {filteredData.length >
          0 ? (
            <SP500AnnualReturnsChart
              data={
                filteredData
              }
              rangeLabel={
                `Showing ${rangeSummary}`
              }
            />
          ) : (
            <div className="tni-no-filter-results">
              No S&P 500 annual returns match this filter combination.
            </div>
          )}
        </section>

        {/* =================================================================
            TNI S&P 500 RETURNS — SHARE / EMBED / LICENSING
        ================================================================= */}

        <section
          style={{
            marginBottom: '34px',
            padding: '22px',
            border: '1px solid #dfe8f3',
            borderRadius: '14px',
            background: '#f8fbff',
          }}
        >
          {/* ===============================================================
              TNI SHARE THIS RESEARCH — SECTION HEADER
          =============================================================== */}

          <div
            style={{
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                marginBottom: '6px',
                color: '#1677ff',
                fontSize: '12px',
                fontWeight: 850,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Share This Research
            </div>

            <h2
              style={{
                margin: 0,
                color: '#10233f',
                fontSize: '22px',
                letterSpacing: '-0.02em',
              }}
            >
              Use the TradingNInvestment S&amp;P 500 Returns Chart
            </h2>

            <p
              style={{
                margin: '8px 0 0',
                maxWidth: '760px',
                color: '#66768a',
                fontSize: '14px',
                lineHeight: 1.65,
              }}
            >
              Share the interactive chart, embed it in an article or website,
              or use the static research visualization subject to the usage
              terms below.
            </p>
          </div>

          {/* ===============================================================
              TNI SHARE THIS RESEARCH — ACTION BUTTONS
          =============================================================== */}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <a
              href="/embed/sp-500-returns/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '42px',
                padding: '0 16px',
                borderRadius: '9px',
                background: '#1677ff',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              View Interactive Embed
            </a>

            <button
              type="button"
              disabled
              title="Static chart download will be added next."
              style={{
                minHeight: '42px',
                padding: '0 16px',
                border: '1px solid #cdd9e7',
                borderRadius: '9px',
                background: '#ffffff',
                color: '#708196',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'not-allowed',
                opacity: 0.8,
              }}
            >
              Download Static Chart — Coming Soon
            </button>
          </div>

          {/* ===============================================================
              TNI PUBLISHER EMBED — COPYABLE IFRAME CODE
          =============================================================== */}

          <div
            style={{
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                marginBottom: '7px',
                color: '#10233f',
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              Publisher Embed Code
            </div>

            <div
              style={{
                overflowX: 'auto',
                padding: '13px 14px',
                border: '1px solid #dfe8f3',
                borderRadius: '9px',
                background: '#ffffff',
                color: '#43546a',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '11px',
                lineHeight: 1.6,
                whiteSpace: 'nowrap',
              }}
            >
              {'<iframe src="https://tradingninvestment.com/embed/sp-500-returns/" width="100%" height="620" style="border:0;" loading="lazy" title="S&P 500 Historical Returns — TradingNInvestment Research"></iframe>'}
            </div>
          </div>

          {/* ===============================================================
              TNI USAGE & LICENSING — PERMISSION LANGUAGE
          =============================================================== */}

          <div
            style={{
              paddingTop: '18px',
              borderTop: '1px solid #dfe8f3',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px',
                color: '#10233f',
                fontSize: '17px',
              }}
            >
              Usage &amp; Licensing
            </h3>

            <p
              style={{
                margin: '0 0 10px',
                color: '#66768a',
                fontSize: '13px',
                lineHeight: 1.7,
              }}
            >
              This TradingNInvestment research visualization and associated
              analysis are provided for personal, educational, and
              non-commercial research use with appropriate
              TradingNInvestment attribution.
            </p>

            <p
              style={{
                margin: '0 0 10px',
                color: '#45566b',
                fontSize: '13px',
                fontWeight: 750,
                lineHeight: 1.7,
              }}
            >
              Commercial reproduction, redistribution, resale, publication
              in commercial products or services, or removal of
              TradingNInvestment attribution requires prior permission.
            </p>

            <p
              style={{
                margin: '0 0 10px',
                color: '#66768a',
                fontSize: '13px',
                lineHeight: 1.7,
              }}
            >
              For commercial licensing, publishing permissions, data
              partnerships, or other usage requests,{' '}
              <a
                href="/contact"
                style={{
                  color: '#1677ff',
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                Contact TradingNInvestment →
              </a>
            </p>

            <p
              style={{
                margin: 0,
                color: '#8794a5',
                fontSize: '11px',
                lineHeight: 1.65,
              }}
            >
              Underlying market data may be subject to separate third-party
              data-provider terms. TradingNInvestment permission applies to
              TradingNInvestment's original visualization, presentation,
              analysis, and associated research materials and does not grant
              rights to third-party data.
            </p>
          </div>
        </section>

        {/* =================================================================
            TNI ANNUAL RETURNS — COMPLETE / FILTERED HISTORICAL TABLE
        ================================================================= */}

        <section
          style={{
            marginBottom: '42px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',

              alignItems:
                'flex-end',

              gap: '20px',

              flexWrap:
                'wrap',

              marginBottom:
                '16px',
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,

                  color:
                    '#10233f',

                  fontSize:
                    '24px',

                  letterSpacing:
                    '-0.02em',
                }}
              >
                S&P 500 Returns by Year
              </h2>

              <p
                className="tni-annual-table-description"
                style={{
                  margin:
                    '7px 0 0',

                  color:
                    '#6b7b90',

                  lineHeight:
                    1.6,
                }}
              >
                Showing {filteredData.length}{' '}
                annual price-return{' '}
                {filteredData.length ===
                1
                  ? 'observation'
                  : 'observations'}{' '}
                for {rangeSummary}.
              </p>
            </div>

            {/* =============================================================
                TNI ANNUAL TABLE — RETURN COLOR LEGEND
            ============================================================= */}

            <div
              className="tni-return-legend"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                fontWeight: 750,
              }}
            >
              <span
                style={{
                  color:
                    '#b42318',
                }}
              >
                ● Negative
              </span>

              <span
                style={{
                  color:
                    '#9a6700',
                }}
              >
                ● 0% – &lt;10%
              </span>

              <span
                style={{
                  color:
                    '#067647',
                }}
              >
                ● ≥10%
              </span>
            </div>
          </div>

          <div
            className="tni-annual-table-container"
            style={{
              border:
                '1px solid #e4ebf3',

              borderRadius:
                '12px',

              background:
                '#ffffff',
            }}
          >
            <table
              className="tni-annual-returns-table"
              style={{
                width: '100%',
                borderCollapse:
                  'collapse',
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      '#f7f9fc',

                    borderBottom:
                      '1px solid #e4ebf3',
                  }}
                >
                  <th
                    scope="col"
                    style={{
                      padding:
                        '14px 18px',

                      textAlign:
                        'left',

                      color:
                        '#526276',

                      fontSize:
                        '11px',

                      fontWeight:
                        800,

                      letterSpacing:
                        '0.06em',

                      textTransform:
                        'uppercase',
                    }}
                  >
                    Year
                  </th>

                  <th
                    scope="col"
                    style={{
                      padding:
                        '14px 18px',

                      textAlign:
                        'right',

                      color:
                        '#526276',

                      fontSize:
                        '11px',

                      fontWeight:
                        800,

                      letterSpacing:
                        '0.06em',

                      textTransform:
                        'uppercase',
                    }}
                  >
                    S&P 500 Price Return
                  </th>

                  <th
                    scope="col"
                    style={{
                      padding:
                        '14px 18px',

                      textAlign:
                        'right',

                      color:
                        '#526276',

                      fontSize:
                        '11px',

                      fontWeight:
                        800,

                      letterSpacing:
                        '0.06em',

                      textTransform:
                        'uppercase',
                    }}
                  >
                    Return Category
                  </th>
                </tr>
              </thead>

              <tbody>
                {annualRows.map(
                  (row) => {
                    const regime =
                      getReturnRegime(
                        row.value,
                      )

                    return (
                      <tr
                        key={
                          row.year
                        }
                        style={{
                          borderBottom:
                            '1px solid #edf1f6',

                          background:
                            row.year ===
                            dataset
                              .current_year
                              .year
                              ? '#fbfdff'
                              : '#ffffff',
                        }}
                      >
                        <td
                          style={{
                            padding:
                              '13px 18px',

                            color:
                              '#263a53',

                            fontSize:
                              '14px',

                            fontWeight:
                              row.year ===
                              dataset
                                .current_year
                                .year
                                ? 800
                                : 650,
                          }}
                        >
                          {
                            row.label
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              '13px 18px',

                            textAlign:
                              'right',
                          }}
                        >
                          <span
                            style={{
                              display:
                                'inline-block',

                              minWidth:
                                '88px',

                              padding:
                                '5px 10px',

                              border:
                                `1px solid ${regime.border}`,

                              borderRadius:
                                '7px',

                              background:
                                regime.background,

                              color:
                                regime.textColor,

                              fontSize:
                                '14px',

                              fontWeight:
                                800,

                              fontVariantNumeric:
                                'tabular-nums',
                            }}
                          >
                            {formatReturn(
                              row.value,
                            )}
                          </span>
                        </td>

                        <td
                          style={{
                            padding:
                              '13px 18px',

                            textAlign:
                              'right',

                            color:
                              regime.textColor,

                            fontSize:
                              '12px',

                            fontWeight:
                              750,
                          }}
                        >
                          {
                            regime.label
                          }
                        </td>
                      </tr>
                    )
                  },
                )}
              </tbody>
            </table>

            {annualRows.length ===
              0 && (
              <div className="tni-no-filter-results">
                No annual returns match the selected filters.
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: '10px',

              color:
                '#78879a',

              fontSize:
                '11px',

              lineHeight:
                1.6,
            }}
          >
            2026 is reported as year-to-date (YTD). Historical figures are
            price returns and exclude dividends.
          </div>
        </section>

        {/* =================================================================
            TNI ANNUAL RETURNS — DYNAMIC FILTERED STATISTICS
        ================================================================= */}

        <section
          style={{
            marginBottom: '42px',
          }}
        >
          <h2
            style={{
              margin:
                '0 0 6px',

              color:
                '#10233f',

              fontSize:
                '24px',

              letterSpacing:
                '-0.02em',
            }}
          >
            S&P 500 Return Statistics
          </h2>

          <p
            style={{
              margin:
                '0 0 16px',

              color:
                '#6b7b90',

              fontSize:
                '13px',

              lineHeight:
                1.6,
            }}
          >
            Statistics below update with the selected filters. Average,
            median, best and worst annual returns use completed calendar years
            only, so the current YTD period does not distort historical annual
            statistics.
          </p>

          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',

              gap: '12px',
            }}
          >
            {filteredStats ? (
              <>
                <StatCard
                  label="Average Annual Return"
                  value={formatReturn(
                    filteredStats.average,
                  )}
                  detail={`${completedFilteredData.length} completed ${
                    completedFilteredData.length ===
                    1
                      ? 'year'
                      : 'years'
                  }`}
                />

                <StatCard
                  label="Median Annual Return"
                  value={formatReturn(
                    filteredStats.median,
                  )}
                  detail="Completed years only"
                />

                <StatCard
                  label="Positive Years"
                  value={`${filteredStats.positiveYears}`}
                  detail={`${filteredStats.positivePct.toFixed(
                    2,
                  )}% of completed years`}
                />

                <StatCard
                  label="Negative Years"
                  value={`${filteredStats.negativeYears}`}
                  detail={`${filteredStats.negativePct.toFixed(
                    2,
                  )}% of completed years`}
                />

                <StatCard
                  label="Best Year"
                  value={formatReturn(
                    filteredStats.bestYear.value,
                  )}
                  detail={`${filteredStats.bestYear.year}`}
                />

                <StatCard
                  label="Worst Year"
                  value={formatReturn(
                    filteredStats.worstYear.value,
                  )}
                  detail={`${filteredStats.worstYear.year}`}
                />
              </>
            ) : (
              <StatCard
                label="Completed-Year Statistics"
                value="—"
                detail="No completed years match this filter."
              />
            )}

            {filteredCurrentYear && (
              <StatCard
                label={
                  dataset
                    .current_year
                    .label
                }
                value={formatReturn(
                  filteredCurrentYear.value,
                )}
                detail="Current year-to-date"
              />
            )}
          </div>
        </section>

        {/* =================================================================
            TNI ANNUAL RETURNS — DATA CONTEXT
        ================================================================= */}

        <section
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',

            gap: '12px',

            marginBottom:
              '42px',
          }}
        >
          <InfoCard
            label="Historical Coverage"
            value={`${dataset.summary.start_year}–${dataset.current_year.year}`}
          />

          <InfoCard
            label="Return Type"
            value="S&P 500 Price Return"
          />

          <InfoCard
            label="Data Source"
            value="Yahoo Finance — S&P 500 Index (^GSPC)"
          />
        </section>

        {/* =================================================================
            TNI ANNUAL RETURNS — METHODOLOGY & SOURCE
        ================================================================= */}

        
        {/* ==================================================================
            TNI S&P 500 RETURNS — LONG-FORM HISTORICAL RESEARCH ARTICLE
            Crawlable HTML content for the canonical /sp-500-returns/ page.
        ================================================================== */}
        <SP500HistoricalReturnsArticle />

<section
          style={{
            paddingTop:
              '28px',

            borderTop:
              '1px solid #e4ebf3',
          }}
        >
          <div
            style={{
              marginBottom:
                '8px',

              color:
                '#1677ff',

              fontSize:
                '11px',

              fontWeight:
                800,

              letterSpacing:
                '0.08em',

              textTransform:
                'uppercase',
            }}
          >
            Methodology & Source
          </div>

          <h2
            style={{
              margin:
                '0 0 12px',

              color:
                '#10233f',

              fontSize:
                '22px',
            }}
          >
            How the annual returns are calculated
          </h2>

          <p
            style={{
              maxWidth:
                '900px',

              margin: 0,

              color:
                '#66768a',

              fontSize:
                '13px',

              lineHeight:
                1.8,
            }}
          >
            {dataset.methodology.calculation}{' '}
            {dataset.methodology.current_year}
          </p>

          <p
            style={{
              maxWidth:
                '900px',

              margin:
                '10px 0 0',

              color:
                '#66768a',

              fontSize:
                '13px',

              lineHeight:
                1.8,
            }}
          >
            Data Source: Yahoo Finance — S&P 500 Index (^GSPC). These figures
            represent price returns and do not include dividends.
          </p>
        </section>
      </div>
    </main>
  )
}

// ============================================================================
// TNI RETURN EXPLORER — FILTER BUTTON
// ============================================================================

function FilterButton({
  active,
  onClick,
  children,
  ariaLabel,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      className={
        active
          ? 'tni-filter-button tni-filter-button-active'
          : 'tni-filter-button'
      }
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// ============================================================================
// TNI S&P 500 RETURN CENTER — STATISTIC CARD
// ============================================================================

function StatCard({
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
        minHeight: '112px',
        padding: '18px',

        border:
          '1px solid #e4ebf3',

        borderRadius:
          '10px',

        background:
          '#ffffff',
      }}
    >
      <div
        style={{
          marginBottom:
            '9px',

          color:
            '#728197',

          fontSize:
            '11px',

          fontWeight:
            750,

          textTransform:
            'uppercase',

          letterSpacing:
            '0.04em',
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            '#10233f',

          fontSize:
            '23px',

          fontWeight:
            800,

          fontVariantNumeric:
            'tabular-nums',
        }}
      >
        {value}
      </div>

      {detail && (
        <div
          style={{
            marginTop:
              '5px',

            color:
              '#8592a3',

            fontSize:
              '11px',
          }}
        >
          {detail}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// TNI S&P 500 RETURN CENTER — INFORMATION CARD
// ============================================================================

function InfoCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        padding: '18px',

        border:
          '1px solid #e4ebf3',

        borderRadius:
          '10px',

        background:
          '#f9fbfd',
      }}
    >
      <div
        style={{
          marginBottom:
            '7px',

          color:
            '#738298',

          fontSize:
            '10px',

          fontWeight:
            800,

          textTransform:
            'uppercase',

          letterSpacing:
            '0.06em',
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            '#263a53',

          fontSize:
            '13px',

          fontWeight:
            650,

          lineHeight:
            1.5,
        }}
      >
        {value}
      </div>
    </div>
  )
}
