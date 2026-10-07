import qqqAnnualReturns from "../../data/charts/qqqAnnualReturns.json"
import qqqReturnMethods from "../../data/charts/qqqReturnMethods.json"
import spyAnnualReturns from "../../data/charts/spyAnnualReturns.json"
import spyReturnMethods from "../../data/charts/spyReturnMethods.json"

import type {
  AnnualReturnsPageData,
} from "./pageShared"

import type {
  ReturnMethodRow,
} from "../../components/charts/DividendCompoundingExplorer"

// ============================================================================
// TNI STANDARD ETF RESEARCH DATA REGISTRY
// ============================================================================

export type EtfResearchData = {
  annualReturns: AnnualReturnsPageData
  returnMethods?: ReturnMethodRow[]
}

const etfResearchDataRegistry: Record<
  string,
  EtfResearchData
> = {
  QQQ: {
    annualReturns:
      qqqAnnualReturns as AnnualReturnsPageData,

    returnMethods:
      qqqReturnMethods.data as ReturnMethodRow[],
  },

  SPY: {
    annualReturns:
      spyAnnualReturns as AnnualReturnsPageData,

    returnMethods:
      spyReturnMethods.data as ReturnMethodRow[],
  },
}

export function getEtfResearchData(
  symbol: string,
): EtfResearchData | undefined {
  return etfResearchDataRegistry[
    symbol.toUpperCase()
  ]
}
