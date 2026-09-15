// ============================================================================
// TNI ANNUAL RETURNS — GENERIC PAGE BASELINE
//
// Purpose:
// - Preserve the exact proven S&P 500 annual-return page hierarchy.
// - Use this file as the reusable page template for stocks and indices.
// - Generic asset/config/data wiring will be introduced incrementally.
// - This baseline is not yet connected to routing.
// ============================================================================

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  calculateCompletedPeriodReturn,
  type CompletedPeriodReturn,
} from '../research/annual-returns/calculations'
import {
  calculateAnnualReturnsArticleStatistics,
  calculateRecentWindowArticleStatistics,
} from '../research/annual-returns/articleCalculations'
import {
  buildAnnualReturnsDatasetAlternateName,
  buildAnnualReturnsDatasetDescription,
  buildAnnualReturnsDatasetName,
  buildAnnualReturnsHeadline,
  buildAnnualReturnsSeoDescription,
  buildAvailablePeriodReturnsLabel,
} from '../research/annual-returns/labels'
import GenericAnnualReturnsChart from './GenericAnnualReturnsChart'
import GenericAnnualReturnsArticle from './GenericAnnualReturnsArticle'
import LatestMarketIntelligence from '../components/news/LatestMarketIntelligence'
import {
  calculateMedian,
  FilterButton,
  formatReturn,
  getReturnRegime,
  InfoCard,
  StatCard,
  type AnnualReturnsPageData,
  type PerformanceFilter,
  type RangePreset,
} from '../research/annual-returns/pageShared'
import type { AnnualReturnsAssetConfig } from '../research/annual-returns/types'

// ============================================================================
// TNI ANNUAL RETURNS — GENERIC PAGE PROPS
//
// Asset metadata and verified annual-return data are supplied by the caller.
// The shared S&P visual hierarchy remains unchanged.
// ============================================================================

export type GenericAnnualReturnsPageProps = {
  config: AnnualReturnsAssetConfig
  dataset: AnnualReturnsPageData
}

// ============================================================================
// TNI RETURN EXPLORER — MAIN PAGE
// ============================================================================

