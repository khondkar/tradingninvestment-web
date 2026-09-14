// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — THIN PAGE ADAPTER
//
// Purpose:
// - Preserve the existing /sp-500-returns/ route.
// - Supply verified S&P 500 configuration and annual-return data.
// - Delegate page rendering to GenericAnnualReturnsPage.
// ============================================================================

import sp500AnnualReturns from "../data/charts/sp500AnnualReturns.json"

import { sp500AnnualReturnsConfig } from "../research/annual-returns/sp500"

import type {
  AnnualReturnsPageData,
} from "../research/annual-returns/pageShared"

import GenericAnnualReturnsPage from "../templates/GenericAnnualReturnsPage"

// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — VERIFIED PAGE DATA
// ============================================================================

const dataset =
  sp500AnnualReturns as AnnualReturnsPageData

// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — ROUTE COMPONENT
// ============================================================================

export default function SP500ReturnsPage() {
  return (
    <GenericAnnualReturnsPage
      config={
        sp500AnnualReturnsConfig
      }
      dataset={
        dataset
      }
    />
  )
}
