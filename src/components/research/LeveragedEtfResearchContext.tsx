type Props = {
  symbol: string
  benchmarkName: string
  leverageLabel?: string
  hasLongRollingHistory?: boolean
}

export default function LeveragedEtfResearchContext({
  symbol,
  benchmarkName,
  leverageLabel = "leveraged",
  hasLongRollingHistory = false,
}: Props) {
  return (
    <section
      aria-labelledby={`${symbol.toLowerCase()}-research-context`}
      style={{
        marginBottom: "34px",
      }}
    >
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
          {symbol} Research Context
        </div>

        <h2
          id={`${symbol.toLowerCase()}-research-context`}
          style={{
            margin: "0 0 12px",
            color: "#10233f",
            fontSize: "24px",
            letterSpacing: "-0.02em",
          }}
        >
          What This {symbol} Analysis Examines
        </h2>

        <p
          style={{
            margin: "0 0 14px",
            color: "#4d5d70",
            fontSize: "14px",
            lineHeight: 1.75,
          }}
        >
          {symbol} is a {leverageLabel} ETF with a daily
          investment objective. Because the objective resets
          daily, returns over a week, month, year, or longer
          period should not be assumed to equal the stated
          leverage multiple applied to the corresponding
          long-term return of {benchmarkName}. Daily
          compounding, market volatility, financing costs,
          fund expenses, and the path of returns can materially
          affect the outcome.
        </p>

        <p
          style={{
            margin: 0,
            color: "#4d5d70",
            fontSize: "14px",
            lineHeight: 1.75,
          }}
        >
          This TNI research therefore examines {symbol} across
          the historical periods supported by the available
          data. The analysis includes annual returns,
          drawdowns, and synchronized comparisons with{" "}
          {benchmarkName}
          {hasLongRollingHistory
            ? ", together with longer-horizon rolling performance"
            : ""}
          . The objective is to show how {symbol} has behaved
          across different market periods and holding
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
          Leveraged ETF results should be interpreted in the
          context of the fund&apos;s stated daily objective,
          underlying exposure, implementation structure, costs,
          and available operating history. TNI calculates its
          historical return comparisons independently from
          market-price data.
        </p>
      </div>
    </section>
  )
}
