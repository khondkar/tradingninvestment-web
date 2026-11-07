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
          <nav aria-label="Berkshire research sections" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
            <a href="#brkb-market-declines" style={{ color: "#174fa6", fontWeight: 800, fontSize: 16, padding: "10px 0" }}>Compare market declines</a>
            <a href="#brkb-drawdown-recovery" style={{ color: "#174fa6", fontWeight: 800, fontSize: 16, padding: "10px 0" }}>Explore recovery</a>
            <a href="#brkb-return-research" style={{ color: "#174fa6", fontWeight: 800, fontSize: 16, padding: "10px 0" }}>View returns</a>
            <a href="#brkb-cash-buybacks" style={{ color: "#174fa6", fontWeight: 800, fontSize: 16, padding: "10px 0" }}>Cash &amp; buybacks</a>
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
      ) : undefined}
      afterBenchmarkComparison={
        config.symbol !== "NKE" && config.symbol !== "BRK.B" && effectiveDrawdownData ? (
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
