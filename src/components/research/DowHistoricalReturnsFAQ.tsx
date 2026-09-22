import type { AnnualReturnsPageData } from "../../research/annual-returns/pageShared"
import type { TNIHistoricalPricePoint } from "../../charts/tni/tniChartTypes"

type Props = {
  dataset: AnnualReturnsPageData
  prices: TNIHistoricalPricePoint[]
}

function calculateTrailingReturn(
  prices: TNIHistoricalPricePoint[],
  years: number,
) {
  if (prices.length === 0) {
    return null
  }

  const latest =
    prices[prices.length - 1]

  const latestDate =
    new Date(`${latest.date}T00:00:00`)

  const targetYear =
    latestDate.getFullYear() - years

  const targetMonth =
    latestDate.getMonth()

  const target =
    prices.find((row) => {
      const date =
        new Date(`${row.date}T00:00:00`)

      return (
        date.getFullYear() === targetYear &&
        date.getMonth() === targetMonth
      )
    })

  if (!target) {
    return null
  }

  const cumulative =
    latest.close / target.close - 1

  const annualized =
    years === 1
      ? cumulative
      : Math.pow(
          latest.close / target.close,
          1 / years,
        ) - 1

  return {
    years,
    startDate: target.date,
    endDate: latest.date,
    startPrice: target.close,
    endPrice: latest.close,
    cumulativePct:
      cumulative * 100,
    annualizedPct:
      annualized * 100,
  }
}

export default function DowHistoricalReturnsFAQ({
  dataset,
  prices,
}: Props) {
  const completedYears =
    dataset.data.filter(
      (row) =>
        row.year !==
        dataset.current_year.year
    )

  const values =
    completedYears.map(
      (row) => row.value
    )

  const average =
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length

  const positiveYears =
    completedYears.filter(
      (row) =>
        row.value > 0
    ).length

  const positivePct =
    (
      positiveYears /
      completedYears.length
    ) * 100

  const best =
    completedYears.reduce(
      (a, b) =>
        b.value > a.value
          ? b
          : a
    )

  const worst =
    completedYears.reduce(
      (a, b) =>
        b.value < a.value
          ? b
          : a
    )

  const latest =
    dataset.current_year

  const firstYear =
    dataset.data[0]?.year

  const oneYear =
    calculateTrailingReturn(
      prices,
      1,
    )

  const threeYear =
    calculateTrailingReturn(
      prices,
      3,
    )

  const fiveYear =
    calculateTrailingReturn(
      prices,
      5,
    )

  const tenYear =
    calculateTrailingReturn(
      prices,
      10,
    )

  const twentyYear =
    calculateTrailingReturn(
      prices,
      20,
    )

  const formatPeriodAnswer = (
    result:
      | ReturnType<
          typeof calculateTrailingReturn
        >
      | null,
  ) => {
    if (!result) {
      return "The requested return is not available in the current historical price dataset."
    }

    if (result.years === 1) {
      return `The latest Dow Jones 1-year price return is ${result.cumulativePct.toFixed(2)}%, calculated from the corresponding monthly observation one year earlier through the latest available monthly observation.`
    }

    return `The latest Dow Jones ${result.years}-year annualized price return is ${result.annualizedPct.toFixed(2)}% per year. Over the full ${result.years}-year period, the cumulative price return is ${result.cumulativePct.toFixed(2)}%.`
  }

  const faq = [
    {
      question:
        "What are the historical returns of the stock market?",
      answer:
        `Using the Dow Jones Industrial Average as a long-term market benchmark, this dataset covers annual price returns from ${firstYear} through ${latest.year} YTD. Across completed calendar years, the average annual price return was ${average.toFixed(2)}%.`,
    },
    {
      question:
        "What are the Dow Jones returns by year?",
      answer:
        `The Dow Jones returns-by-year table and interactive chart above show annual price returns from ${firstYear} through ${latest.year} YTD.`,
    },
    {
      question:
        `What is the Dow Jones ${latest.year} YTD return?`,
      answer:
        `The Dow Jones ${latest.year} year-to-date price return in the latest dataset is ${latest.return_pct.toFixed(2)}%. The current year is incomplete and updates when the underlying dataset changes.`,
    },
    {
      question:
        "What is the Dow Jones 1-year return?",
      answer:
        formatPeriodAnswer(oneYear),
    },
    {
      question:
        "What is the Dow Jones 3-year return?",
      answer:
        formatPeriodAnswer(threeYear),
    },
    {
      question:
        "What is the Dow Jones 5-year return?",
      answer:
        formatPeriodAnswer(fiveYear),
    },
    {
      question:
        "What is the Dow Jones 10-year return?",
      answer:
        formatPeriodAnswer(tenYear),
    },
    {
      question:
        "What is the Dow Jones 20-year return?",
      answer:
        formatPeriodAnswer(twentyYear),
    },
    {
      question:
        "What is the average historical Dow Jones return?",
      answer:
        `Across ${completedYears.length} completed calendar years in this dataset, the Dow Jones average annual price return is ${average.toFixed(2)}%.`,
    },
    {
      question:
        "What was the best year for the Dow Jones?",
      answer:
        `${best.year} was the strongest completed year in this historical dataset, with a price return of ${best.value.toFixed(2)}%.`,
    },
    {
      question:
        "What was the worst year for the Dow Jones?",
      answer:
        `${worst.year} was the weakest completed year in this historical dataset, with a price return of ${worst.value.toFixed(2)}%.`,
    },
    {
      question:
        "How often does the Dow Jones have a positive year?",
      answer:
        `${positiveYears} of ${completedYears.length} completed years in this dataset had positive price returns, or ${positivePct.toFixed(2)}% of completed years.`,
    },
    {
      question:
        "How are Dow Jones annual returns calculated?",
      answer:
        `${dataset.methodology.calculation} ${dataset.methodology.current_year}`,
    },
    {
      question:
        "Do these Dow Jones historical returns include dividends?",
      answer:
        "No. This research reports Dow Jones Industrial Average price returns. It does not represent total return with dividends reinvested.",
    },
    {
      question:
        "Where can I download Dow Jones historical returns?",
      answer:
        "The Dow Jones annual historical-return dataset is available as a downloadable CSV from this research page.",
    },
  ]

  return (
    <section
      style={{
        marginTop: "32px",
        paddingTop: "28px",
        borderTop:
          "1px solid #e4ebf3",
      }}
    >
      <div
        style={{
          marginBottom: "8px",
          color: "#1677ff",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Frequently Asked Questions
      </div>

      <h2
        style={{
          margin: "0 0 20px",
          color: "#10233f",
          fontSize: "22px",
        }}
      >
        Stock Market Historical Returns FAQ
      </h2>

      <div
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "900px",
        }}
      >
        {faq.map((item) => (
          <details
            key={item.question}
            style={{
              padding: "14px 16px",
              border:
                "1px solid #e4ebf3",
              borderRadius: "8px",
              background: "#ffffff",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                color: "#10233f",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {item.question}
            </summary>

            <p
              style={{
                margin: "10px 0 0",
                color: "#66768a",
                fontSize: "13px",
                lineHeight: 1.7,
              }}
            >
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
