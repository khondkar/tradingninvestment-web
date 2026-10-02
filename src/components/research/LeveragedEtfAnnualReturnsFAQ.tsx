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

  const faqItems = [
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

    tenYear
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
        `Does ${config.shortName}'s total return include distributions?`,

      answer:
        `Yes. The total-return analysis on this page uses adjusted-close history to incorporate distributions and their reinvestment effect, while the annual price-return series uses historical closing prices. TNI presents both so the two return concepts are not mixed.`,
    },

    {
      question:
        `How does ${config.shortName} compare with ${benchmarkName}?`,

      answer:
        `TNI compares ${config.shortName} with ${benchmarkName} using synchronized historical periods. The page includes year-by-year annual price returns, rolling 10-year annualized returns, and daily adjusted-close drawdowns so the leveraged ETF and its investable comparison can be evaluated on consistent time periods.`,
    },

    {
      question:
        `Why is ${config.shortName}'s long-term return not simply three times ${benchmarkName}'s return?`,

      answer:
        `${config.shortName} targets leveraged performance on a daily basis rather than promising a fixed multiple over longer holding periods. Daily resetting and compounding mean that the path of returns and market volatility can cause longer-period performance to differ substantially from a simple three-times calculation.`,
    },

    {
      question:
        `What is volatility drag in a daily leveraged ETF?`,

      answer:
        `Volatility drag describes the compounding effect that can occur when returns fluctuate from day to day. Because percentage losses and gains compound from different portfolio values, repeated market swings can reduce longer-period compounded performance even when the underlying market eventually returns near an earlier level.`,
    },

    {
      question:
        `How severe have ${config.shortName}'s historical drawdowns been?`,

      answer:
        `The drawdown section on this page measures ${config.shortName} and ${benchmarkName} from synchronized daily adjusted-close data. It reports each series' maximum decline from a running peak, the peak and trough dates, recovery timing, and the percentage gain required to recover from the deepest observed loss in this dataset.`,
    },

    {
      question:
        `What is the difference between ${config.shortName} and SQQQ?`,

      answer:
        `${config.shortName} and SQQQ are leveraged ETFs with opposite directional objectives. ${config.shortName} seeks leveraged daily exposure in the same direction as the Nasdaq-100, while SQQQ seeks leveraged daily exposure in the opposite direction. Their long-term results therefore depend on daily market direction, compounding and volatility.`,
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
