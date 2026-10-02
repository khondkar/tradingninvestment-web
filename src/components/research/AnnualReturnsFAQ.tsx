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

type AnnualReturnsFAQProps = {
  config: AnnualReturnsAssetConfig
  dataset: AnnualReturnsPageData
}

function formatPct(
  value: number,
): string {
  const sign =
    value > 0 ? "+" : ""

  return `${sign}${value.toFixed(2)}%`
}

export default function AnnualReturnsFAQ({
  config,
  dataset,
}: AnnualReturnsFAQProps) {
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
        `Across ${statistics.completedYearCount} completed calendar years, ${config.shortName}'s average annual ${config.returnType.toLowerCase()} was ${formatPct(statistics.averageReturnPct)}. The current partial year is excluded from this historical average.`,
    },

    fiveYear
      ? {
          question:
            `What is ${config.shortName}'s 5-year return?`,
          answer:
            `Over the latest five completed calendar years (${fiveYear.startYear}–${fiveYear.endYear}), ${config.shortName} produced a cumulative return of ${formatPct(fiveYear.cumulativeReturnPct)}, equivalent to an annualized return of ${formatPct(fiveYear.annualizedReturnPct)}.`,
        }
      : null,

    tenYear
      ? {
          question:
            `What is ${config.shortName}'s 10-year return?`,
          answer:
            `Over the latest ten completed calendar years (${tenYear.startYear}–${tenYear.endYear}), ${config.shortName} produced a cumulative return of ${formatPct(tenYear.cumulativeReturnPct)}, equivalent to an annualized return of ${formatPct(tenYear.annualizedReturnPct)}.`,
        }
      : null,

    {
      question:
        `How often has ${config.shortName} had a non-negative year?`,
      answer:
        `${config.shortName} had a non-negative annual return in ${statistics.nonNegativeCount} of ${statistics.completedYearCount} completed calendar years, or ${statistics.nonNegativeRatePct.toFixed(2)}% of the historical observations in this dataset.`,
    },

    {
      question:
        `What were ${config.shortName}'s best and worst years?`,
      answer:
        `${config.shortName}'s strongest completed calendar year in this dataset was ${statistics.bestYear.year}, with a return of ${formatPct(statistics.bestYear.value)}. Its weakest was ${statistics.worstYear.year}, with a return of ${formatPct(statistics.worstYear.value)}.`,
    },

    {
      question:
        `How does ${config.shortName} compare with the S&P 500?`,
      answer:
        `The S&P 500 comparison on this page places ${config.shortName}'s annual price returns beside the benchmark on a year-by-year basis. This keeps the comparison on the same price-return basis rather than mixing price return with dividend-adjusted total return.`,
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
      aria-labelledby={`${config.slug}-faq-heading`}
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
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#5d6b7a",
          }}
        >
          {config.shortName.toUpperCase()} STOCK INTELLIGENCE
        </div>

        <h2
          id={`${config.slug}-faq-heading`}
          style={{
            marginBottom: "12px",
          }}
        >
          {config.shortName} Stock Returns FAQ
        </h2>

        <p
          style={{
            marginBottom: "26px",
            color: "#5d6b7a",
            lineHeight: 1.7,
          }}
        >
          Frequently asked questions based on
          TNI&apos;s verified historical
          annual-return dataset.
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
