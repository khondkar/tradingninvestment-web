type Props = {
  benchmarkName: string
}

export default function LeveragedEtfResearchContext({
  benchmarkName,
}: Props) {
  return (
    <section
      aria-labelledby="tqqq-research-context"
      style={{
        marginBottom: "34px",
      }}
    >
      {/* ================================================================
          TNI TQQQ RESEARCH CONTEXT — TOP OF PAGE
      ================================================================= */}
      <div
        style={{
          padding: "24px 26px",
          border: "1px solid #dfe8f3",
          borderRadius: "14px",
          background: "#f8fbff",
        }}
      >
        <div
          style={{
            marginBottom: "7px",
            color: "#1677ff",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          TQQQ Research Context
        </div>

        <h2
          id="tqqq-research-context"
          style={{
            margin: "0 0 12px",
            color: "#10233f",
            fontSize: "24px",
            letterSpacing: "-0.02em",
          }}
        >
          What This TQQQ Analysis Examines
        </h2>

        <p
          style={{
            margin: "0 0 14px",
            color: "#4d5d70",
            fontSize: "14px",
            lineHeight: 1.75,
          }}
        >
          TQQQ is a leveraged ETF designed to seek three times
          the daily performance of the Nasdaq-100 Index, before
          fees and expenses. Because its objective is daily, its
          return over a week, month, year, or longer period is not
          simply three times the corresponding Nasdaq-100 return.
          Daily compounding, market volatility, financing costs,
          expenses, and the path of returns can materially affect
          the outcome.
        </p>

        <p
          style={{
            margin: 0,
            color: "#4d5d70",
            fontSize: "14px",
            lineHeight: 1.75,
          }}
        >
          This TNI research therefore examines TQQQ across
          multiple time horizons rather than relying on a single
          long-term return figure. The analysis includes annual
          returns, rolling 10-year performance, drawdowns, and
          synchronized daily, weekly, and monthly comparisons
          with {benchmarkName}. The objective is to show how TQQQ
          has behaved across different market periods and holding
          horizons—not to imply that historical performance
          predicts future results.
        </p>

        <p
          style={{
            margin: "14px 0 0",
            color: "#4d5d70",
            fontSize: "14px",
            lineHeight: 1.75,
          }}
        >
          For broader market context, compare these results with
          TNI&apos;s{" "}
          <a href="/sp-500-returns/">
            S&amp;P 500 historical returns
          </a>
          . For a company-level perspective using the same
          evidence-first research approach, explore{" "}
          <a href="/aapl-stock-yearly-return/">
            Apple stock returns
          </a>
          .
        </p>
      </div>
    </section>
  )
}