export default function GenericAnnualReturnsPage({
  config,
  dataset,
}: GenericAnnualReturnsPageProps) {

  // ==========================================================================
  // TNI ANNUAL RETURNS — ASSET-DERIVED DOM / SCHEMA IDS
  // ==========================================================================

  const articleSchemaId =
    "tni-" + config.slug + "-article-schema"

  const datasetSchemaId =
    "tni-" + config.slug + "-dataset-schema"

  const historicalStatisticsId =
    config.slug + "-historical-statistics"

  const periodReturnsId =
    config.slug + "-period-returns"

  // ==========================================================================
  // TNI ANNUAL RETURNS — AVAILABLE PERIOD HORIZONS
  // ==========================================================================

  const availablePeriodYears =
    [1, 3, 5, 10, 20].filter(
      (years) =>
        calculateCompletedPeriodReturn(
          dataset,
          years,
        ) !== null,
    )

  // ==========================================================================
  // TNI ANNUAL RETURNS — ARTICLE STATISTICS
  // ==========================================================================

  const articleStatistics =
    calculateAnnualReturnsArticleStatistics(
      dataset,
    )

  // ==========================================================================
  // TNI ANNUAL RETURNS — RECENT ARTICLE WINDOW STATISTICS
  // ==========================================================================

  const recentWindowArticleStatistics =
    [3, 5, 10, 20].map(
      (windowYears) =>
        calculateRecentWindowArticleStatistics(
          dataset,
          windowYears,
        ),
    )

  // ==========================================================================
  // TNI S&P 500 RETURNS — SEO METADATA & HISTORICAL CANONICAL URL
  //
  // Preserve the original indexed URL:
  // https://tradingninvestment.com/sp-500-returns/
  // ==========================================================================

  useEffect(() => {
    const seoTitle =
      config.seo.title

    const seoDescription =
      buildAnnualReturnsSeoDescription(
        config,
        availablePeriodYears,
      )

    const pageHeadline =
      buildAnnualReturnsHeadline(
        config,
      )

    const canonicalUrl =
      `https://tradingninvestment.com${config.canonicalPath}`

    const authorUrl =
      'https://tradingninvestment.com/about/'

    const socialImageUrl =
      config.seo.socialImage
        ? 'https://tradingninvestment.com' +
          config.seo.socialImage
        : null

    document.title = seoTitle

    // ========================================================================
    // TNI SEO — META DESCRIPTION
    // ========================================================================

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

    // ========================================================================
    // TNI SEO — SOCIAL / OPEN GRAPH METADATA
    // ========================================================================

    const setMetaContent = (
      selector: string,
      attributeName: string,
      attributeValue: string,
      content: string,
    ) => {
      let element =
        document.querySelector<HTMLMetaElement>(
          selector,
        )

      if (!element) {
        element =
          document.createElement("meta")

        element.setAttribute(
          attributeName,
          attributeValue,
        )

        document.head.appendChild(
          element,
        )
      }

      element.content =
        content
    }

    const removeMetaContent = (
      selector: string,
    ) => {
      document
        .querySelector(selector)
        ?.remove()
    }

    setMetaContent(
      "meta[property=\"og:title\"]",
      "property",
      "og:title",
      config.seo.socialTitle,
    )

    setMetaContent(
      "meta[property=\"og:description\"]",
      "property",
      "og:description",
      config.seo.socialDescription,
    )

    setMetaContent(
      "meta[property=\"og:url\"]",
      "property",
      "og:url",
      canonicalUrl,
    )

    if (socialImageUrl) {
      setMetaContent(
        "meta[property=\"og:image\"]",
        "property",
        "og:image",
        socialImageUrl,
      )
    } else {
      removeMetaContent(
        "meta[property=\"og:image\"]",
      )
    }

    setMetaContent(
      "meta[name=\"twitter:title\"]",
      "name",
      "twitter:title",
      config.seo.socialTitle,
    )

    setMetaContent(
      "meta[name=\"twitter:description\"]",
      "name",
      "twitter:description",
      config.seo.socialDescription,
    )

    if (socialImageUrl) {
      setMetaContent(
        "meta[name=\"twitter:image\"]",
        "name",
        "twitter:image",
        socialImageUrl,
      )
    } else {
      removeMetaContent(
        "meta[name=\"twitter:image\"]",
      )
    }

    // ========================================================================
    // TNI SEO — ROBOTS DIRECTIVE
    // ========================================================================

    let robots =
      document.querySelector<HTMLMetaElement>(
        'meta[name="robots"]',
      )

    if (!robots) {
      robots =
        document.createElement('meta')

      robots.name =
        'robots'

      document.head.appendChild(
        robots,
      )
    }

    robots.content =
      'index, follow, max-image-preview:large'

    // ========================================================================
    // TNI SEO — HISTORICAL CANONICAL URL
    // ========================================================================

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

    // ========================================================================
    // TNI S&P 500 RETURNS — ARTICLE STRUCTURED DATA
    //
    // Reinforces the existing identity relationship:
    // Kamal Khondkar -> Quant Researcher -> TradingNInvestment research.
    // ========================================================================

    const articleSchema = {
      '@context':
        'https://schema.org',
      '@type':
        'Article',
      headline:
        pageHeadline,
      description:
        seoDescription,
      url:
        canonicalUrl,
      mainEntityOfPage: {
        '@type':
          'WebPage',
        '@id':
          canonicalUrl,
      },
      author: {
        '@type':
          'Person',
        name:
          'Kamal Khondkar',
        jobTitle:
          'Quant Researcher',
        url:
          authorUrl,
      },
      publisher: {
        '@type':
          'Organization',
        name:
          'TradingNInvestment',
        url:
          'https://tradingninvestment.com/',
      },
      about: {
        '@type':
          'Thing',
        name:
          `${config.name} Historical Returns`,
      },
      isAccessibleForFree:
        true,
    }

    let articleSchemaElement =
      document.querySelector<HTMLScriptElement>(
        '#' + articleSchemaId,
      )

    if (!articleSchemaElement) {
      articleSchemaElement =
        document.createElement(
          'script',
        )

      articleSchemaElement.id =
        articleSchemaId

      articleSchemaElement.type =
        'application/ld+json'

      document.head.appendChild(
        articleSchemaElement,
      )
    }

    articleSchemaElement.textContent =
      JSON.stringify(
        articleSchema,
      )

    // ========================================================================
    // TNI S&P 500 RETURNS — DATASET STRUCTURED DATA
    //
    // The underlying market data is sourced separately. TNI is credited for
    // the research organization, calculations, analysis and presentation.
    // No DataDownload block is declared until a public CSV is verified live.
    // ========================================================================

    const datasetSchema = {
      '@context':
        'https://schema.org',
      '@type':
        'Dataset',
      name:
        buildAnnualReturnsDatasetName(
          config,
        ),
      alternateName:
        buildAnnualReturnsDatasetAlternateName(
          config,
        ),
      description:
        buildAnnualReturnsDatasetDescription(
          config,
          availablePeriodYears,
        ),
      url:
        canonicalUrl,
      temporalCoverage:
        `${dataset.summary.start_year}/..`,
      creator: {
        '@type':
          'Person',
        name:
          'Kamal Khondkar',
        jobTitle:
          'Quant Researcher',
        url:
          authorUrl,
      },
      publisher: {
        '@type':
          'Organization',
        name:
          'TradingNInvestment',
        url:
          'https://tradingninvestment.com/',
      },
      variableMeasured: [
        config.returnType,
        'Current year return',
        ...availablePeriodYears.map(
          (years) =>
            years === 1
              ? '1-year return'
              : years + '-year annualized return',
        ),
      ],
      isAccessibleForFree:
        true,
    }

    let datasetSchemaElement =
      document.querySelector<HTMLScriptElement>(
        '#' + datasetSchemaId,
      )

    if (!datasetSchemaElement) {
      datasetSchemaElement =
        document.createElement(
          'script',
        )

      datasetSchemaElement.id =
        datasetSchemaId

      datasetSchemaElement.type =
        'application/ld+json'

      document.head.appendChild(
        datasetSchemaElement,
      )
    }

    datasetSchemaElement.textContent =
      JSON.stringify(
        datasetSchema,
      )
  }, [
    config,
    dataset,
    articleSchemaId,
    datasetSchemaId,
  ])

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
  // TNI RETURN EXPLORER — AVAILABLE RANGE PRESETS
  //
  // Only expose preset horizons that the verified dataset can actually cover.
  // ==========================================================================

  const availableRangePresets =
    [3, 5, 10, 20].filter(
      (years) =>
        maximumYear -
          minimumYear +
          1 >=
        years,
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
  // TNI S&P 500 RETURNS — EVERGREEN PERIOD RETURN STATISTICS
  //
  // These are independent of interactive filters and are calculated from the
  // latest completed calendar years in the verified annual-return dataset.
  // ==========================================================================

  const periodReturns =
    useMemo(
      () =>
        availablePeriodYears
          .map(
            (years) =>
              calculateCompletedPeriodReturn(
                dataset,
                years,
              ),
          )
          .filter(
            (
              result,
            ): result is CompletedPeriodReturn =>
              result !== null,
          ),
      [],
    )

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
            {config.intelligenceEyebrow ??
              'TradingNInvestment Research'}
          </div>

          {/* =============================================================
              TNI S&P 500 RETURNS — PRIMARY RESEARCH HEADLINE
              Dedicated typography prevents multi-line headline overlap.
          ============================================================= */}
          <h1 className="tni-sp500-research-title">
            {buildAnnualReturnsHeadline(
              config,
            )}
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
            Explore {config.name} returns by year from{' '}
            {config.startYear} to present.
            Analyze the current-year return,{' '}
            {buildAvailablePeriodReturnsLabel(
              periodReturns.map(
                (period) => period.years,
              ),
            ).toLowerCase()} returns, average historical returns, positive and
            negative market years, and long-term market performance using the
            interactive research explorer.
          </p>

          {/* =============================================================
              TNI S&P 500 RESEARCH — VISIBLE AUTHORSHIP & ENTITY SIGNAL

              Keeps the visible page consistent with Article/Dataset schema.
          ============================================================= */}
          <p
            style={{
              margin: '12px 0 0',
              color: '#6b7b90',
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            Research &amp; Analysis by{' '}
            <a
              href="/about/"
              rel="author"
              style={{
                color: '#10233f',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Kamal Khondkar
            </a>{' '}
            • Quant Researcher • TradingNInvestment
          </p>
        </section>

        {/* =================================================================
            TNI S&P 500 RETURNS — EVERGREEN CRAWLABLE HISTORICAL STATISTICS
            Full-history metrics remain independent of interactive filters.
        ================================================================= */}

        <section
          aria-labelledby={historicalStatisticsId}
          style={{
            marginBottom: '34px',
          }}
        >
          <h2
            id={historicalStatisticsId}
            style={{
              margin: '0 0 8px',
              color: '#10233f',
              fontSize: '24px',
              letterSpacing: '-0.02em',
            }}
          >
            {config.name} Historical Return Statistics
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
            Historical {config.name} annual price-return
            statistics from {dataset.summary.start_year} to present, with the
            current year reported separately as year-to-date.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            <StatCard
              label="Historical Coverage"
              value={`${dataset.summary.start_year} to Present`}
              detail="Latest verified market data"
            />

            <StatCard
              label="Average Annual Return"
              value={formatReturn(
                dataset.summary
                  .average_annual_return_pct,
              )}
              detail="Completed calendar years"
            />

            <StatCard
              label="Median Annual Return"
              value={formatReturn(
                dataset.summary
                  .median_annual_return_pct,
              )}
              detail="Completed calendar years"
            />

            <StatCard
              label="Positive / Non-Negative Years"
              value={`${dataset.summary.positive_years}`}
              detail={`${dataset.summary.positive_year_pct.toFixed(
                2,
              )}% of completed years`}
            />

            <StatCard
              label="Negative Years"
              value={`${dataset.summary.negative_years}`}
              detail={`${dataset.summary.negative_year_pct.toFixed(
                2,
              )}% of completed years`}
            />

            <StatCard
              label="Best Year"
              value={formatReturn(
                dataset.summary
                  .best_year
                  .return_pct,
              )}
              detail={`${dataset.summary.best_year.year}`}
            />

            <StatCard
              label="Worst Year"
              value={formatReturn(
                dataset.summary
                  .worst_year
                  .return_pct,
              )}
              detail={`${dataset.summary.worst_year.year}`}
            />

            <StatCard
              label="Current Year Return"
              value={formatReturn(
                dataset.current_year
                  .return_pct,
              )}
              detail={`${dataset.current_year.label} • YTD`}
            />
          </div>
        </section>

        {/* =================================================================
            TNI S&P 500 RETURNS — 1Y / 3Y / 5Y / 10Y / 20Y RETURNS
            Compounded from the latest completed calendar-year observations.
        ================================================================= */}

        <section
          aria-labelledby={periodReturnsId}
          style={{
            marginBottom: '34px',
          }}
        >
          <h2
            id={periodReturnsId}
            style={{
              margin: '0 0 8px',
              color: '#10233f',
              fontSize: '24px',
              letterSpacing: '-0.02em',
            }}
          >
            {config.name}{' '}
            {buildAvailablePeriodReturnsLabel(
              periodReturns.map(
                (period) => period.years,
              ),
            )} Returns
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
            Period returns are compounded from the latest completed
            calendar-year {config.name} price returns.
            Multi-year cards also show the annualized return for the same
            completed-year period.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {/* ===========================================================
                TNI S&P 500 RETURNS — SEO-FRIENDLY PERIOD RETURN VALUES

                1Y  = cumulative completed-calendar-year return.
                3Y+ = annualized return (CAGR) for easier comparison.
            =========================================================== */}
            {periodReturns.map(
              (period) => {
                const isOneYear =
                  period.years === 1

                const displayedReturn =
                  isOneYear
                    ? period.cumulativeReturnPct
                    : period.annualizedReturnPct

                return (
                  <StatCard
                    key={period.years}
                    label={`${period.years}-Year Return`}
                    value={formatReturn(
                      displayedReturn,
                    )}
                    detail={
                      isOneYear
                        ? `${period.endYear} completed calendar year`
                        : `${period.startYear}–${period.endYear} • Annualized`
                    }
                  />
                )
              },
            )}
          </div>
        </section>

        {/* =================================================================
            TNI RETURN CENTER — RESEARCH VIEW NAVIGATION
        ================================================================= */}

        <nav
          aria-label={`${config.name} return research views`}
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
            {config.name} Annual Price Returns by Year
          </h2>
        </section>

        {/* =================================================================
            TNI STATIC ANNUAL RETURN CHART — SEARCH / SOCIAL VISUAL

            The static chart is generated from the same verified annual-return
            dataset as the interactive research experience. It provides an
            indexable research image while preserving the interactive chart
            below as the primary analytical experience.
        ================================================================= */}

        {config.annualReturnImage && (
          <figure
            style={{
              margin: '0 0 30px',
            }}
          >
            <img
              src={config.annualReturnImage}
              alt={
                config.annualReturnImageAlt ??
                `${config.name} annual stock returns by year`
              }
              width="1200"
              height="630"
              loading="eager"
              decoding="async"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '1px solid #e7edf5',
                background: '#ffffff',
              }}
            />
          </figure>
        )}

        {/* =================================================================
            TNI RETURN EXPLORER — PRODUCT DIFFERENTIATOR
        ================================================================= */}

        <section
          className="tni-return-explorer"
          aria-label={`Explore ${config.name} returns`}
        >
          <div className="tni-return-explorer-header">
            <div>
              <div className="tni-return-explorer-title">
                Explore {config.name} Returns
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

                {availableRangePresets.map(
                  (years) => {
                    const preset =
                      `${years}y` as RangePreset

                    return (
                      <FilterButton
                        key={preset}
                        active={
                          rangePreset ===
                          preset
                        }
                        ariaLabel={
                          `Show ${years} year ${config.name} return period`
                        }
                        onClick={() =>
                          setRangePreset(
                            preset,
                          )
                        }
                      >
                        {years}Y
                      </FilterButton>
                    )
                  },
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
                    aria-label={`${config.name} return start year`}
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
                    aria-label={`${config.name} return end year`}
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
            <figure
              style={{
                margin: 0,
              }}
            >
              <GenericAnnualReturnsChart
                data={
                  filteredData
                }
                config={{
                  id:
                    config.chart.id,

                  title:
                    config.chart.title,

                  subtitle:
                    `Showing ${rangeSummary}. ${config.chart.rangeSubtitleSuffix}`,

                  symbol:
                    config.symbol,

                  metricLabel:
                    config.chart.metricLabel,

                  positiveLabel:
                    config.chart.positiveLabel,

                  negativeLabel:
                    config.chart.negativeLabel,

                  branding: {
                    brandName:
                      "TradingNInvestment",

                    watermarkText:
                      "TradingNInvestment.com | TNI Research",

                    sourceLabel:
                      config.sourceLabel,
                  },

                  showZeroLine: true,
                  showWatermark: true,
                  showSource: true,

                  height:
                    config.chart.height,
                }}
              />

              {/* =========================================================
                  TNI S&P 500 CHART — RESEARCH / PROVENANCE CREDIT
              ========================================================= */}
              <figcaption
                style={{
                  marginTop: '10px',
                  color: '#7a899c',
                  fontSize: '12px',
                  lineHeight: 1.6,
                }}
              >
                TradingNInvestment research visualization. Historical return
                calculations, analysis and presentation by Kamal Khondkar.
                Underlying market data source: {dataset.source}.
              </figcaption>
            </figure>
          ) : (
            <div className="tni-no-filter-results">
              No {config.name} annual returns match this
              filter combination.
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
              Use the TradingNInvestment {config.name} Returns Chart
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
              download the annual-return data as CSV, or use the static
              research visualization subject to the usage terms below.
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
              href={config.embedPath}
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

            {/* =============================================================
                TNI S&P 500 RETURNS — VERIFIED ANNUAL DATA CSV DOWNLOAD
            ============================================================= */}
            <a
              href={config.csvPath}
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '42px',
                padding: '0 16px',
                border: '1px solid #1677ff',
                borderRadius: '9px',
                background: '#ffffff',
                color: '#0b63ce',
                fontSize: '13px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Download {config.name} Annual Returns CSV
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
              {`<iframe src="https://tradingninvestment.com${config.embedPath}" width="100%" height="620" style="border:0;" loading="lazy" title="${config.name} Historical Returns — TradingNInvestment Research"></iframe>`}
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
                {config.name} Annual Returns by Year:{' '}
                {config.startYear} to Present
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
                    {config.returnType}
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
            The current year is reported as year-to-date (YTD). Historical
            figures shown on this page are {config.name} price returns.
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
            Interactive {config.name} Return Statistics
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
            value={`${dataset.summary.start_year} to Present`}
          />

          <InfoCard
            label="Return Type"
            value={config.returnType}
          />

          <InfoCard
            label="Data Source"
            value={config.sourceLabel}
          />
        </section>

        {/* =================================================================
            TNI ANNUAL RETURNS — METHODOLOGY & SOURCE
        ================================================================= */}


        {/* ==================================================================
            TNI S&P 500 RETURNS — LONG-FORM HISTORICAL RESEARCH ARTICLE
            Crawlable HTML content for the canonical /sp-500-returns/ page.
        ================================================================== */}
        <GenericAnnualReturnsArticle
          config={config}
          dataset={dataset}
          statistics={articleStatistics}
          recentWindowStatistics={recentWindowArticleStatistics}
        />

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
            Data Source: {config.sourceLabel}. Return Type:{' '}
            {config.returnType}.
          </p>
        </section>

        {/* =================================================================
            TNI ANNUAL RETURNS — LIVE MARKET INTELLIGENCE BRIDGE
            Shows the newest eligible asset-related story when available.
            Falls back to the newest eligible market story.
        ================================================================= */}

        <LatestMarketIntelligence
          preferredSymbols={config.newsSymbols}
          maxStories={1}
        />
      </div>
    </main>
  )
}
