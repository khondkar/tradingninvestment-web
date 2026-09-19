// ============================================================================
// TNI S&P 500 DRAWDOWNS & STOCK MARKET CORRECTIONS
//
// Legacy research URL:
// /stock-market-correction-myth-and-reality/
//
// Research methodology:
// - Daily S&P 500 closing prices
// - Drawdown measured from prior closing high
// - Correction threshold: 10%
// - Bear-market threshold: 20%
// - Independent episode remains open until the prior closing high is recovered
// ============================================================================

import {
  useEffect,
  useState,
} from "react"

import ResearchShareButtons from "../components/research/ResearchShareButtons"
import SP500DrawdownChart from "../components/charts/SP500DrawdownChart"

import type {
  TNIDrawdownDataset,
} from "../charts/tni/renderDrawdownChart"

import "./SP500DrawdownsPage.css"


function formatPercent(
  value: number,
  digits = 2,
) {
  return `${value.toFixed(digits)}%`
}


function formatInteger(
  value: number,
) {
  return Math.round(
    value,
  ).toLocaleString()
}


function formatResearchDate(
  value: string | null,
) {
  if (!value) {
    return "Not recovered"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
  ).format(
    new Date(`${value}T00:00:00Z`),
  )
}


export default function SP500DrawdownsPage() {

  const [dataset, setDataset] =
    useState<TNIDrawdownDataset | null>(null)

  const [dataError, setDataError] =
    useState<string | null>(null)


  // ==========================================================================
  // RESEARCH DATA — LOADED ONLY ON THIS PAGE
  // ==========================================================================

  useEffect(() => {
    const controller = new AbortController()

    async function loadResearchData() {
      try {
        const response = await fetch(
          "/data/research/sp500-drawdowns.json",
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          throw new Error(
            `Drawdown data request failed: ${response.status}`,
          )
        }

        const data =
          await response.json() as TNIDrawdownDataset

        setDataset(data)
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return
        }

        console.error(
          "TNI DRAWDOWN DATA ERROR:",
          error,
        )

        setDataError(
          "Historical drawdown research is temporarily unavailable.",
        )
      }
    }

    loadResearchData()

    return () => {
      controller.abort()
    }
  }, [])


  // ==========================================================================
  // SEO
  // ==========================================================================

  useEffect(() => {

    document.title =
      "Stock Market Corrections: 100 Years of S&P 500 Drawdown History | TNI"

    const descriptionText =
      "Explore nearly 100 years of S&P 500 stock market corrections, bear markets, drawdowns and recoveries using daily historical closing-price data."

    let description =
      document.querySelector(
        'meta[name="description"]',
      )

    if (!description) {
      description =
        document.createElement(
          "meta",
        )

      description.setAttribute(
        "name",
        "description",
      )

      document.head.appendChild(
        description,
      )
    }

    description.setAttribute(
      "content",
      descriptionText,
    )


    let canonical =
      document.querySelector(
        'link[rel="canonical"]',
      )

    if (!canonical) {
      canonical =
        document.createElement(
          "link",
        )

      canonical.setAttribute(
        "rel",
        "canonical",
      )

      document.head.appendChild(
        canonical,
      )
    }

    const canonicalUrl =
      `${window.location.origin}/stock-market-correction-myth-and-reality/`

    const socialImageUrl =
      `${window.location.origin}/images/social/sp500-stock-market-corrections-og.webp`

    canonical.setAttribute(
      "href",
      canonicalUrl,
    )

    const socialMeta = [
      ["property", "og:type", "article"],
      [
        "property",
        "og:title",
        "Stock Market Corrections: 100 Years of S&P 500 Drawdown History",
      ],
      [
        "property",
        "og:description",
        descriptionText,
      ],
      [
        "property",
        "og:url",
        canonicalUrl,
      ],
      [
        "property",
        "og:image",
        socialImageUrl,
      ],
      [
        "property",
        "og:image:width",
        "1200",
      ],
      [
        "property",
        "og:image:height",
        "630",
      ],
      [
        "property",
        "og:image:alt",
        "TNI Research — Stock Market Corrections: 100 Years of S&P 500 Drawdown History",
      ],
      [
        "name",
        "twitter:card",
        "summary_large_image",
      ],
      [
        "name",
        "twitter:title",
        "Stock Market Corrections: 100 Years of S&P 500 Drawdown History",
      ],
      [
        "name",
        "twitter:description",
        descriptionText,
      ],
      [
        "name",
        "twitter:image",
        socialImageUrl,
      ],
    ] as const

    socialMeta.forEach(
      ([attribute, key, value]) => {
        let tag =
          document.querySelector(
            `meta[${attribute}="${key}"]`,
          )

        if (!tag) {
          tag =
            document.createElement("meta")

          tag.setAttribute(
            attribute,
            key,
          )

          document.head.appendChild(tag)
        }

        tag.setAttribute(
          "content",
          value,
        )
      },
    )

  }, [])


  // ==========================================================================
  // DATA AVAILABILITY
  // ==========================================================================

  if (dataError) {
    return (
      <main className="tni-drawdown-page">
        <section className="tni-drawdown-definition">
          <span className="tni-drawdown-section-label">
            TNI HISTORICAL RESEARCH
          </span>

          <h1>
            Stock Market Corrections
          </h1>

          <p>
            {dataError}
          </p>
        </section>
      </main>
    )
  }

  if (!dataset) {
    return (
      <main className="tni-drawdown-page">
        <section className="tni-drawdown-definition">
          <span className="tni-drawdown-section-label">
            TNI HISTORICAL RESEARCH
          </span>

          <h1>
            Stock Market Corrections:
            100 Years of S&amp;P 500
            Drawdown History
          </h1>

          <p>
            Loading historical S&amp;P 500
            drawdown research…
          </p>
        </section>
      </main>
    )
  }


  // ==========================================================================
  // DATA-DERIVED SUMMARY
  // ==========================================================================

  const summary =
    dataset.summary

  const drawdownCount =
    Number(
      summary.drawdowns_10pct_or_more ??
      0,
    )

  const correctionCount =
    Number(
      summary.corrections_10_to_20pct ??
      0,
    )

  const bearMarketCount =
    Number(
      summary.bear_markets_20pct_or_more ??
      0,
    )

  const percentReachingBear =
    Number(
      summary.pct_10pct_drawdowns_reaching_20pct ??
      0,
    )

  const averageYearsBetween10Pct =
    Number(
      summary.average_years_between_10pct_thresholds ??
      0,
    )

  const medianYearsBetween10Pct =
    Number(
      summary.median_years_between_10pct_thresholds ??
      0,
    )

  const averageYearsBetween20Pct =
    Number(
      summary.average_years_between_20pct_thresholds ??
      0,
    )

  const medianYearsBetween20Pct =
    Number(
      summary.median_years_between_20pct_thresholds ??
      0,
    )

  const medianPeakToTrough =
    Number(
      summary.median_calendar_days_peak_to_trough ??
      0,
    )

  const medianRecovery =
    Number(
      summary.median_calendar_days_trough_to_recovery ??
      0,
    )

  const currentDrawdown =
    dataset.current_drawdown
      .drawdown_from_all_time_closing_high_pct

  const correctionThreshold =
    dataset.thresholds.correction_pct

  const bearMarketThreshold =
    dataset.thresholds.bear_market_pct

  const currentMarketClassification =
    currentDrawdown <= -bearMarketThreshold
      ? "Bear Market"
      : currentDrawdown <= -correctionThreshold
        ? "Correction"
        : "Below Correction Threshold"


  // ==========================================================================
  // PAGE
  // ==========================================================================

  return (
    <main className="tni-drawdown-page">

      {/* ====================================================================
          BREADCRUMB
      ==================================================================== */}

      <nav
        className="tni-drawdown-breadcrumb"
        aria-label="Breadcrumb"
      >
        <a href="/">
          Research
        </a>

        <span>→</span>

        <a href="/sp-500-returns/">
          S&amp;P 500
        </a>

        <span>→</span>

        <strong>
          Drawdowns &amp; Corrections
        </strong>
      </nav>


      {/* ====================================================================
          HERO
      ==================================================================== */}

      <header className="tni-drawdown-hero">

        <div className="tni-drawdown-eyebrow">
          S&amp;P 500 RESEARCH
        </div>

        <h1>
          Stock Market Corrections:
          100 Years of S&amp;P 500
          Drawdown History
        </h1>

        <p className="tni-drawdown-lead">
          How often does the stock market fall
          10% or 20%? How deep have historical
          declines become, and how long has the
          S&amp;P 500 taken to recover? This
          research examines daily S&amp;P 500
          closing prices from {
            dataset.range.first_date.slice(
              0,
              4,
            )
          } through {
            dataset.range.last_date
          }.
        </p>


        {/* ==================================================================
            FEATURED RESEARCH IMAGE
        ================================================================== */}

        <figure className="tni-drawdown-featured-image">
          <img
            src="/images/social/sp500-stock-market-corrections-og.webp"
            alt="TNI Research — Stock Market Corrections: 100 Years of S&P 500 Drawdown History"
            width="1200"
            height="630"
            fetchPriority="high"
          />

          <figcaption>
            TNI Research — Nearly 100 years of S&amp;P 500
            corrections, bear markets, and recoveries.
          </figcaption>
        </figure>


        {/* ==================================================================
            S&P 500 RESEARCH CENTER NAVIGATION
        ================================================================== */}

        <nav
          className="tni-drawdown-research-nav"
          aria-label="S&P 500 return research"
        >
          <a href="/sp-500-returns/">
            Annual Returns
          </a>

          <a href="/sp-500-monthly-returns/">
            Monthly Returns
          </a>

          <span
            className="active"
            aria-current="page"
          >
            Drawdowns &amp; Corrections
          </span>
        </nav>

      </header>


      <ResearchShareButtons
        title="Stock Market Corrections: 100 Years of S&P 500 Drawdown History"
        symbol="^GSPC"
        researchType="drawdowns"
      />


      {/* ====================================================================
          RESEARCH DEFINITION
      ==================================================================== */}

      <section className="tni-drawdown-definition">

        <span className="tni-drawdown-section-label">
          TNI HISTORICAL RESEARCH
        </span>

        <h2>
          What Counts as a Stock Market Correction?
        </h2>

        <p>
          In this study, a correction begins when
          the S&amp;P 500 closes at least 10% below
          its previous closing high. A decline of
          20% or more is classified as a bear
          market.
        </p>

        <p>
          TNI treats each decline as one independent
          peak-to-recovery episode. Once an episode
          qualifies as a 10% drawdown, it remains
          open until the index closes back at or
          above its previous peak. This prevents
          multiple days inside the same prolonged
          decline from being counted as separate
          corrections.
        </p>

      </section>


      {/* ====================================================================
          SUMMARY CARDS
      ==================================================================== */}

      <section
        className="tni-drawdown-summary"
        aria-label="Historical drawdown summary"
      >

        <article className="tni-drawdown-stat">
          <span>
            10%+ DRAWDOWNS
          </span>

          <strong>
            {formatInteger(
              drawdownCount,
            )}
          </strong>

          <p>
            Independent peak-to-recovery
            episodes in the historical dataset.
          </p>
        </article>


        <article className="tni-drawdown-stat">
          <span>
            20%+ BEAR MARKETS
          </span>

          <strong>
            {formatInteger(
              bearMarketCount,
            )}
          </strong>

          <p>
            Episodes that ultimately reached
            the 20% bear-market threshold.
          </p>
        </article>


        <article className="tni-drawdown-stat">
          <span>
            REACHED 20%
          </span>

          <strong>
            {formatPercent(
              percentReachingBear,
            )}
          </strong>

          <p>
            Share of 10%+ drawdown episodes
            that ultimately fell at least 20%.
          </p>
        </article>


        <article className="tni-drawdown-stat">
          <span>
            MEDIAN TIME TO TROUGH
          </span>

          <strong>
            {formatInteger(
              medianPeakToTrough,
            )}
            <small>
              days
            </small>
          </strong>

          <p>
            Median calendar time from the
            previous peak to the episode low.
          </p>
        </article>

      </section>


      {/* ====================================================================
          CHART INTRODUCTION
      ==================================================================== */}

      <section className="tni-drawdown-chart-section">

        <div className="tni-drawdown-chart-heading">

          <div>
            <span className="tni-drawdown-section-label">
              INTERACTIVE HISTORY
            </span>

            <h2>
              S&amp;P 500 Drawdowns:{" "}
              {dataset.range.first_date.slice(0, 4)}–
              {dataset.range.last_date.slice(0, 4)}
            </h2>

            <p>
              Decline from the previous all-time
              closing high. Hover on desktop or tap
              on mobile to explore each trading day
              and historical drawdown episode.
            </p>
          </div>


          <div className="tni-current-drawdown">

            <span>
              CURRENT DRAWDOWN
            </span>

            <strong>
              {formatPercent(
                currentDrawdown,
              )}
            </strong>

            <small>
              Through {
                dataset.current_drawdown.date
              }
            </small>

          </div>

        </div>


        <div className="tni-drawdown-chart-shell">
          <SP500DrawdownChart
            dataset={dataset}
          />
        </div>

      </section>


      {/* ====================================================================
          CURRENT DRAWDOWN CLASSIFICATION
      ==================================================================== */}

      <section className="tni-drawdown-current-status">

        <span className="tni-drawdown-section-label">
          CURRENT MARKET CONTEXT
        </span>

        <h2>
          Is This a Stock Market Correction
          or a Bear Market?
        </h2>

        <div className="tni-current-status-grid">

          <div className="tni-current-status-reading">

            <span>
              CURRENT S&amp;P 500 DRAWDOWN
            </span>

            <strong>
              {formatPercent(
                currentDrawdown,
              )}
            </strong>

            <small>
              From the all-time closing high
              through {
                formatResearchDate(
                  dataset.current_drawdown.date,
                )
              }
            </small>

          </div>


          <div className="tni-current-status-classification">

            <span>
              TNI CLASSIFICATION
            </span>

            <strong>
              {currentMarketClassification}
            </strong>

            <small>
              Based on closing-price thresholds
              used throughout this research.
            </small>

          </div>

        </div>


        <p>
          TNI classifies an S&amp;P 500 decline as
          a correction once the index closes {
            Math.abs(
              correctionThreshold,
            )
          }% or more below its previous closing
          high. A decline of {
            Math.abs(
              bearMarketThreshold,
            )
          }% or more is classified as a bear
          market.
        </p>


        <p>
          At the latest observation, the S&amp;P
          500 is {
            formatPercent(
              Math.abs(
                currentDrawdown,
              ),
            )
          } below its all-time closing high of {
            dataset.current_drawdown
              .all_time_closing_high
              .toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )
          }, recorded on {
            formatResearchDate(
              dataset.current_drawdown
                .all_time_closing_high_date,
            )
          }.
        </p>

      </section>


      {/* ====================================================================
          SEPTEMBER 2026 MARKET CONTEXT
      ==================================================================== */}

      <section className="tni-drawdown-2026-context">

        <div className="tni-context-heading-row">
          <div>
            <span className="tni-drawdown-section-label">
              2026 MARKET CONTEXT
            </span>

            <h2>
              Is a Stock Market Correction Coming?
            </h2>
          </div>

          <span className="tni-context-date">
            UPDATED SEPTEMBER 2026
          </span>
        </div>

        <p>
          September has historically been the
          weakest S&amp;P 500 month in TNI&apos;s
          completed-month dataset, with an average
          return of −1.12%. Investor sentiment is
          also unusually pessimistic: the AAII
          Sentiment Survey reported 53.3% bearish
          sentiment for the week ending September
          16, 2026, compared with its 31.5%
          historical average.
        </p>

        <div className="tni-context-signal-grid">

          <article>
            <span>
              SEPTEMBER HISTORICAL AVERAGE
            </span>
            <strong>−1.12%</strong>
            <small>
              Weakest average S&amp;P 500 month in
              TNI&apos;s completed-month dataset.
            </small>
          </article>

          <article>
            <span>
              AAII BEARISH SENTIMENT
            </span>
            <strong>53.3%</strong>
            <small>
              Week ending September 16, 2026.
              Historical average: 31.5%.
            </small>
          </article>

          <article>
            <span>
              CURRENT S&amp;P 500 DRAWDOWN
            </span>
            <strong>
              {formatPercent(currentDrawdown)}
            </strong>
            <small>
              Through {
                formatResearchDate(
                  dataset.current_drawdown.date,
                )
              }.
            </small>
          </article>

        </div>

        <p className="tni-context-caution">
          Seasonal weakness and bearish sentiment
          do not establish that a correction is
          coming. They describe current context,
          not a forecast. TNI therefore compares
          current conditions with observed
          historical drawdowns rather than treating
          either indicator as a prediction.
        </p>


        <div className="tni-crash-2026">

          <span className="tni-drawdown-section-label">
            CRASH RISK IN CONTEXT
          </span>

          <h2>
            Will the Stock Market Crash in 2026?
          </h2>

          <p>
            A stock market crash in 2026 cannot be
            known in advance. Historical drawdowns
            can, however, show how often meaningful
            declines became substantially deeper.
            Under TNI&apos;s closing-price,
            peak-to-full-recovery methodology, the
            S&amp;P 500 recorded {drawdownCount}
            independent declines of at least 10%
            across this historical sample. Of
            those, {bearMarketCount} reached the
            20% bear-market threshold.
          </p>

          <p>
            In other words, {
              formatPercent(
                percentReachingBear,
              )
            } of the 10%+ drawdown episodes in this
            dataset eventually reached 20% or more.
            That historical rate provides context
            for correction risk, but it does not
            predict whether the market will crash
            in 2026 or whether a future correction
            will become a bear market.
          </p>

        </div>

      </section>


      {/* ====================================================================
          FIRST RESEARCH INTERPRETATION
      ==================================================================== */}

      <section className="tni-drawdown-finding">

        <span className="tni-drawdown-section-label">
          WHAT THE HISTORY SHOWS
        </span>

        <h2>
          A 10% Correction Has Not Always
          Become a Bear Market
        </h2>

        <p>
          Using TNI&apos;s closing-price,
          peak-to-full-recovery definition, the
          S&amp;P 500 experienced {
            drawdownCount
          } independent drawdown episodes of 10%
          or more between {
            dataset.range.first_date.slice(
              0,
              4,
            )
          } and {
            dataset.range.last_date.slice(
              0,
              4,
            )
          }. Of those episodes, {
            bearMarketCount
          } reached a decline of at least 20%,
          while {
            correctionCount
          } bottomed before reaching the
          bear-market threshold.
        </p>

        <p>
          That means {
            formatPercent(
              percentReachingBear,
            )
          } of the 10%+ episodes in this dataset
          eventually became 20%+ bear markets.
          Historical frequency does not determine
          what any current decline will do, but it
          provides a measurable baseline for
          comparing corrections with deeper market
          contractions.
        </p>

      </section>


      {/* ====================================================================
          HISTORICAL DRAWDOWN RECORD
      ==================================================================== */}

      <section className="tni-drawdown-history">

        <span className="tni-drawdown-section-label">
          HISTORICAL RECORD
        </span>

        <h2>
          Every S&amp;P 500 Drawdown of 10% or More
        </h2>

        <p>
          The table shows each independent
          peak-to-recovery episode identified by
          the same methodology used in the chart.
          A correction is a decline of at least 10%
          but less than 20%; declines of 20% or
          more are classified as bear markets.
        </p>

        <div className="tni-drawdown-table-wrap">
          <table className="tni-drawdown-table">
            <thead>
              <tr>
                <th>Peak</th>
                <th>Trough</th>
                <th>Max Drawdown</th>
                <th>Type</th>
                <th>Peak to Trough</th>
                <th>Recovery</th>
                <th>Trough to Recovery</th>
              </tr>
            </thead>

            <tbody>
              {dataset.events.map((event) => (
                <tr key={event.event}>
                  <td>
                    {formatResearchDate(
                      event.peak_date,
                    )}
                  </td>

                  <td>
                    {formatResearchDate(
                      event.trough_date,
                    )}
                  </td>

                  <td className="tni-drawdown-table-loss">
                    {formatPercent(
                      event.drawdown_pct,
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        event.classification ===
                        "bear_market"
                          ? "tni-drawdown-type tni-drawdown-type-bear"
                          : "tni-drawdown-type tni-drawdown-type-correction"
                      }
                    >
                      {
                        event.classification ===
                        "bear_market"
                          ? "Bear Market"
                          : "Correction"
                      }
                    </span>
                  </td>

                  <td>
                    {formatInteger(
                      event.calendar_days_peak_to_trough,
                    )}
                  </td>

                  <td>
                    {formatResearchDate(
                      event.recovery_date,
                    )}
                  </td>

                  <td>
                    {
                      event.calendar_days_trough_to_recovery ===
                      null
                        ? "—"
                        : formatInteger(
                            event.calendar_days_trough_to_recovery,
                          )
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>


      {/* ====================================================================
          HISTORICAL FREQUENCY
      ==================================================================== */}

      <section className="tni-drawdown-frequency">

        <span className="tni-drawdown-section-label">
          HISTORICAL FREQUENCY
        </span>

        <h2>
          How Often Does the S&amp;P 500 Fall
          10% or 20%?
        </h2>

        <p>
          Under TNI&apos;s independent
          peak-to-recovery methodology, the
          S&amp;P 500 recorded {formatInteger(drawdownCount)} declines
          of at least 10% across the historical sample.
          The median interval between reaching the
          10% threshold was {medianYearsBetween10Pct.toFixed(2)} years,
          while the average interval was{" "}
          {averageYearsBetween10Pct.toFixed(2)} years.
        </p>

        <p>
          {formatInteger(bearMarketCount)} of those episodes reached
          the 20% bear-market threshold. Among those
          events, the median interval between
          reaching 20% was {medianYearsBetween20Pct.toFixed(2)} years
          and the average interval was{" "}
          {averageYearsBetween20Pct.toFixed(2)} years.
        </p>

        <p>
          These figures describe the spacing of
          historical threshold events; they are
          not a schedule for future corrections.
          Market declines have occurred in
          clusters as well as after long periods
          without a qualifying event.
        </p>

      </section>


      {/* ====================================================================
          DRAWDOWN DURATION
      ==================================================================== */}

      <section className="tni-drawdown-duration">

        <span className="tni-drawdown-section-label">
          DRAWDOWN DURATION
        </span>

        <h2>
          How Long Does a Stock Market
          Correction Last?
        </h2>

        <p>
          There is no fixed duration for an
          S&amp;P 500 correction. Across the
          independent 10%+ drawdown episodes in
          this dataset, the median time from the
          previous market peak to the eventual
          trough was {
            formatInteger(
              Number(
                dataset.summary
                  .median_calendar_days_peak_to_trough,
              ),
            )
          } calendar days. The average was {
            formatInteger(
              Number(
                dataset.summary
                  .average_calendar_days_peak_to_trough,
              ),
            )
          } days.
        </p>

        <div className="tni-duration-grid">

          <article>
            <span>
              MEDIAN PEAK TO TROUGH
            </span>

            <strong>
              {
                formatInteger(
                  Number(
                    dataset.summary
                      .median_calendar_days_peak_to_trough,
                  ),
                )
              }
              <small> days</small>
            </strong>

            <p>
              Typical midpoint of the historical
              time from the previous closing high
              to the episode low.
            </p>
          </article>


          <article>
            <span>
              MEDIAN TOTAL TIME UNDERWATER
            </span>

            <strong>
              {
                formatInteger(
                  Number(
                    dataset.summary
                      .median_total_calendar_days_underwater,
                  ),
                )
              }
              <small> days</small>
            </strong>

            <p>
              Median time from the previous peak
              until that closing high was fully
              recovered.
            </p>
          </article>

        </div>


        <p>
          Peak-to-trough time and total drawdown
          duration are different measures. The
          market can reach its low relatively
          quickly but remain below its previous
          high for much longer. In this study,
          total time underwater runs from the
          original peak through full recovery of
          that closing high.
        </p>

      </section>


      {/* ====================================================================
          FORWARD RETURNS AFTER 10% AND 20% DECLINES
      ==================================================================== */}

      <section className="tni-drawdown-forward">

        <span className="tni-drawdown-section-label">
          WHAT HAPPENED NEXT?
        </span>

        <h2>
          What Happened After the S&amp;P 500
          Fell 10% or 20%?
        </h2>

        <p>
          The table measures subsequent S&amp;P 500
          price returns from the first closing-price
          threshold crossing in each independent
          drawdown episode. Measuring from the
          threshold date rather than the eventual
          market bottom avoids using hindsight to
          choose the starting point.
        </p>

        <div className="tni-forward-table-wrap">
          <table className="tni-forward-table">

            <thead>
              <tr>
                <th rowSpan={2}>
                  Horizon
                </th>

                <th
                  colSpan={3}
                  className="tni-forward-group-10"
                >
                  After First Reaching −10%
                </th>

                <th
                  colSpan={3}
                  className="tni-forward-group-20"
                >
                  After First Reaching −20%
                </th>
              </tr>

              <tr>
                <th>Median Return</th>
                <th>Positive</th>
                <th>N</th>

                <th>Median Return</th>
                <th>Positive</th>
                <th>N</th>
              </tr>
            </thead>

            <tbody>
              {(
                [
                  ["3m", "3 Months"],
                  ["6m", "6 Months"],
                  ["1y", "1 Year"],
                  ["3y", "3 Years"],
                  ["5y", "5 Years"],
                ] as const
              ).map(([key, label]) => {

                const after10 =
                  dataset.forward_returns
                    .after_10pct_decline[key]

                const after20 =
                  dataset.forward_returns
                    .after_20pct_decline[key]

                return (
                  <tr key={key}>

                    <td className="tni-forward-horizon">
                      {label}
                    </td>

                    <td>
                      {after10.median_return_pct === null
                        ? "—"
                        : formatPercent(
                            after10.median_return_pct,
                          )}
                    </td>

                    <td>
                      {after10.positive_pct === null
                        ? "—"
                        : formatPercent(
                            after10.positive_pct,
                          )}
                    </td>

                    <td>
                      {after10.n}
                    </td>

                    <td>
                      {after20.median_return_pct === null
                        ? "—"
                        : formatPercent(
                            after20.median_return_pct,
                          )}
                    </td>

                    <td>
                      {after20.positive_pct === null
                        ? "—"
                        : formatPercent(
                            after20.positive_pct,
                          )}
                    </td>

                    <td>
                      {after20.n}
                    </td>

                  </tr>
                )
              })}
            </tbody>

          </table>
        </div>

        <p className="tni-forward-interpretation">
          Historically, positive outcomes became
          more frequent over several of the longer
          horizons in this sample, but the results
          were not uniformly positive. The number
          of observations also declines at longer
          horizons when the available historical
          record does not yet contain a complete
          forward period.
        </p>

        <p className="tni-forward-methodology">
          Returns are price returns and exclude
          dividends. Each horizon uses the first
          available trading day on or after its
          calendar target date. Historical results
          describe this sample and do not predict
          the outcome of a future market decline.
        </p>

      </section>


      {/* ====================================================================
          RECOVERY CONTEXT
      ==================================================================== */}

      <section className="tni-drawdown-recovery">

        <span className="tni-drawdown-section-label">
          RECOVERY CONTEXT
        </span>

        <h2>
          How Long Have S&amp;P 500
          Recoveries Taken?
        </h2>

        <p>
          Across the independent episodes in this
          dataset, the median time from the market
          trough back to the previous closing high
          was {
            formatInteger(
              medianRecovery,
            )
          } calendar days. The average was {
            formatInteger(
              Number(
                dataset.summary
                  .average_calendar_days_trough_to_recovery,
              ),
            )
          } days, substantially higher because a
          small number of severe historical bear
          markets required much longer recoveries.
        </p>

        <p>
          Recovery times ranged from{" "}
          {
            formatInteger(
              dataset.recovery_extremes.fastest
                .calendar_days_trough_to_recovery,
            )
          } days after the{" "}
          {
            formatResearchDate(
              dataset.recovery_extremes.fastest
                .trough_date,
            )
          } trough to{" "}
          {
            formatInteger(
              dataset.recovery_extremes.longest
                .calendar_days_trough_to_recovery,
            )
          } days after the{" "}
          {
            formatResearchDate(
              dataset.recovery_extremes.longest
                .trough_date,
            )
          } trough. The latter episode did not regain
          its{" "}
          {
            formatResearchDate(
              dataset.recovery_extremes.longest
                .peak_date,
            )
          } closing high until{" "}
          {
            formatResearchDate(
              dataset.recovery_extremes.longest
                .recovery_date,
            )
          }.
        </p>

        <p>
          The wide historical range is important:
          recovery time has not followed a fixed
          timetable. These figures describe past
          S&amp;P 500 closing-price recoveries and
          should not be interpreted as a forecast
          of how quickly a future decline will
          recover.
        </p>

      </section>


      {/* ====================================================================
          METHODOLOGY NOTE
      ==================================================================== */}

      <section className="tni-drawdown-methodology">

        <span className="tni-drawdown-section-label">
          METHODOLOGY
        </span>

        <h2>
          How TNI Calculates Drawdowns
        </h2>

        <p>
          The analysis uses {
            dataset.range.daily_observations.toLocaleString()
          } daily S&amp;P 500 observations from {
            dataset.range.first_date
          } through {
            dataset.range.last_date
          }. Drawdowns are calculated from daily
          closing prices relative to the running
          closing-price high.
        </p>

        <p>
          Dividends are not included. Results can
          differ from studies that use intraday
          highs and lows, total-return indexes,
          different recovery definitions, or count
          multiple sub-declines inside one prolonged
          peak-to-recovery episode.
        </p>

        <div className="tni-drawdown-source">
          <strong>
            Source
          </strong>

          <span>
            {dataset.source}
          </span>
        </div>

      </section>


      {/* ====================================================================
          TNI INTELLIGENCE BRIDGE
      ==================================================================== */}

      <section className="tni-drawdown-intelligence">

        <span className="tni-drawdown-section-label">
          TNI INTELLIGENCE
        </span>

        <h2>
          History Tells You What Happened Before.
          See What Is Happening Now.
        </h2>

        <p>
          Historical drawdown research provides
          context for market corrections and bear
          markets. TNI Intelligence tracks current
          market-moving news and live market
          intelligence as conditions change.
        </p>

        <a
          href="https://tni-frontend.onrender.com/live/news"
          target="_blank"
          rel="noreferrer"
          data-analytics-event="research_to_intelligence_click"
        >
          VIEW TODAY&apos;S MARKET INTELLIGENCE
          <span aria-hidden="true"> →</span>
        </a>

      </section>

    </main>
  )
}
