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

import AnnualReturnsFAQ from "../components/research/AnnualReturnsFAQ"

// ============================================================================
// TNI STANDARD ETF ANNUAL RETURNS — SHARED ETF ADAPTER
//
// Purpose:
// - Render non-leveraged ETFs through TNI's shared annual-return engine.
// - Support price return vs total return.
// - Support the shared Growth of $10,000 explorer.
// - Keep ETF pages configuration-driven rather than QQQ-specific.
// ============================================================================

type EtfAnnualReturnsPageProps = {
  config: AnnualReturnsAssetConfig
  dataset: AnnualReturnsPageData
  returnMethodsData?: ReturnMethodRow[]
  benchmarkDataset?: AnnualReturnsPageData
}

export default function EtfAnnualReturnsPage({
  config,
  dataset,
  returnMethodsData,
  benchmarkDataset,
}: EtfAnnualReturnsPageProps) {
  return (
    <GenericAnnualReturnsPage
      config={config}
      dataset={dataset}
      benchmarkDataset={
        benchmarkDataset
      }
      benchmarkName={
        benchmarkDataset ? "SPY" : undefined
      }
      assetAsOfDate={
        dataset.current_year.through_date
      }
      benchmarkAsOfDate={
        benchmarkDataset?.current_year.through_date
      }
      afterArticle={
        <AnnualReturnsFAQ
          config={config}
          dataset={dataset}
        />
      }
      beforeReturnExplorer={
        returnMethodsData?.length ? (
          <DividendCompoundingExplorer
            data={returnMethodsData}
            assetName={config.shortName}
          />
        ) : undefined
      }
    />
  )
}
