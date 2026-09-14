// ============================================================================
// ============================================================================
// TNI RESEARCH ARTICLE — GENERIC ANNUAL RETURNS
//
// Purpose:
// - Render reusable annual-return research for stocks and indexes.
// - Use verified annual price-return data.
// - Drive asset names and labels from configuration.
// - Drive years, percentages, counts and statistics from calculations.
// - Avoid asset-specific historical assumptions in the generic template.
// ============================================================================

import type {
  AnnualReturnsCalculationDataset,
} from "../research/annual-returns/calculations"
import type {
  AnnualReturnsAssetConfig,
} from "../research/annual-returns/types"
import type {
  AnnualReturnsArticleStatistics,
  AnnualReturnsRecentWindowStatistics,
} from "../research/annual-returns/articleCalculations"

// ============================================================================
// TNI ANNUAL RETURNS — LONG-FORM ARTICLE PROPS
//
// The article now receives asset identity, verified return data and calculated
// statistics from the shared annual-returns system.
// ============================================================================

export type GenericAnnualReturnsArticleProps = {
  config: AnnualReturnsAssetConfig
  dataset: AnnualReturnsCalculationDataset
  statistics: AnnualReturnsArticleStatistics
  recentWindowStatistics: AnnualReturnsRecentWindowStatistics[]
}

// ============================================================================
// TNI ANNUAL RETURNS — COMPLETE RECENT WINDOW TYPE
// ============================================================================

type CompleteRecentWindowStatistics =
  AnnualReturnsRecentWindowStatistics & {
    averageReturnPct: number
    medianReturnPct: number
    nonNegativeRatePct: number
    negativeRatePct: number
    bestYear: NonNullable<
      AnnualReturnsRecentWindowStatistics["bestYear"]
    >
    worstYear: NonNullable<
      AnnualReturnsRecentWindowStatistics["worstYear"]
    >
  }

// ============================================================================
// TNI ANNUAL RETURNS — COMPLETE RECENT WINDOW TYPE GUARD
// ============================================================================

function isCompleteRecentWindow(
  window: AnnualReturnsRecentWindowStatistics,
): window is CompleteRecentWindowStatistics {
  return (
    window.isCompleteWindow &&
    window.averageReturnPct !== null &&
    window.medianReturnPct !== null &&
    window.nonNegativeRatePct !== null &&
    window.negativeRatePct !== null &&
    window.bestYear !== null &&
    window.worstYear !== null
  )
}

