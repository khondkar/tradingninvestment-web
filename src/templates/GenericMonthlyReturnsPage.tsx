import { useEffect, useMemo } from "react"

import type {
  MonthlyReturnsAssetConfig,
  MonthlyReturnsDataset,
  MonthlyReturnStatistic,
} from "../research/monthly-returns/types"

import GenericMonthlyReturnsChart from "./GenericMonthlyReturnsChart"
import GenericMonthlyReturnsHeatmap from "./GenericMonthlyReturnsHeatmap"

import "./MonthlyReturns.css"


interface Props {
  config: MonthlyReturnsAssetConfig
  dataset: MonthlyReturnsDataset
}


function formatReturn(
  value: number,
  digits = 2,
) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`
}


function formatPercent(
  value: number,
) {
  return `${value.toFixed(2)}%`
}


function flatCount(
  row: MonthlyReturnStatistic,
) {
  return Math.max(
    0,
    row.observations -
      row.positive_count -
      row.negative_count,
  )
}


export default function GenericMonthlyReturnsPage({
  config,
  dataset,
}: Props) {

  // ==========================================================================
  // SEO
  // ==========================================================================

  useEffect(() => {

    document.title =
      config.seo.title

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
      config.seo.description,
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

    canonical.setAttribute(
      "href",
      `${window.location.origin}${config.canonicalPath}`,
    )

  }, [config])


  // ==========================================================================
  // DERIVED DATA
  // ==========================================================================

  const statistics =
    useMemo(
      () =>
        [...dataset.month_statistics]
          .sort(
            (a, b) =>
              a.month - b.month,
          ),
      [dataset.month_statistics],
    )


  const currentMonth =
    dataset.current_month


  const currentMonthHistoricalStats =
    useMemo(
      () =>
        currentMonth
          ? statistics.find(
              (row) =>
                row.month ===
                currentMonth.month,
            ) ?? null
          : null,
      [currentMonth, statistics],
    )


  const completedObservationCount =
    useMemo(
      () =>
        statistics.reduce(
          (total, row) =>
            total +
            row.observations,
          0,
        ),
      [statistics],
    )


  // ==========================================================================
  // PAGE
  // ==========================================================================

  return (
    <main className="tni-monthly-page">

      {/* ====================================================================
          BREADCRUMB
      ==================================================================== */}

      <nav
        className="tni-monthly-breadcrumb"
        aria-label="Breadcrumb"
      >
        <a href="/">
          Research
        </a>

        <span>→</span>

        <a href="/sp-500-returns/">
          {config.shortName}
        </a>

        <span>→</span>

        <strong>
          Monthly Returns
        </strong>
      </nav>


      {/* ====================================================================
          HERO
      ==================================================================== */}

      <header className="tni-monthly-hero">

        <div className="tni-monthly-eyebrow">
          {config.shortName.toUpperCase()} RESEARCH
        </div>

        <h1>
          {config.name} Monthly Returns
        </h1>

        <p className="tni-monthly-lead">
          Historical {config.name} monthly price
          returns from {config.startYear} to present,
          including seasonal patterns, positive and
          negative month frequency, and current-month
          performance.
        </p>

        <div className="tni-monthly-research-nav">
          <a href="/sp-500-returns/">
            Annual Returns
          </a>

          <span className="active">
            Monthly Returns
          </span>
        </div>

      </header>


      {/* ====================================================================
          CURRENT MONTH
      ==================================================================== */}

      {currentMonth && (
        <section
          className="tni-current-month-card"
          aria-label="Current month return"
        >
          <div>
            <span className="tni-card-label">
              CURRENT MONTH
            </span>

            <h2>
              {currentMonth.label}
            </h2>

            <p>
              Through {
                currentMonth.through_date
              }
            </p>
          </div>

          <strong
            className={
              currentMonth.return_pct >= 0
                ? "tni-value-positive"
                : "tni-value-negative"
            }
          >
            {formatReturn(
              currentMonth.return_pct,
            )}
          </strong>

          {currentMonthHistoricalStats && (
            <div className="tni-current-month-history">
              <div>
                <span>
                  Historical {
                    currentMonth.month_name
                  } Average
                </span>

                <strong
                  className={
                    currentMonthHistoricalStats
                      .average_return_pct >= 0
                      ? "tni-value-positive"
                      : "tni-value-negative"
                  }
                >
                  {formatReturn(
                    currentMonthHistoricalStats
                      .average_return_pct,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Historically Positive
                </span>

                <strong className="tni-value-positive">
                  {formatPercent(
                    currentMonthHistoricalStats
                      .positive_pct,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Historically Negative
                </span>

                <strong className="tni-value-negative">
                  {formatPercent(
                    currentMonthHistoricalStats
                      .negative_pct,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Historical Observations
                </span>

                <strong>
                  {
                    currentMonthHistoricalStats
                      .observations
                  }
                </strong>
              </div>
            </div>
          )}
        </section>
      )}


      {/* ====================================================================
          PATTERN LEADERS
      ==================================================================== */}

      <section className="tni-monthly-pattern-section">

        <div className="tni-monthly-section-header">
          <div>
            <div className="tni-monthly-section-kicker">
              HISTORICAL MONTHLY PATTERNS
            </div>

            <h2>
              Which Months Have Historically
              Been Strongest and Weakest?
            </h2>

            <p>
              Frequency and average-return
              statistics use completed calendar
              months only. The current partial
              month is excluded.
            </p>
          </div>
        </div>


        <div className="tni-monthly-pattern-grid">

          <article className="tni-pattern-card">
            <span>
              MOST CONSISTENTLY POSITIVE
            </span>

            <h3>
              {
                dataset.leaders
                  .highest_positive_frequency
                  .month_name
              }
            </h3>

            <strong className="tni-value-positive">
              {formatPercent(
                dataset.leaders
                  .highest_positive_frequency
                  .positive_pct ?? 0,
              )}
            </strong>

            <p>
              Positive historical months
            </p>
          </article>


          <article className="tni-pattern-card">
            <span>
              MOST CONSISTENTLY NEGATIVE
            </span>

            <h3>
              {
                dataset.leaders
                  .highest_negative_frequency
                  .month_name
              }
            </h3>

            <strong className="tni-value-negative">
              {formatPercent(
                dataset.leaders
                  .highest_negative_frequency
                  .negative_pct ?? 0,
              )}
            </strong>

            <p>
              Negative historical months
            </p>
          </article>


          <article className="tni-pattern-card">
            <span>
              HIGHEST AVERAGE RETURN
            </span>

            <h3>
              {
                dataset.leaders
                  .highest_average_return
                  .month_name
              }
            </h3>

            <strong className="tni-value-positive">
              {formatReturn(
                dataset.leaders
                  .highest_average_return
                  .average_return_pct,
              )}
            </strong>

            <p>
              Historical monthly average
            </p>
          </article>


          <article className="tni-pattern-card">
            <span>
              LOWEST AVERAGE RETURN
            </span>

            <h3>
              {
                dataset.leaders
                  .lowest_average_return
                  .month_name
              }
            </h3>

            <strong className="tni-value-negative">
              {formatReturn(
                dataset.leaders
                  .lowest_average_return
                  .average_return_pct,
              )}
            </strong>

            <p>
              Historical monthly average
            </p>
          </article>

        </div>
      </section>


      {/* ====================================================================
          AVERAGE RETURN CHART
      ==================================================================== */}

      <GenericMonthlyReturnsChart
        statistics={statistics}
        name={config.name}
      />


      {/* ====================================================================
          JANUARY–DECEMBER STATISTICS
      ==================================================================== */}

      <section className="tni-monthly-statistics">

        <div className="tni-monthly-section-header">
          <div>
            <div className="tni-monthly-section-kicker">
              MONTHLY STATISTICS
            </div>

            <h2>
              {config.name} Returns by Month
            </h2>

            <p>
              Positive frequency, negative
              frequency and historical return
              characteristics for each calendar
              month.
            </p>
          </div>
        </div>


        <div className="tni-monthly-table-scroll">
          <table className="tni-monthly-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Observations</th>
                <th>Positive</th>
                <th>Negative</th>
                <th>Flat</th>
                <th>Positive %</th>
                <th>Negative %</th>
                <th>Average</th>
                <th>Median</th>
              </tr>
            </thead>

            <tbody>
              {statistics.map(
                (row) => (
                  <tr key={row.month}>
                    <th>
                      {row.month_name}
                    </th>

                    <td>
                      {row.observations}
                    </td>

                    <td>
                      {row.positive_count}
                    </td>

                    <td>
                      {row.negative_count}
                    </td>

                    <td>
                      {flatCount(row)}
                    </td>

                    <td className="tni-value-positive">
                      {formatPercent(
                        row.positive_pct,
                      )}
                    </td>

                    <td className="tni-value-negative">
                      {formatPercent(
                        row.negative_pct,
                      )}
                    </td>

                    <td
                      className={
                        row.average_return_pct >= 0
                          ? "tni-value-positive"
                          : "tni-value-negative"
                      }
                    >
                      {formatReturn(
                        row.average_return_pct,
                      )}
                    </td>

                    <td
                      className={
                        row.median_return_pct >= 0
                          ? "tni-value-positive"
                          : "tni-value-negative"
                      }
                    >
                      {formatReturn(
                        row.median_return_pct,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

      </section>


      {/* ====================================================================
          COMPLETE MONTHLY HISTORY
      ==================================================================== */}

      <GenericMonthlyReturnsHeatmap
        data={dataset.data}
        name={config.name}
      />


      {/* ====================================================================
          METHODOLOGY
      ==================================================================== */}

      
      {config.symbol === '^GSPC' && (
        <section
          className="monthly-seo-content"
          aria-labelledby="sp500-monthly-history-heading"
        >
          <h2 id="sp500-monthly-history-heading">
            S&amp;P 500 Monthly Returns, History and Performance
          </h2>

          <p>
            Explore S&amp;P 500 returns and stock market returns
            from 1928 to the present. This historical S&amp;P 500
            chart and data set shows S&amp;P 500 history by month
            and year, including the S&amp;P 500 average return for
            each calendar month, monthly stock market returns,
            positive and negative return frequency, SPX performance,
            and current month-to-date performance. The interactive
            S&amp;P 500 chart and research tools make it possible
            to compare long-term market behavior across decades and
            identify how monthly performance has changed through
            different market cycles.
          </p>

          <p>
            The historical data also provides detailed SPX monthly
            data for studying seasonality, the best and worst months
            for the S&amp;P 500, average monthly return percentages,
            and long-term stock market returns and performance
            history. Investors researching SPY historical data or
            index fund returns can use S&amp;P 500 index history as
            related benchmark research, although the calculations on
            this page represent the S&amp;P 500 index itself rather
            than SPY ETF returns. Annual performance is available
            separately in TNI's S&amp;P 500 annual returns research.
          </p>
        </section>
      )}

      <section className="tni-monthly-methodology">

        <div className="tni-monthly-section-kicker">
          METHODOLOGY
        </div>

        <h2>
          How Monthly Returns Are Calculated
        </h2>

        <p>
          Monthly price return is calculated
          using the final trading-day closing
          price of each calendar month relative
          to the final trading-day closing price
          of the previous month. Dividends are
          excluded.
        </p>

        <p>
          Historical month statistics use
          completed calendar months only.
          An incomplete current month is shown
          separately as month-to-date and does
          not affect the historical frequency
          calculations.
        </p>

        <div className="tni-monthly-source">
          <strong>Source:</strong>{" "}
          {config.sourceLabel}
        </div>

        <div className="tni-monthly-observation-note">
          {completedObservationCount.toLocaleString()}
          {" "}completed month observations
          represented across the January–December
          statistics.
        </div>

      </section>


      {/* ====================================================================
          RELATED RESEARCH
      ==================================================================== */}

      <section className="tni-monthly-related">

        <div>
          <div className="tni-monthly-section-kicker">
            RELATED RESEARCH
          </div>

          <h2>
            Continue Exploring {config.shortName}
          </h2>
        </div>

        <a
          href="/sp-500-returns/"
          className="tni-monthly-related-link"
        >
          {config.shortName} Annual Returns
          <span>→</span>
        </a>

      </section>

    </main>
  )
}
