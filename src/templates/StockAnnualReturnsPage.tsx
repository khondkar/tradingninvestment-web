import sp500AnnualReturns from "../data/charts/sp500AnnualReturns.json"

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
}


const benchmarkDataset =
  sp500AnnualReturns as AnnualReturnsPageData


export default function StockAnnualReturnsPage({
  config,
  dataset,
  returnMethodsData,
}: StockAnnualReturnsPageProps) {
  return (
    <GenericAnnualReturnsPage
      config={config}
      dataset={dataset}
      benchmarkDataset={benchmarkDataset}
      benchmarkName="S&P 500"
      afterArticle={
        <AnnualReturnsFAQ
          config={config}
          dataset={dataset}
        />
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
