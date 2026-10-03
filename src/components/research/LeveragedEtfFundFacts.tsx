import type {
  AnnualReturnsAssetConfig,
} from "../../research/annual-returns/types"

type Props = {
  config: AnnualReturnsAssetConfig
}

export default function LeveragedEtfFundFacts({
  config,
}: Props) {
  const fund = config.leveragedEtf

  if (!fund) {
    return null
  }

  return (
    <section
      aria-labelledby={`${config.symbol.toLowerCase()}-fund-facts`}
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
        id={`${config.symbol.toLowerCase()}-fund-facts`}
        style={{
          margin: "0 0 10px",
          color: "#10233f",
        }}
      >
        {config.name} ({config.symbol})
      </h2>

      <p
        style={{
          maxWidth: "820px",
          margin: "0 0 22px",
          color: "#5f7084",
          lineHeight: 1.7,
        }}
      >
        {fund.dailyObjective} Because the investment
        objective is daily, the fund&apos;s return over
        periods longer than one trading day should not be
        assumed to equal its stated leverage multiple
        applied to the longer-period return of{" "}
        {fund.benchmarkName}.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        {[
          ["Issuer", fund.issuer],
          ["Daily Exposure", fund.leverageLabel],
          ["Underlying", fund.benchmarkTicker],
          ["Inception", fund.inceptionDate],
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

      {fund.structureSummary ? (
        <>
          <h3
            style={{
              margin: "0 0 9px",
              color: "#10233f",
              fontSize: "18px",
            }}
          >
            {config.symbol} Holdings &amp; Portfolio Structure
          </h3>

          <p
            style={{
              margin: "0 0 12px",
              color: "#43546a",
              fontSize: "13px",
              lineHeight: 1.75,
            }}
          >
            {fund.structureSummary}
          </p>
        </>
      ) : null}

      {fund.compositionNotes?.length ? (
        <ul
          style={{
            margin: "0 0 18px",
            paddingLeft: "21px",
            color: "#43546a",
            fontSize: "13px",
            lineHeight: 1.75,
          }}
        >
          {fund.compositionNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      <p
        style={{
          margin: 0,
          color: "#7a899c",
          fontSize: "11px",
          lineHeight: 1.65,
        }}
      >
        Official fund information:{" "}
        <a
          href={fund.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {fund.issuer} — {config.symbol}
        </a>
        . TNI uses Yahoo Finance historical price and
        adjusted-close data for independent return,
        growth and drawdown calculations.
      </p>
    </section>
  )
}
