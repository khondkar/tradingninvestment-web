import aaplAnnualReturns from "../../data/charts/aaplAnnualReturns.json"
import aaplReturnMethods from "../../data/charts/aaplReturnMethods.json"
import brkbAnnualReturns from "../../data/charts/brkbAnnualReturns.json"
import brkbReturnMethods from "../../data/charts/brk-bReturnMethods.json"
import gsAnnualReturns from "../../data/charts/gsAnnualReturns.json"
import gsReturnMethods from "../../data/charts/gsReturnMethods.json"
import googlAnnualReturns from "../../data/charts/googlAnnualReturns.json"
import googlReturnMethods from "../../data/charts/googlReturnMethods.json"
import crmAnnualReturns from "../../data/charts/crmAnnualReturns.json"
import crmReturnMethods from "../../data/charts/crmReturnMethods.json"
import crmVsSp500Drawdowns from "../../data/charts/crmVsSp500Drawdowns.json"
import type { LeveragedEtfDrawdownDataset } from "../../components/research/LeveragedEtfDrawdownComparison"
import amznAnnualReturns from "../../data/charts/amznAnnualReturns.json"
import amznReturnMethods from "../../data/charts/amznReturnMethods.json"
import tslaAnnualReturns from "../../data/charts/tslaAnnualReturns.json"
import tslaReturnMethods from "../../data/charts/tslaReturnMethods.json"
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
  drawdownData?: LeveragedEtfDrawdownDataset
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

    GS: {
      annualReturns:
        gsAnnualReturns as AnnualReturnsPageData,

      returnMethods:
        gsReturnMethods.data as ReturnMethodRow[],
    },

    GOOGL: {
      annualReturns:
        googlAnnualReturns as AnnualReturnsPageData,

      returnMethods:
        googlReturnMethods.data as ReturnMethodRow[],
    },

    AMZN: {
      annualReturns:
        amznAnnualReturns as AnnualReturnsPageData,

      returnMethods:
        amznReturnMethods.data as ReturnMethodRow[],
    },

    CRM: {
      annualReturns:
        crmAnnualReturns as AnnualReturnsPageData,

      returnMethods:
        crmReturnMethods.data as ReturnMethodRow[],
      drawdownData: crmVsSp500Drawdowns as LeveragedEtfDrawdownDataset,
    },

    TSLA: {
      annualReturns:
        tslaAnnualReturns as AnnualReturnsPageData,

      returnMethods:
        tslaReturnMethods.data as ReturnMethodRow[],
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
