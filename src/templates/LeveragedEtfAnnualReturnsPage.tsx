import UproTqqqComparison from "../components/research/UproTqqqComparison"
import type {
  AnnualReturnsAssetConfig,
} from "../research/annual-returns/types"

import type {
  AnnualReturnsPageData,
} from "../research/annual-returns/pageShared"

import GenericAnnualReturnsPage from "./GenericAnnualReturnsPage"
import DividendCompoundingExplorer, {
  type ReturnMethodRow,
} from "../components/charts/DividendCompoundingExplorer"

import LeveragedEtfDrawdownComparison, {
  type LeveragedEtfDrawdownDataset,
} from "../components/research/LeveragedEtfDrawdownComparison"

import LeveragedEtfAnnualReturnsFAQ from "../components/research/LeveragedEtfAnnualReturnsFAQ"
import LeveragedEtfFundFacts from "../components/research/LeveragedEtfFundFacts"
import LeveragedEtfResearchContext from "../components/research/LeveragedEtfResearchContext"
import LazyLeveragedEtfPeriodComparison from "../components/research/LazyLeveragedEtfPeriodComparison"


// ============================================================================
// TNI LEVERAGED ETF ANNUAL RETURNS — SHARED ADAPTER
//
// Purpose:
// - Render leveraged ETFs through TNI's shared research engine.
// - Use the configured investable comparison ETF rather than the S&P 500.
// - Preserve Price Return vs Total Return as a first-class research layer.
// - Keep leveraged ETF pages separate from stock-specific assumptions.
// ============================================================================

type LeveragedEtfAnnualReturnsPageProps = {
  config: AnnualReturnsAssetConfig
  dataset: AnnualReturnsPageData
  benchmarkDataset: AnnualReturnsPageData
  benchmarkName: string
  returnMethodsData?: ReturnMethodRow[]
  drawdownData?: LeveragedEtfDrawdownDataset
}


