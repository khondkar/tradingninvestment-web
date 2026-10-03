import type {
  AnnualReturnsAssetConfig,
} from "../../research/annual-returns/types"

import type {
  AnnualReturnsPageData,
} from "../../research/annual-returns/pageShared"

import {
  calculateCompletedPeriodReturn,
} from "../../research/annual-returns/calculations"

import {
  calculateAnnualReturnsArticleStatistics,
} from "../../research/annual-returns/articleCalculations"


type Props = {
  config: AnnualReturnsAssetConfig
  dataset: AnnualReturnsPageData
  benchmarkName: string
}


function formatPct(
  value: number,
): string {
  const sign =
    value > 0 ? "+" : ""

  return `${sign}${value.toFixed(2)}%`
}


export default function LeveragedEtfAnnualReturnsFAQ({
  config,
  dataset,
  benchmarkName,
}: Props) {
  const statistics =
    calculateAnnualReturnsArticleStatistics(
      dataset,
    )

  const fiveYear =
    calculateCompletedPeriodReturn(
      dataset,
      5,
    )

  const tenYear =
    calculateCompletedPeriodReturn(
      dataset,
      10,
    )

  const fund = config.leveragedEtf

  const faqItems = [
    {
      question:
        `What is the ${config.shortName} ETF?`,

      answer:
        fund
          ? `${config.shortName} is ${config.name}, a leveraged ETF from ${fund.issuer}. ${fund.dailyObjective} Its objective applies to a single trading day, so returns over longer periods can differ materially from the stated daily leverage multiple.`
          : `${config.shortName} is ${config.name}.`,
    },

    {
      question:
        `Is ${config.shortName} a safe investment?`,

      answer:
        `${config.shortName} is a leveraged ETF and can experience substantially larger gains and losses than ${benchmarkName}. Whether it is appropriate depends on an investor's objectives, holding period and ability to tolerate large drawdowns. The fund's daily reset, leverage, compounding and volatility can make longer-period results materially different from the underlying asset.`,
    },

    {
      question:
        `What is the difference between ${benchmarkName} and ${config.shortName}?`,

      answer:
        fund
          ? `${benchmarkName} is the underlying exposure used for comparison on this page, while ${config.shortName} is a leveraged ETF seeking ${fund.leverageLabel} daily exposure linked to ${benchmarkName}. ${config.shortName} resets its leverage daily, so owning ${config.shortName} is not economically identical to simply owning ${benchmarkName} at a fixed multiple for a long period.`
          : `TNI compares ${config.shortName} with ${benchmarkName} using synchronized historical periods.`,
    },

    {
      question:
        `What does ${config.shortName} invest in?`,

      answer:
        fund?.structureSummary
          ? `${fund.structureSummary} The exact instruments, counterparties, collateral and portfolio weights can change over time, so current composition should be checked against the latest official ${fund.issuer} fund information.`
          : `${config.shortName}'s portfolio composition can change over time. Current holdings should be checked against the issuer's latest official fund information.`,
    },

    {
      question:
        `What are ${config.shortName}'s holdings?`,

      answer:
        fund?.compositionNotes?.length
          ? `${fund.compositionNotes.join(" ")}`
          : `${config.shortName}'s holdings and derivative exposures can change over time. TNI therefore distinguishes the fund's structural investment approach from dated portfolio holdings published by the issuer.`,
    },

    {
      question:
        `Does ${config.shortName} ETF pay dividends?`,

      answer:
        `Distribution payments can vary over time. For performance analysis, TNI separates price return from total return: the total-return analysis uses adjusted-close history to incorporate distributions and their reinvestment effect, while the annual price-return series uses historical closing prices.`,
    },

    {
      question:
        `What is ${config.shortName}'s historical average annual return?`,

      answer:
        `Across ${statistics.completedYearCount} completed calendar years in this dataset, ${config.shortName}'s average annual ${config.returnType.toLowerCase()} was ${formatPct(statistics.averageReturnPct)}. The current partial year is excluded from this historical average.`,
    },

    fiveYear
      ? {
          question:
            `What is ${config.shortName}'s 5-year return?`,

          answer:
            `Over the latest five completed calendar years (${fiveYear.startYear}–${fiveYear.endYear}), ${config.shortName} produced a cumulative price return of ${formatPct(fiveYear.cumulativeReturnPct)}, equivalent to an annualized return of ${formatPct(fiveYear.annualizedReturnPct)}.`,
        }
      : null,

    tenYear &&
    config.leveragedEtf?.showRolling10Year !== false
      ? {
          question:
            `What is ${config.shortName}'s 10-year return?`,

          answer:
            `Over the latest ten completed calendar years (${tenYear.startYear}–${tenYear.endYear}), ${config.shortName} produced a cumulative price return of ${formatPct(tenYear.cumulativeReturnPct)}, equivalent to an annualized return of ${formatPct(tenYear.annualizedReturnPct)}.`,
        }
      : null,

    {
      question:
        `What were ${config.shortName}'s best and worst years?`,

      answer:
        `${config.shortName}'s strongest completed calendar year in this dataset was ${statistics.bestYear.year}, with a price return of ${formatPct(statistics.bestYear.value)}. Its weakest was ${statistics.worstYear.year}, with a price return of ${formatPct(statistics.worstYear.value)}.`,
    },

    {
      question:
        `How does ${config.shortName} compare with ${benchmarkName}?`,

      answer:
        config.leveragedEtf?.showRolling10Year !== false
          ? `TNI compares ${config.shortName} with ${benchmarkName} using synchronized historical periods, including year-by-year annual returns, rolling 10-year annualized returns, period returns and daily adjusted-close drawdowns.`
          : `TNI compares ${config.shortName} with ${benchmarkName} using synchronized historical periods, including year-by-year annual returns, daily, weekly and monthly period returns, growth analysis and daily adjusted-close drawdowns. A rolling 10-year comparison is not shown because ${config.shortName} does not yet have ten years of trading history.`,
    },

    {
      question:
        `Why doesn't ${config.shortName} return exactly ${fund?.leverageLabel ?? "its stated leverage multiple"} of ${benchmarkName} over longer periods?`,

      answer:
        `${config.shortName} targets leveraged performance on a daily basis rather than promising a fixed multiple over longer holding periods. Daily resetting and compounding mean that the sequence of returns, volatility, fees and financing effects can cause longer-period performance to differ substantially from simply multiplying ${benchmarkName}'s longer-period return.`,
    },

    {
      question:
        `What happens to ${config.shortName} when ${benchmarkName} falls?`,

      answer:
        fund
          ? `${config.shortName} seeks ${fund.leverageLabel} daily exposure linked to ${benchmarkName}. A decline in ${benchmarkName} can therefore produce a magnified daily decline in ${config.shortName}, before considering fees, expenses, tracking differences and market effects.`
          : `${config.shortName} can experience amplified losses when its underlying benchmark declines.`,
    },

    {
      question:
        `What is volatility drag in a daily leveraged ETF?`,

      answer:
        `Volatility drag describes a compounding effect that can occur when returns fluctuate from day to day. Because percentage losses and gains compound from different portfolio values, repeated market swings can reduce longer-period compounded performance even when the underlying later returns near an earlier level.`,
    },

    {
      question:
        `How severe have ${config.shortName}'s historical drawdowns been?`,

      answer:
        `The drawdown analysis measures ${config.shortName} and ${benchmarkName} from synchronized daily adjusted-close data. It reports each series' maximum decline from a running peak, peak and trough dates, recovery timing, and the gain required to recover from the deepest observed loss in the available dataset.`,
    },
  ].filter(
    (
      item,
    ): item is {
      question: string
      answer: string
    } => item !== null,
  )

  return (
    <section
      aria-labelledby={`${config.slug}-leveraged-etf-faq`}
      style={{
        margin: "48px 0",
      }}
    >
      <div
        style={{
          maxWidth: "860px",
        }}
      >
        <div
          style={{
            marginBottom: "10px",
            color: "#5d6b7a",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.12em",
          }}
        >
          {config.intelligenceEyebrow}
        </div>

        <h2
          id={`${config.slug}-leveraged-etf-faq`}
          style={{
            marginBottom: "12px",
          }}
        >
          {config.shortName} Returns FAQ
        </h2>

        <p
          style={{
            marginBottom: "26px",
            color: "#5d6b7a",
            lineHeight: 1.7,
          }}
        >
          Frequently asked questions about historical
          returns, total return, leverage, compounding,
          benchmark performance and drawdown risk.
        </p>

        {faqItems.map(
          (item) => (
            <details
              key={item.question}
              style={{
                padding: "18px 0",
                borderTop:
                  "1px solid #e5e9ef",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 650,
                  lineHeight: 1.5,
                }}
              >
                {item.question}
              </summary>

              <p
                style={{
                  margin:
                    "12px 0 0",
                  color: "#4d5a68",
                  lineHeight: 1.75,
                }}
              >
                {item.answer}
              </p>
            </details>
          ),
        )}
      </div>
    </section>
  )
}
