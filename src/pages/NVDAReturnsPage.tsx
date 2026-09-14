import nvdaAnnualReturns from "../data/charts/nvdaAnnualReturns.json"
import { nvdaAnnualReturnsConfig } from "../research/annual-returns/nvda"
import type { AnnualReturnsPageData } from "../research/annual-returns/pageShared"
import GenericAnnualReturnsPage from "../templates/GenericAnnualReturnsPage"

// ============================================================================
// TNI NVDA RETURNS PAGE — GENERIC ANNUAL RETURNS ADAPTER
// ============================================================================

const dataset =
  nvdaAnnualReturns as AnnualReturnsPageData

export default function NVDAReturnsPage() {
  return (
    <GenericAnnualReturnsPage
      config={nvdaAnnualReturnsConfig}
      dataset={dataset}
    />
  )
}
