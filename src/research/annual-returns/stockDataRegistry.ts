import aaplAnnualReturns from "../../data/charts/aaplAnnualReturns.json"
import aaplReturnMethods from "../../data/charts/aaplReturnMethods.json"
import brkbAnnualReturns from "../../data/charts/brkbAnnualReturns.json"
import brkbReturnMethods from "../../data/charts/brk-bReturnMethods.json"
import msftAnnualReturns from "../../data/charts/msftAnnualReturns.json"
import nvdaAnnualReturns from "../../data/charts/nvdaAnnualReturns.json"

import type {
  AnnualReturnsPageData,
} from "./pageShared"

import type {
  ReturnMethodRow,
} from "../../components/charts/DividendCompoundingExplorer"


export type StockResearchData = {
  annualReturns: AnnualReturnsPageData
  returnMethods?: ReturnMethodRow[]
}


export const stockResearchDataRegistry:
  Record<string, StockResearchData> = {
    AAPL: {
      annualReturns:
        aaplAnnualReturns as AnnualReturnsPageData,

      returnMethods:
        aaplReturnMethods.data as ReturnMethodRow[],
    },

    "BRK.B": {
      annualReturns:
        brkbAnnualReturns as AnnualReturnsPageData,

      returnMethods:
        brkbReturnMethods.data as ReturnMethodRow[],
    },

    MSFT: {
      annualReturns:
        msftAnnualReturns as AnnualReturnsPageData,
    },

    NVDA: {
      annualReturns:
        nvdaAnnualReturns as AnnualReturnsPageData,
    },
  }


export function getStockResearchData(
  symbol: string,
): StockResearchData | undefined {
  return stockResearchDataRegistry[symbol]
}
