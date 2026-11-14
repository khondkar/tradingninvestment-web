// ============================================================================
// TNI Nasdaq Composite MONTHLY RETURNS — THIN PAGE ADAPTER
//
// Purpose:
// - Supply verified Nasdaq Composite monthly-return data.
// - Supply Nasdaq Composite monthly-return configuration.
// - Delegate rendering to GenericMonthlyReturnsPage.
// ============================================================================

import nasdaqMonthlyReturns from "../data/charts/nasdaqMonthlyReturns.json"

import {
  nasdaqMonthlyReturnsConfig,
} from "../research/monthly-returns/nasdaq"

import type {
  MonthlyReturnsDataset,
} from "../research/monthly-returns/types"

import GenericMonthlyReturnsPage from "../templates/GenericMonthlyReturnsPage"


const dataset =
  nasdaqMonthlyReturns as MonthlyReturnsDataset


export default function NasdaqMonthlyReturnsPage() {
  return (
    <GenericMonthlyReturnsPage
      config={nasdaqMonthlyReturnsConfig}
      dataset={dataset}
    />
  )
}
