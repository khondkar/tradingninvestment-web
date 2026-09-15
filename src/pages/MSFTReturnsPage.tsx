import msftAnnualReturns from "../data/charts/msftAnnualReturns.json"

import {
  msftAnnualReturnsConfig,
} from "../research/annual-returns/msft"

import type {
  AnnualReturnsPageData,
} from "../research/annual-returns/pageShared"

import GenericAnnualReturnsPage from "../templates/GenericAnnualReturnsPage"


// ============================================================================
// TNI MICROSOFT STOCK RETURNS — GENERIC ANNUAL RETURNS ADAPTER
//
// Purpose:
// - Preserve /msft-stock-returns/ as Microsoft's canonical research URL.
// - Supply verified Microsoft annual-return data.
// - Delegate rendering and calculations to GenericAnnualReturnsPage.
// ============================================================================

const dataset =
  msftAnnualReturns as AnnualReturnsPageData


// ============================================================================
// TNI MICROSOFT STOCK RETURNS — ROUTE COMPONENT
// ============================================================================

export default function MSFTReturnsPage() {
  return (
    <GenericAnnualReturnsPage
      config={msftAnnualReturnsConfig}
      dataset={dataset}
    />
  )
}
