import BerkshireCashBuybacks from "../components/research/BerkshireCashBuybacks"
import brkbMarketEvents from "../data/charts/brkbMarketEvents.json"
import BerkshireMarketDrawdowns from "../components/research/BerkshireMarketDrawdowns"
import brkbDrawdowns from "../data/charts/brkbVsSp500Drawdowns.json"
import StockTotalReturnComparison from '../components/research/StockTotalReturnComparison'
import sp500AnnualReturns from "../data/charts/sp500AnnualReturns.json"
import nkeDrawdowns from "../data/charts/nkeVsSp500Drawdowns.json"
import jpmDrawdowns from "../data/charts/jpmVsSp500Drawdowns.json"

import type {
  AnnualReturnsAssetConfig,
} from "../research/annual-returns/types"

import type {
  AnnualReturnsPageData,
} from "../research/annual-returns/pageShared"

import GenericAnnualReturnsPage from "./GenericAnnualReturnsPage"
import AnnualReturnsFAQ from "../components/research/AnnualReturnsFAQ"
import DividendCompoundingExplorer, {
  type ReturnMethodRow,
} from "../components/charts/DividendCompoundingExplorer"
import LeveragedEtfDrawdownComparison, {
  type LeveragedEtfDrawdownDataset,
} from "../components/research/LeveragedEtfDrawdownComparison"
import CompanyContext from '../components/research/CompanyContext'


// ============================================================================
// TNI STOCK ANNUAL RETURNS — SHARED STOCK ADAPTER
//
// Purpose:
// - Render any stock through TNI's shared annual-return research engine.
// - Automatically compare every stock with the S&P 500.
// - Keep stock pages configuration-driven rather than page-specific.
// ============================================================================

type StockAnnualReturnsPageProps = {
  config: AnnualReturnsAssetConfig
  dataset: AnnualReturnsPageData
  returnMethodsData?: ReturnMethodRow[]
  drawdownData?: LeveragedEtfDrawdownDataset
}


const benchmarkDataset =
  sp500AnnualReturns as AnnualReturnsPageData