export default function GenericAnnualReturnsArticle(
  {
    config,
    dataset,
    statistics,
    recentWindowStatistics,
  }: GenericAnnualReturnsArticleProps,
) {
  const currentYear =
    dataset.current_year.year

  return (
    <article className="sp500-research-article">

      {/* ==================================================================
          ARTICLE INTRODUCTION
      ================================================================== */}
      <header className="sp500-research-header">
        <span className="sp500-research-eyebrow">
          {config.name.toUpperCase()} HISTORICAL MARKET RESEARCH
        </span>

        <h2>
          {config.name} Historical Returns: What the Available
          Market History Shows
        </h2>

        <p className="sp500-research-lead">
          The history of <strong>{config.name} returns</strong> shows how
          annual performance has varied across the available historical
          record.
        </p>

        <p>
          This <strong>{config.name} yearly returns</strong> database contains{" "}
          {statistics.completedYearCount} completed calendar years from{" "}
          {statistics.completedYears[0].year} through{" "}
          {statistics.completedYears[
            statistics.completedYears.length - 1
          ].year}, plus the current {currentYear} year-to-date observation.
        </p>

        <p>
          Across those {statistics.completedYearCount} completed years, the
          average annual {config.name} price return was{" "}
          <strong>{statistics.averageReturnPct >= 0 ? "+" : ""}{statistics.averageReturnPct.toFixed(2)}%</strong>.
        </p>

        <p>
          The median annual return was{" "}
          <strong>{statistics.medianReturnPct >= 0 ? "+" : ""}{statistics.medianReturnPct.toFixed(2)}%</strong>.
        </p>

        <p>
          Those summary statistics are useful, but the complete{" "}
          <strong>{config.name} annual-return history</strong> provides more
          detail about how yearly performance has varied across the available
          record.
        </p>

        <p>
          Looking at individual annual observations makes it possible to
          compare yearly outcomes using the same verified historical dataset.
        </p>
      </header>

      {/* ==================================================================
          POSITIVE YEAR RESEARCH
      ================================================================== */}
      <section className="sp500-research-section research-positive">
        <span className="research-section-kicker">
          POSITIVE YEAR HISTORY
        </span>

        <h3>
          Positive {config.name} Years: Average Return{" "}
          {statistics.nonNegativeAverageReturnPct === null
            ? "N/A"
            : (statistics.nonNegativeAverageReturnPct >= 0 ? "+" : "") +
              statistics.nonNegativeAverageReturnPct.toFixed(2) +
              "%"}
        </h3>

        <p>
          One of the strongest findings in the historical {config.name} returns
          dataset is the frequency of non-negative calendar years.
        </p>

        <p>
          Of the <strong>{statistics.completedYearCount} completed calendar years</strong>,{" "}
          <strong>{statistics.nonNegativeCount} were non-negative</strong>.
        </p>

        <p>
          That represents{" "}
          <strong>{statistics.nonNegativeRatePct.toFixed(2)}%</strong> of all
          completed years in the historical dataset.
        </p>

        <p>
          In other words, roughly two-thirds of the completed calendar-year
          observations finished at or above where they began.
        </p>

        <p>
          Across those <strong>{statistics.nonNegativeCount} non-negative years</strong>, the average
          annual {config.name} price return was{" "}
          <strong>
            {statistics.nonNegativeAverageReturnPct === null
              ? "N/A"
              : (statistics.nonNegativeAverageReturnPct >= 0 ? "+" : "") +
                statistics.nonNegativeAverageReturnPct.toFixed(2) +
                "%"}
          </strong>.
        </p>

        <p>
          The median return among those non-negative years was{" "}
          <strong>
            {statistics.nonNegativeMedianReturnPct === null
              ? "N/A"
              : (statistics.nonNegativeMedianReturnPct >= 0 ? "+" : "") +
                statistics.nonNegativeMedianReturnPct.toFixed(2) +
                "%"}
          </strong>.
        </p>

        <p>
          That median is useful because it shows that the positive-year
          average was not driven solely by a small number of extraordinary
          market gains.
        </p>

        <h4>
          Strongest Positive {config.name} Year
        </h4>

        <p>
          The strongest completed year in the entire dataset was{" "}
          <strong>{statistics.bestYear.year}</strong>, when the {config.name} price
          return reached{" "}
          <strong>
            {statistics.bestYear.value >= 0 ? "+" : ""}
            {statistics.bestYear.value.toFixed(2)}%
          </strong>.
        </p>

        <p>
          For this research, a zero return is included in the non-negative
          group.
        </p>
      </section>

      {/* ==================================================================
          NEGATIVE YEAR RESEARCH
      ================================================================== */}
      <section className="sp500-research-section research-negative">
        <span className="research-section-kicker">
          NEGATIVE YEAR HISTORY
        </span>

        <h3>
          Negative {config.name} Years: Average Loss{" "}
          {statistics.negativeAverageReturnPct === null
            ? "N/A"
            : statistics.negativeAverageReturnPct.toFixed(2) + "%"}
        </h3>

        <p>
          Negative years tell the other side of {config.name} performance
          history.
        </p>

        <p>
          Across the same {statistics.completedYearCount} completed calendar
          years,{" "}
          <strong>{statistics.negativeCount} years were negative</strong>.
        </p>

        <p>
          That represents{" "}
          <strong>{statistics.negativeRatePct.toFixed(2)}%</strong> of completed
          years.
        </p>

        <p>
          Looking only at those {statistics.negativeCount} negative years, the
          average annual {config.name} price return was{" "}
          <strong>
            {statistics.negativeAverageReturnPct === null
              ? "N/A"
              : statistics.negativeAverageReturnPct.toFixed(2) + "%"}
          </strong>.
        </p>

        <p>
          The median negative-year return was{" "}
          <strong>
            {statistics.negativeMedianReturnPct === null
              ? "N/A"
              : statistics.negativeMedianReturnPct.toFixed(2) + "%"}
          </strong>.
        </p>

        <p>
          These figures show that a negative calendar year historically meant
          considerably more than simply finishing slightly below zero.
        </p>

        <h4>
          Worst {config.name} Year
        </h4>

        <p>
          The worst calendar year in the dataset was{" "}
          <strong>{statistics.worstYear.year}</strong>, when the {config.name}
          price return fell{" "}
          <strong>{statistics.worstYear.value.toFixed(2)}%</strong>.
        </p>

        <p>
          Negative calendar years occurred less frequently than non-negative
          calendar years, but several historical losses were substantial.
        </p>

      </section>

      {/* ==================================================================
          POSITIVE VS NEGATIVE
      ================================================================== */}
      <section className="sp500-research-section research-neutral">
        <span className="research-section-kicker">
          POSITIVE VS. NEGATIVE
        </span>

        <h3>
          What Positive and Negative {config.name} Returns Show Together
        </h3>

        <p>
          Putting both groups together reveals one of the most important
          characteristics of historical <strong>{config.name} returns</strong>.
        </p>

        <p>
          There were{" "}
          <strong>{statistics.nonNegativeCount} non-negative completed years</strong>{" "}
          compared with{" "}
          <strong>{statistics.negativeCount} negative completed years</strong>.
        </p>

        <p>
          The average return during the {statistics.nonNegativeCount} non-negative
          years was{" "}
          <strong>
            {statistics.nonNegativeAverageReturnPct === null
              ? "N/A"
              : (statistics.nonNegativeAverageReturnPct >= 0 ? "+" : "") +
                statistics.nonNegativeAverageReturnPct.toFixed(2) +
                "%"}
          </strong>.
        </p>

        <p>
          The average return during the {statistics.negativeCount} negative
          years was{" "}
          <strong>
            {statistics.negativeAverageReturnPct === null
              ? "N/A"
              : statistics.negativeAverageReturnPct.toFixed(2) + "%"}
          </strong>.
        </p>

        <p>
          Across all {statistics.completedYearCount} completed years together,
          the average annual {config.name} price return was{" "}
          <strong>
            {statistics.averageReturnPct >= 0 ? "+" : ""}
            {statistics.averageReturnPct.toFixed(2)}%
          </strong>.
        </p>

        <p>
          The median annual return across the full historical period was{" "}
          <strong>
            {statistics.medianReturnPct >= 0 ? "+" : ""}
            {statistics.medianReturnPct.toFixed(2)}%
          </strong>.
        </p>

        <p>
          An investor rarely experiences the long-term historical average in
          any particular calendar year.
        </p>

        <p>
          Instead, individual {config.name} annual returns can vary
          substantially around that average.
        </p>

        <p>
          That is one reason the complete{" "}
          <strong>{config.name} historical returns by year</strong> table can be
          more informative than relying on a single long-term number.
        </p>
      </section>

      {/* ==================================================================
          AVERAGE RETURN
      ================================================================== */}
      <section className="sp500-research-section research-neutral">
        <span className="research-section-kicker">
          AVERAGE RETURN
        </span>

        <h3>
          What Does the {config.name} Average Return of{" "}
          {statistics.averageReturnPct >= 0 ? "+" : ""}
          {statistics.averageReturnPct.toFixed(2)}% Mean?
        </h3>

        <p>
          Across the {statistics.completedYearCount} completed calendar years
          in this dataset, the arithmetic{" "}
          <strong>{config.name} average return</strong> was{" "}
          <strong>
            {statistics.averageReturnPct >= 0 ? "+" : ""}
            {statistics.averageReturnPct.toFixed(2)}% per completed calendar year
          </strong>.
        </p>

        <p>
          This is the arithmetic average of the individual annual price
          returns in the historical dataset.
        </p>

        <p>
          It does not mean the market gained exactly{" "}
          {statistics.averageReturnPct.toFixed(2)}% in a typical year.
        </p>

        <p>
          Individual {config.name} yearly returns frequently differed
          substantially from that number.
        </p>

        <p>
          The{" "}
          <strong>
            median annual return of{" "}
            {statistics.medianReturnPct >= 0 ? "+" : ""}
            {statistics.medianReturnPct.toFixed(2)}%
          </strong>{" "}
          provides a second way to evaluate the distribution.
        </p>

        <p>
          Looking at both the average and median gives readers more information
          about historical {config.name} returns than either statistic provides
          by itself.
        </p>

        <p>
          These figures represent <strong>{config.name} price returns</strong>,
          not total returns.
        </p>
      </section>

      {/* ==================================================================
          GENERIC RECENT-WINDOW ANALYSIS
      ================================================================== */}
      {recentWindowStatistics
        .filter(
          isCompleteRecentWindow,
        )
        .map(
          (window) => (
            <section
              key={window.windowYears}
              className="sp500-research-section research-neutral"
            >
              <span className="research-section-kicker">
                RECENT {window.windowYears}-YEAR VIEW
              </span>

              <h3>
                {config.name} {window.windowYears}-Year Return View
              </h3>

              <p>
                The current{" "}
                <strong>
                  {config.name} {window.windowYears}-year return
                </strong>{" "}
                view covers{" "}
                <strong>
                  {window.displayStartYear} through{" "}
                  {window.displayEndYear} YTD
                </strong>.
              </p>

              <p>
                Within that window, there are{" "}
                <strong>
                  {window.completedYearCount} completed calendar{" "}
                  {window.completedYearCount === 1 ? "year" : "years"}
                </strong>.
              </p>

              <p>
                The average annual price return across those completed years was{" "}
                <strong>
                  {window.averageReturnPct >= 0 ? "+" : ""}
                  {window.averageReturnPct.toFixed(2)}%
                </strong>.
              </p>

              <p>
                The median annual return was{" "}
                <strong>
                  {window.medianReturnPct >= 0 ? "+" : ""}
                  {window.medianReturnPct.toFixed(2)}%
                </strong>.
              </p>

              <p>
                {window.nonNegativeCount} of the{" "}
                {window.completedYearCount} completed years were non-negative,
                representing{" "}
                <strong>
                  {window.nonNegativeRatePct.toFixed(2)}%
                </strong>{" "}
                of completed observations.
              </p>

              <p>
                {window.negativeCount} completed{" "}
                {window.negativeCount === 1 ? "year was" : "years were"} negative,
                representing{" "}
                <strong>
                  {window.negativeRatePct.toFixed(2)}%
                </strong>.
              </p>

              <p>
                The strongest completed year in the period was{" "}
                <strong>
                  {window.bestYear.year} at{" "}
                  {window.bestYear.value >= 0 ? "+" : ""}
                  {window.bestYear.value.toFixed(2)}%
                </strong>.
              </p>

              <p>
                The weakest completed year was{" "}
                <strong>
                  {window.worstYear.year} at{" "}
                  {window.worstYear.value >= 0 ? "+" : ""}
                  {window.worstYear.value.toFixed(2)}%
                </strong>.
              </p>

              <p>
                The current{" "}
                <strong>
                  {dataset.current_year.label} return of{" "}
                  {dataset.current_year.return_pct >= 0 ? "+" : ""}
                  {dataset.current_year.return_pct.toFixed(2)}%
                </strong>{" "}
                remains separate from those completed-year statistics.
              </p>

              <h4>
                {window.windowYears}-Year Average Return Is Not the Same as{" "}
                {window.windowYears}-Year CAGR
              </h4>

              <p>
                The{" "}
                <strong>
                  {window.averageReturnPct >= 0 ? "+" : ""}
                  {window.averageReturnPct.toFixed(2)}%
                </strong>{" "}
                figure is the arithmetic average of the completed annual price
                returns in this display window. It should not be described as a{" "}
                {window.windowYears}-year cumulative return or compound annual
                growth rate.
              </p>

              <p>
                A true {window.windowYears}-year cumulative return or CAGR
                requires a different calculation.
              </p>

              <p>
                This completed-year sample can be compared with the full{" "}
                {statistics.completedYearCount}-year historical record when
                interpreting recent-period results.
              </p>
            </section>
          ),
        )}

      {/* ==================================================================
          BEST AND WORST YEARS
      ================================================================== */}
      <section className="sp500-research-section research-neutral">
        <span className="research-section-kicker">
          MARKET EXTREMES
        </span>

        <h3>
          Best and Worst {config.name} Annual Returns
        </h3>

        <p>
          The strongest calendar-year price return in the dataset occurred in{" "}
          <strong>
            {statistics.bestYear.year} at{" "}
            {statistics.bestYear.value >= 0 ? "+" : ""}
            {statistics.bestYear.value.toFixed(2)}%
          </strong>.
        </p>

        <p>
          The worst annual price return occurred in{" "}
          <strong>
            {statistics.worstYear.year} at{" "}
            {statistics.worstYear.value >= 0 ? "+" : ""}
            {statistics.worstYear.value.toFixed(2)}%
          </strong>.
        </p>

        <p>
          These extremes are far removed from the full-dataset {config.name}{" "}
          average return of{" "}
          {statistics.averageReturnPct >= 0 ? "+" : ""}
          {statistics.averageReturnPct.toFixed(2)}%.
        </p>

      </section>

      {/* ==================================================================
          PRICE RETURN VS TOTAL RETURN
      ================================================================== */}
      <section className="sp500-research-section research-neutral">
        <span className="research-section-kicker">
          RETURN METHODOLOGY
        </span>

        <h3>
          {config.name} Price Return vs. Total Return
        </h3>

        <p>
          Understanding the type of return used on this page is essential.
        </p>

        <p>
          The historical figures presented here are{" "}
          <strong>{config.name} price returns</strong>.
        </p>

        <p>
          Price return measures the change in the market price of the asset
          between periods.
        </p>

        <p>
          The figures on this page <strong>do not include dividends</strong>.
        </p>

        <p>
          Therefore, these results should not be interpreted as{" "}
          <strong>{config.name} total returns</strong>.
        </p>

        <p>
          A total-return series would incorporate dividends or other
          distributions according to the methodology of that series.
        </p>

        <p>
          The chart, historical table, filters, and statistics on this page
          represent {config.name} price performance only.
        </p>
      </section>

      {/* ==================================================================
          CURRENT YEAR YTD
      ================================================================== */}
      <section className="sp500-research-section research-neutral">
        <span className="research-section-kicker">
          {dataset.current_year.year} MARKET RETURN
        </span>

        <h3>
          {config.name} Return {dataset.current_year.label}
        </h3>

        <p>
          The current dataset shows the{" "}
          <strong>
            {config.name} return for {dataset.current_year.year} at{" "}
            {dataset.current_year.return_pct >= 0 ? "+" : ""}
            {dataset.current_year.return_pct.toFixed(2)}% YTD
          </strong>.
        </p>

        <p>
          Unlike the completed historical calendar-year observations,{" "}
          {dataset.current_year.year} is still in progress.
        </p>

        <p>
          TradingNInvestment therefore displays the{" "}
          {dataset.current_year.label} return separately.
        </p>

        <p>
          It is excluded from calculations such as the historical average,
          median, best completed year, and worst completed year.
        </p>

        <p>
          This prevents a partial-year observation from being treated as
          though it were directly comparable with a completed calendar year.
        </p>

        <p>
          The {dataset.current_year.label} result can change when the
          underlying verified market data is updated.
        </p>
      </section>

      {/* ==================================================================
          MEDIAN RETURN
      ================================================================== */}
      <section className="sp500-research-section research-neutral">
        <span className="research-section-kicker">
          STATISTICAL CONTEXT
        </span>

        <h3>
          Why the Median {config.name} Annual Return Matters
        </h3>

        <p>
          Average return is one of the most commonly quoted historical stock
          market statistics.
        </p>

        <p>
          But the median provides useful additional information.
        </p>

        <p>
          Across the {statistics.completedYearCount} completed years, the
          median annual {config.name} price return was{" "}
          <strong>
            {statistics.medianReturnPct >= 0 ? "+" : ""}
            {statistics.medianReturnPct.toFixed(2)}%
          </strong>, compared with an average of{" "}
          <strong>
            {statistics.averageReturnPct >= 0 ? "+" : ""}
            {statistics.averageReturnPct.toFixed(2)}%
          </strong>.
        </p>

        <p>
          The difference indicates that the distribution of historical annual
          returns is not perfectly symmetrical.
        </p>

        <p>
          Large negative years can pull the arithmetic average downward.
        </p>

        <p>
          Average, median, positive-year frequency, negative-year frequency,
          best year, and worst year together provide a more complete view of
          historical {config.name} returns.
        </p>

        <p>
          No single statistic captures the entire history.
        </p>
      </section>

      {/* ==================================================================
          HISTORICAL FREQUENCY
      ================================================================== */}
      <section className="sp500-research-section research-positive">
        <span className="research-section-kicker">
          HISTORICAL FREQUENCY
        </span>

        <h3>
          How Often Have {config.name} Returns Been Positive?
        </h3>

        <p>
          The dataset contains{" "}
          <strong>
            {statistics.nonNegativeCount} non-negative years out of{" "}
            {statistics.completedYearCount} completed years
          </strong>.
        </p>

        <p>
          That corresponds to{" "}
          <strong>{statistics.nonNegativeRatePct.toFixed(2)}%</strong> of
          completed calendar years.
        </p>

        <p>
          This is a historical frequency, not a probability forecast.
        </p>

        <p>
          It would be incorrect to say that {config.name} has a{" "}
          {statistics.nonNegativeRatePct.toFixed(2)}% probability of rising
          next year simply because{" "}
          {statistics.nonNegativeRatePct.toFixed(2)}% of these historical
          observations were non-negative.
        </p>

        <p>
          Future market conditions can differ substantially from historical
          conditions.
        </p>

        <p>
          The statistic describes what occurred across the observed period,
          not what must happen in the future.
        </p>
      </section>

      {/* ==================================================================
          WHY HISTORICAL RETURNS MATTER
      ================================================================== */}
      <section className="sp500-research-section research-neutral">
        <span className="research-section-kicker">
          HISTORICAL CONTEXT
        </span>

        <h3>
          Why Study Historical {config.name} Returns?
        </h3>

        <p>
          Historical {config.name} returns provide context that recent
          performance alone cannot provide.
        </p>

        <p>
          A large gain or decline can appear unusual when viewed only against
          the most recent observations.
        </p>

        <p>
          Comparing the current period with the available historical
          distribution helps show how it relates to earlier outcomes.
        </p>

        <p>
          Historical returns can help investors, researchers, students, and
          analysts examine how annual performance has varied through the
          available record.
        </p>

        <p>
          They can also reduce the tendency to use only recent performance as
          the reference point for evaluating the current year.
        </p>
      </section>

      {/* ==================================================================
          RETURN EXPLORER
      ================================================================== */}
      <section className="sp500-research-section research-neutral">
        <span className="research-section-kicker">
          INTERACTIVE RESEARCH
        </span>

        <h3>
          How to Use the {config.name} Return Explorer
        </h3>

        <p>
          The TradingNInvestment Return Explorer is designed to make historical
          {config.name} returns easier to investigate.
        </p>

        <p>
          Instead of presenting only a static chart, the tool allows readers
          to filter the same verified annual-return dataset.
        </p>

        <p>
          Readers can examine all available years, non-negative years,
          negative years, and available historical periods.
        </p>

        <p>
          The chart, annual-returns table, and summary statistics update from
          the same selected data.
        </p>

        {statistics.negativeCount > 0 && (
          <p>
            Readers interested in downside history can examine the{" "}
            <strong>
              {statistics.negativeCount} negative calendar{" "}
              {statistics.negativeCount === 1 ? "year" : "years"}
            </strong>{" "}
            in the completed-year dataset.
          </p>
        )}

        {statistics.nonNegativeCount > 0 && (
          <p>
            Readers studying non-negative historical performance can examine
            the{" "}
            <strong>
              {statistics.nonNegativeCount} non-negative calendar{" "}
              {statistics.nonNegativeCount === 1 ? "year" : "years"}
            </strong>{" "}
            in the completed-year dataset.
          </p>
        )}

        <p>
          When sufficient history is available, readers can also use the
          available period views to focus on more recent performance.
        </p>

        <p>
          The purpose is not to predict the next {config.name} return, but to
          make the available historical observations easier to explore and
          understand.
        </p>
      </section>

      {/* ==================================================================
          PERIOD SELECTION
      ================================================================== */}
      <section className="sp500-research-section research-neutral">
        <span className="research-section-kicker">
          PERIOD SELECTION
        </span>

        <h3>
          Reading {config.name} Performance History in Context
        </h3>

        <p>
          One of the biggest risks when studying historical returns is
          selecting a period that confirms an existing belief.
        </p>

        <p>
          A short period can appear exceptionally strong or exceptionally weak
          depending on its starting and ending years.
        </p>

        <p>
          Using the broader available {config.name} history provides additional
          context for interpreting shorter periods.
        </p>

        <p>
          Different historical windows can produce different average returns,
          frequencies of positive and negative years, and extreme outcomes.
        </p>

        <p>
          None of those periods is inherently the single correct measure of
          historical performance. They answer different questions about
          different parts of the available record.
        </p>

        <p>
          This is why TradingNInvestment provides both the available historical
          series and interactive period filters.
        </p>
      </section>

      {/* ==================================================================
          CONCLUSION
      ================================================================== */}
      <section className="sp500-research-section research-conclusion">
        <span className="research-section-kicker">
          KEY TAKEAWAY
        </span>

        <h3>
          What the Available {config.name} Return History Shows
        </h3>

        <p>
          The dataset contains{" "}
          <strong>{statistics.completedYearCount} completed calendar years</strong>{" "}
          of {config.name} price-return observations.
        </p>

        <p>
          Of those completed years,{" "}
          <strong>{statistics.nonNegativeCount} were non-negative</strong>{" "}
          and <strong>{statistics.negativeCount} were negative</strong>.
        </p>

        {statistics.nonNegativeAverageReturnPct !== null && (
          <p>
            When completed years were non-negative, the average annual return
            was{" "}
            <strong>
              {statistics.nonNegativeAverageReturnPct >= 0 ? "+" : ""}
              {statistics.nonNegativeAverageReturnPct.toFixed(2)}%
            </strong>.
          </p>
        )}

        {statistics.negativeAverageReturnPct !== null && (
          <p>
            When completed years were negative, the average annual return was{" "}
            <strong>
              {statistics.negativeAverageReturnPct >= 0 ? "+" : ""}
              {statistics.negativeAverageReturnPct.toFixed(2)}%
            </strong>.
          </p>
        )}

        <p>
          The strongest completed calendar year in the dataset was{" "}
          <strong>
            {statistics.bestYear.year} at{" "}
            {statistics.bestYear.value >= 0 ? "+" : ""}
            {statistics.bestYear.value.toFixed(2)}%
          </strong>
          , while the weakest was{" "}
          <strong>
            {statistics.worstYear.year} at{" "}
            {statistics.worstYear.value >= 0 ? "+" : ""}
            {statistics.worstYear.value.toFixed(2)}%
          </strong>.
        </p>

        <p>
          The overall average annual {config.name} price return across the{" "}
          {statistics.completedYearCount} completed calendar years was{" "}
          <strong>
            {statistics.averageReturnPct >= 0 ? "+" : ""}
            {statistics.averageReturnPct.toFixed(2)}%
          </strong>.
        </p>

        <p>
          Together, these statistics provide a broader view of the historical
          return distribution than the average alone.
        </p>

        <p>
          The complete {config.name} annual-return dataset allows readers to
          examine the individual yearly observations behind the summary
          statistics.
        </p>

        <p className="research-closing-statement">
          TradingNInvestment aims to make market history{" "}
          <strong>
            simple to read, easy to understand, and rigorous enough to support
            serious market research.
          </strong>
        </p>
      </section>

    </article>
  )
}
