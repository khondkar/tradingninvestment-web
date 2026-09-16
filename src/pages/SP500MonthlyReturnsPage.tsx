// ============================================================================
// TNI S&P 500 MONTHLY RETURNS — THIN PAGE ADAPTER
//
// Purpose:
// - Supply verified S&P 500 monthly-return data.
// - Supply S&P 500 monthly-return configuration.
// - Delegate rendering to GenericMonthlyReturnsPage.
// ============================================================================

import sp500MonthlyReturns from "../data/charts/sp500MonthlyReturns.json"

import {
  sp500MonthlyReturnsConfig,
} from "../research/monthly-returns/sp500"

import type {
  MonthlyReturnsDataset,
} from "../research/monthly-returns/types"

import GenericMonthlyReturnsPage from "../templates/GenericMonthlyReturnsPage"


const dataset =
  sp500MonthlyReturns as MonthlyReturnsDataset


export default function SP500MonthlyReturnsPage() {
  return (
    <GenericMonthlyReturnsPage
      config={sp500MonthlyReturnsConfig}
      dataset={dataset}
    />
  )
}
