import nvdaAnnualReturns from "../data/charts/nvdaAnnualReturns.json"
import { nvdaAnnualReturnsConfig } from "../research/annual-returns/nvda"
import type { AnnualReturnsPageData } from "../research/annual-returns/pageShared"
import StockAnnualReturnsPage from "../templates/StockAnnualReturnsPage"
import nvdaDrawdowns from "../data/charts/nvdaVsSp500Drawdowns.json"
import type { LeveragedEtfDrawdownDataset } from "../components/research/LeveragedEtfDrawdownComparison"

// ============================================================================
// TNI NVDA RETURNS PAGE — GENERIC ANNUAL RETURNS ADAPTER
// ============================================================================

const dataset =
  nvdaAnnualReturns as AnnualReturnsPageData

export default function NVDAReturnsPage() {
  return (
    <StockAnnualReturnsPage
      config={nvdaAnnualReturnsConfig}
      dataset={dataset}
      drawdownData={nvdaDrawdowns as LeveragedEtfDrawdownDataset}
    />
  )
}