export default function LeveragedEtfAnnualReturnsPage({
  config,
  dataset,
  benchmarkDataset,
  benchmarkName,
  returnMethodsData,
  drawdownData,
}: LeveragedEtfAnnualReturnsPageProps) {
  return (
    <GenericAnnualReturnsPage
      config={config}
      dataset={dataset}
      benchmarkDataset={benchmarkDataset}
      benchmarkName={benchmarkName}
      introContent={config.symbol === "TQQQ" ? (
        <p style={{ color: "#10233f", fontSize: 18, fontWeight: 600, lineHeight: 1.7 }}>
          {config.seo.description}
        </p>
      ) : config.symbol === "UPRO" && drawdownData ? (
        <div style={{ color: "#10233f", fontSize: 18, fontWeight: 600, lineHeight: 1.75, marginTop: 18 }}>
          <p>How much can UPRO lose—and how long can it take to recover? In the UPRO–SPY dataset beginning {drawdownData.range.first_date}, UPRO’s deepest drawdown reached <strong>{Math.abs(drawdownData.asset_summary.max_drawdown_pct).toFixed(2)}%</strong>.
            {drawdownData.asset_summary.calendar_days_trough_to_recovery !== null
              ? <> It took <strong>{drawdownData.asset_summary.calendar_days_trough_to_recovery.toLocaleString()} calendar days from the low to recovery</strong>.</>
              : <> That decline had not recovered by {drawdownData.range.last_date}.</>}
          </p>
          <p>How does UPRO compare with TQQQ and SPY? Explore returns across matching holding periods, compare losses from previous peaks, and see how long each fund took to recover. Use the interactive UPRO vs TQQQ chart and tables below to compare YTD, 1-, 3-, 5- and 10-year outcomes and growth of $10,000.</p>
        </div>
      ) : undefined}
      afterIntroduction={config.symbol === "UPRO" && config.companyContext ? (
        <section aria-labelledby="upro-research-introduction" style={{ color: "#10233f", fontWeight: 600, fontSize: 17, lineHeight: 1.75, margin: "28px 0" }}>
          <h2 id="upro-research-introduction" style={{ fontSize: 26, fontWeight: 800 }}>{config.companyContext.title}</h2>
          {config.companyContext.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <p><a href="/#prediction-lab">Mini Prediction Lab</a>{" · "}<a href="https://app.tradingninvestment.com/live/news">TNI News Agent</a></p>
          <p>Fund objective and documents: <a href={config.leveragedEtf?.officialUrl}>ProShares UPRO</a>.</p>
        </section>
      ) : undefined}
      afterPeriodReturns={
        <>
          <LeveragedEtfResearchContext
            symbol={config.symbol}
            benchmarkName={benchmarkName}
            leverageLabel={
              config.leveragedEtf?.leverageLabel ?? "leveraged"
            }
            hasLongRollingHistory={
              config.leveragedEtf?.showRolling10Year ?? false
            }
          />

          <LazyLeveragedEtfPeriodComparison
            symbol={config.symbol}
            benchmark={benchmarkName}
          />
        </>
      }
      afterRollingComparison={
        <>
          {drawdownData && <LeveragedEtfDrawdownComparison dataset={drawdownData} />}
          {config.symbol === "UPRO" && <UproTqqqComparison />}
        </>
      }
      afterArticle={
        <>
          <section
            aria-labelledby={`${config.symbol.toLowerCase()}-risk-due-diligence`}
            style={{
              margin: "48px 0 34px",
            }}
          >
            <div
              style={{
                padding: "26px",
                border: "1px solid #e4e8ee",
                borderRadius: "14px",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  marginBottom: "7px",
                  color: "#5d6b7a",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Risk & Due Diligence
              </div>

              <h2
                id={`${config.symbol.toLowerCase()}-risk-due-diligence`}
                style={{
                  margin: "0 0 14px",
                  color: "#10233f",
                  fontSize: "24px",
                  letterSpacing: "-0.02em",
                }}
              >
                Risk & Due Diligence
              </h2>

              <>
                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#4d5d70",
                    fontSize: "16px",
                    lineHeight: 1.75,
                  }}
                >
                  {config.shortName} should be evaluated as a
                  leveraged instrument with a daily investment
                  objective. Returns over holding periods longer
                  than one day can differ substantially from the
                  fund&apos;s stated daily leverage multiple applied
                  to {benchmarkName}.</p>

                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#4d5d70",
                    fontSize: "16px",
                    lineHeight: 1.75,
                  }}
                > Daily compounding, volatility,
                  derivatives, financing costs and fund expenses can
                  materially affect longer-period results and the
                  potential for loss.
                </p>
              </>

              <h3
                style={{
                  margin: "0 0 12px",
                  color: "#10233f",
                  fontSize: "17px",
                }}
              >
                Key due-diligence questions include:
              </h3>

              <ul
                style={{
                  margin: "0 0 18px",
                  paddingLeft: "21px",
                  color: "#4d5d70",
                  fontSize: "13px",
                  lineHeight: 1.75,
                }}
              >
                <li>
                  <strong>Daily objective:</strong>{" "}
                  Is the investor evaluating {config.shortName} based
                  on the daily exposure it is designed to provide?
                </li>
                <li>
                  <strong>Compounding:</strong>{" "}
                  How did the sequence of daily {benchmarkName} returns
                  affect the cumulative {config.shortName} result?
                </li>
                <li>
                  <strong>Volatility:</strong>{" "}
                  How did periods of high volatility affect the
                  difference between {config.shortName} and its
                  underlying benchmark?
                </li>
                <li>
                  <strong>Drawdown:</strong>{" "}
                  How large were historical declines from previous
                  peaks, and how long did recovery take?
                </li>
                <li>
                  <strong>Holding period:</strong>{" "}
                  How did {config.shortName} perform over individual
                  days, weeks, months, and longer periods?
                </li>
                <li>
                  <strong>Benchmark comparison:</strong>{" "}
                  How did the leveraged ETF compare with{" "}
                  {benchmarkName} over the same synchronized periods?
                </li>
                <li>
                  <strong>Costs and implementation:</strong>{" "}
                  How might fund expenses, financing associated
                  with derivatives, trading costs, and the
                  difference between market price and NAV affect
                  an investor&apos;s realized result?
                </li>
              </ul>

              <>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: "#7a899c",
                    fontSize: "13px",
                    lineHeight: 1.65,
                  }}
                >
                  <strong>Important:</strong> Historical returns
                  and drawdowns are observations from the available
                  dataset. They are not forecasts or guarantees of
                  future performance. For broader historical
                  context across major market cycles, explore
                  TNI&apos;s{" "}
                  <a href="/stock-market-historical-returns/">
                    stock market historical returns
                  </a>
                  .</p>

                <p
                  style={{
                    margin: "0 0 12px",
                    color: "#7a899c",
                    fontSize: "13px",
                    lineHeight: 1.65,
                  }}
                > Investors should review the fund&apos;s current
                  prospectus, financial statements, and other
                  official fund documents before making an
                  investment decision.
                </p>
              </>

              <p
                style={{
                  margin: 0,
                  color: "#7a899c",
                  fontSize: "13px",
                  lineHeight: 1.65,
                }}
              >
                TNI uses Yahoo Finance historical price and
                adjusted-close data for the independent return
                calculations and visualizations on this page.
                Official issuer information, fund objectives,
                portfolio composition and fund documents are
                presented separately in the fund-facts section
                below.
              </p>
            </div>
          </section>

          <LeveragedEtfFundFacts
            config={config}
          />

          <LeveragedEtfAnnualReturnsFAQ
            config={config}
            dataset={dataset}
            benchmarkName={benchmarkName}
          />
        </>
      }
      beforeReturnExplorer={
        returnMethodsData?.length ? (
          <>
            <DividendCompoundingExplorer
              data={returnMethodsData}
              assetName={config.shortName}
            />

            {/* =============================================================
                TNI $10,000 GROWTH — PUBLISHER EMBED CODE
            ============================================================= */}

            <div
              style={{
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  marginBottom: "7px",
                  color: "#10233f",
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                Publisher Embed Code
              </div>

              <div
                style={{
                  overflowX: "auto",
                  padding: "13px 14px",
                  border:
                    "1px solid #dfe8f3",
                  borderRadius: "9px",
                  background: "#ffffff",
                  color: "#43546a",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: "11px",
                  lineHeight: 1.6,
                  whiteSpace: "nowrap",
                }}
              >
                {`<iframe src="https://tradingninvestment.com/embed/${config.slug}/10000-growth/" width="100%" height="620" style="border:0;" loading="lazy" title="Growth of $10,000 Invested in ${config.shortName} — TradingNInvestment Research"></iframe>`}
              </div>
            </div>
          </>
        ) : undefined
      }
    />
  )
}