export default function StockAnnualReturnsPage({
  config,
  dataset,
  returnMethodsData,
  drawdownData,
}: StockAnnualReturnsPageProps) {
  const effectiveDrawdownData =
    drawdownData ??
    (config.symbol === "BRK.B"
      ? (brkbDrawdowns as LeveragedEtfDrawdownDataset)
      : config.symbol === "NKE"
      ? (nkeDrawdowns as LeveragedEtfDrawdownDataset)
      : config.symbol === "JPM"
        ? (jpmDrawdowns as LeveragedEtfDrawdownDataset)
        : undefined)

  return (
    <GenericAnnualReturnsPage
      config={config}
      dataset={dataset}
      benchmarkDataset={benchmarkDataset}
      benchmarkName="S&P 500"
      finalSection={config.symbol === "BRK.B" ? <BerkshireCashBuybacks /> : undefined}
      introContent={config.symbol === "BRK.B" ? (
        <>
          <p style={{ maxWidth: 900, margin: "18px 0 0", color: "#10233f", fontSize: 18, fontWeight: 700, lineHeight: 1.75 }}>
            Berkshire had a shallower drawdown than the S&amp;P 500 in
            {" "}{brkbMarketEvents.asset_shallower_count} of {brkbMarketEvents.corrections.length}
            {" "}market declines—but a deeper drawdown in {brkbMarketEvents.asset_deeper_count}.
            {brkbMarketEvents.ties > 0 && <> There were {brkbMarketEvents.ties} tied windows.</>}
            {" "}Its defensive reputation doesn&apos;t tell the whole story.
            Compare every qualifying decline, inspect recovery dates, and see which
            periods Berkshire struggled through. Both assets are measured within
            the same S&amp;P 500 peak-to-trough windows.
          </p>
          <aside
            id="brkb-prediction-lab"
            aria-labelledby="brkb-prediction-lab-title"
            style={{
              marginTop: 24,
              padding: "clamp(20px, 4vw, 30px)",
              borderRadius: 16,
              border: "2px solid #08776d",
              background: "#edf8f4",
              color: "#10233f",
            }}
          >
            <p style={{ margin: "0 0 10px", color: "#075e53", fontSize: 13, fontWeight: 850, letterSpacing: "0.05em" }}>
              TNI MINI LAB
            </p>
            <h2
              id="brkb-prediction-lab-title"
              style={{
                margin: "0 0 12px",
                color: "#10233f",
                fontSize: "clamp(23px, 3vw, 30px)",
                fontWeight: 850,
                lineHeight: 1.25,
              }}
            >
              What&apos;s your call on the market?
            </h2>
            <p style={{ margin: "0 0 18px", maxWidth: 760, color: "#17384c", fontSize: 17, fontWeight: 700, lineHeight: 1.65 }}>
              Vote up, flat, or down. Reveal TNI&apos;s outlook, then replay
              recorded market moves in the interactive Mini Lab.
            </p>
            <a
              href="/#prediction-lab"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 50,
                maxWidth: "100%",
                boxSizing: "border-box",
                padding: "14px 20px",
                borderRadius: 10,
                background: "#075e53",
                color: "#ffffff",
                fontSize: 17,
                fontWeight: 850,
                lineHeight: 1.4,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Try the Mini Lab →
            </a>
            <p style={{ margin: "12px 0 0", color: "#17384c", fontSize: 14, fontWeight: 750, lineHeight: 1.5 }}>
              Explore SPY, QQQ and IWM. No account needed for the Mini Lab.
            </p>
          </aside>
          <nav aria-label="Berkshire research sections" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
            <a href="#brkb-market-declines" style={{ color: "#174fa6", fontWeight: 800, fontSize: 16, padding: "10px 0" }}>Compare market declines</a>
            <a href="#brkb-drawdown-recovery" style={{ color: "#174fa6", fontWeight: 800, fontSize: 16, padding: "10px 0" }}>Explore recovery</a>
            <a href="#brkb-return-research" style={{ color: "#174fa6", fontWeight: 800, fontSize: 16, padding: "10px 0" }}>View returns</a>
            <a href="#brkb-cash-buybacks" style={{ color: "#174fa6", fontWeight: 800, fontSize: 16, padding: "10px 0" }}>Cash &amp; buybacks</a>
          </nav>
        </>
      ) : config.symbol === "NVDA" ? (
        <>
          <p style={{ maxWidth: 900, margin: "18px 0 0", color: "#10233f", fontSize: 18, fontWeight: 700, lineHeight: 1.75 }}>
            How deep have NVIDIA&apos;s losses been, and how long did recovery take?
            Compare NVDA and the S&amp;P 500 through market declines, follow the
            recovery from NVIDIA&apos;s deepest drawdown, and explore annual returns
            from {config.startYear} through {dataset.current_year.year}.
          </p>
          <aside
            aria-label="NVIDIA market intelligence tools"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 16,
              marginTop: 24,
            }}
          >
            <a
              href="/#prediction-lab"
              style={{
                display: "block",
                padding: 20,
                border: "2px solid #075e53",
                borderRadius: 12,
                background: "#edf8f4",
                color: "#10233f",
                textDecoration: "none",
              }}
            >
              <strong style={{ display: "block", fontSize: 20, fontWeight: 800 }}>
                Mini Prediction Lab →
              </strong>
              <span style={{ display: "block", marginTop: 10, fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}>
                Vote on SPY, QQQ or IWM, reveal TNI&apos;s outlook, and replay recorded market moves.
              </span>
            </a>
            <a
              href="https://app.tradingninvestment.com/live/news"
              style={{
                display: "block",
                padding: 20,
                border: "2px solid #174fa6",
                borderRadius: 12,
                background: "#f2f6ff",
                color: "#10233f",
                textDecoration: "none",
              }}
            >
              <strong style={{ display: "block", fontSize: 20, fontWeight: 800 }}>
                TNI News Agent →
              </strong>
              <span style={{ display: "block", marginTop: 10, fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}>
                Explore company and market news for context on earnings, risks, and stock-price moves.
              </span>
            </a>
          </aside>
          <nav aria-label="NVIDIA research sections" style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 20, fontSize: 16, fontWeight: 800 }}>
            <a href="#nvda-drawdown-recovery" style={{ color: "#174fa6", padding: "10px 0" }}>Drawdowns &amp; recovery</a>
            <a href="#nvda-return-research" style={{ color: "#174fa6", padding: "10px 0" }}>Returns &amp; data</a>
          </nav>
        </>
      ) : undefined}
      afterIntroduction={config.symbol === "BRK.B" ? (
        <>
          <div id="brkb-market-declines" style={{ scrollMarginTop: 100 }}>
            <BerkshireMarketDrawdowns />
          </div>
          {effectiveDrawdownData && (
            <div id="brkb-drawdown-recovery" style={{ scrollMarginTop: 100 }}>
              <LeveragedEtfDrawdownComparison dataset={effectiveDrawdownData} />
            </div>
          )}
          <section id="brkb-return-research" aria-labelledby="brkb-return-research-title" style={{ scrollMarginTop: 100, margin: "36px 0 24px", color: "#10233f" }}>
            <h2 id="brkb-return-research-title" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3 }}>
              Did downside resilience translate into better long-term returns?
            </h2>
            <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.75 }}>
              Drawdowns show the losses along the way. Use the return comparisons,
              growth charts and annual history below to assess Berkshire&apos;s performance
              over your investment horizon.
            </p>
          </section>
        </>
      ) : config.symbol === "NVDA" && effectiveDrawdownData ? (
        <>
          <div id="nvda-drawdown-recovery" style={{ scrollMarginTop: 100 }}>
            <LeveragedEtfDrawdownComparison dataset={effectiveDrawdownData} />
          </div>
          <section id="nvda-return-research" aria-labelledby="nvda-return-research-title" style={{ scrollMarginTop: 100, margin: "36px 0 24px", color: "#10233f" }}>
            <h2 id="nvda-return-research-title" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3 }}>NVIDIA returns by year and long-term performance</h2>
            <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.75 }}>
              Explore annual price returns, compare NVIDIA with the S&amp;P 500,
              and download the annual return data below. The drawdown section
              uses NVIDIA adjusted closing prices, which account for stock splits
              and dividends. Annual price returns exclude dividends.
            </p>
          </section>
        </>
      ) : undefined}
      afterBenchmarkComparison={
        config.symbol !== "NKE" && config.symbol !== "BRK.B" && config.symbol !== "NVDA" && effectiveDrawdownData ? (
          <LeveragedEtfDrawdownComparison dataset={effectiveDrawdownData} />
        ) : undefined
      }
      beforeAnnualChart={
        config.symbol === "NKE" && effectiveDrawdownData ? (
          <LeveragedEtfDrawdownComparison dataset={effectiveDrawdownData} />
        ) : undefined
      }
      afterArticle={
        <AnnualReturnsFAQ
          config={config}
          dataset={dataset}
        />
      }
      beforeGrowthExplorer={
        config.companyContext ? (
          <CompanyContext context={config.companyContext} />
        ) : undefined
      }
      beforeReturnExplorer={
        returnMethodsData?.length ? (
          <>
            <StockTotalReturnComparison
              assetTicker={config.symbol}
              assetData={returnMethodsData}
            />
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
