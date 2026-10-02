type Props = {
  symbol: string
}

export default function LeveragedEtfFundFacts({
  symbol,
}: Props) {
  if (symbol !== "TQQQ") {
    return null
  }

  return (
    <section
      aria-labelledby="tqqq-fund-facts"
      style={{
        margin: "42px 0",
        padding: "26px",
        border: "1px solid #e1e8f0",
        borderRadius: "16px",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          marginBottom: "8px",
          color: "#1677ff",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.1em",
        }}
      >
        OFFICIAL FUND FACTS
      </div>

      <h2
        id="tqqq-fund-facts"
        style={{
          margin: "0 0 10px",
          color: "#10233f",
        }}
      >
        ProShares UltraPro QQQ (TQQQ)
      </h2>

      <p
        style={{
          maxWidth: "820px",
          margin: "0 0 22px",
          color: "#5f7084",
          lineHeight: 1.7,
        }}
      >
        TQQQ seeks daily investment results,
        before fees and expenses, corresponding
        to three times (3×) the daily performance
        of the Nasdaq-100 Index. The daily target
        does not imply a fixed 3× return over
        periods longer than one day.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {[
          ["Daily Target", "3× Nasdaq-100"],
          ["Inception", "February 9, 2010"],
          ["Distributions", "Quarterly"],
          ["Gross Expense Ratio", "0.97%"],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              padding: "16px",
              border: "1px solid #e5ebf2",
              borderRadius: "11px",
              background: "#f8fafc",
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#718096",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.07em",
              }}
            >
              {label}
            </span>

            <strong
              style={{
                color: "#10233f",
                fontSize: "16px",
              }}
            >
              {value}
            </strong>
          </div>
        ))}
      </div>

      <p
        style={{
          margin: "0 0 10px",
          color: "#43546a",
          fontSize: "13px",
          lineHeight: 1.7,
        }}
      >
        ProShares notes that returns over periods
        longer than one day may be higher or lower
        than the fund&apos;s daily target. Compounding,
        the magnitude of index movements and
        volatility can cause significant differences.
      </p>

      <p
        style={{
          margin: 0,
          color: "#7a899c",
          fontSize: "11px",
          lineHeight: 1.65,
        }}
      >
        Official fund facts source:{" "}
        <a
          href="https://www.proshares.com/our-etfs/leveraged-and-inverse/tqqq"
          target="_blank"
          rel="noopener noreferrer"
        >
          ProShares — TQQQ
        </a>
        . TNI uses Yahoo Finance historical
        price and adjusted-close data for the
        independent return calculations and
        visualizations on this page.
      </p>
    </section>
  )
}
