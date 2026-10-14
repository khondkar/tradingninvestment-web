import jnjAnnualReturns from "../../data/charts/jnjAnnualReturns.json"
import jnjReturnMethods from "../../data/charts/jnjReturnMethods.json"
import msftReturnMethods from "../../data/charts/msftReturnMethods.json"
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
import jnjVsSp500Drawdowns from "../../data/charts/jnjVsSp500Drawdowns.json"
import type { LeveragedEtfDrawdownDataset } from "../../components/research/LeveragedEtfDrawdownComparison"
import nkeAnnualReturns from "../../data/charts/nkeAnnualReturns.json"
import nkeReturnMethods from "../../data/charts/nkeReturnMethods.json"
import jpmAnnualReturns from "../../data/charts/jpmAnnualReturns.json"
import jpmReturnMethods from "../../data/charts/jpmReturnMethods.json"
import msAnnualReturns from "../../data/charts/msAnnualReturns.json"
import msReturnMethods from "../../data/charts/msReturnMethods.json"
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

    NKE: {
      annualReturns: nkeAnnualReturns as AnnualReturnsPageData,
      returnMethods: nkeReturnMethods.data as ReturnMethodRow[],
    },

    JPM: {
      annualReturns: jpmAnnualReturns as AnnualReturnsPageData,
      returnMethods: jpmReturnMethods.data as ReturnMethodRow[],
    },

    MS: {
      annualReturns: msAnnualReturns as AnnualReturnsPageData,
      returnMethods: msReturnMethods.data as ReturnMethodRow[],
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
      returnMethods: msftReturnMethods.data as ReturnMethodRow[],
      annualReturns:
        msftAnnualReturns as AnnualReturnsPageData,
    },

    NVDA: {
      annualReturns:
        nvdaAnnualReturns as AnnualReturnsPageData,
    },
    JNJ: {
      annualReturns: jnjAnnualReturns as AnnualReturnsPageData,
      returnMethods: jnjReturnMethods.data as ReturnMethodRow[],
      drawdownData: jnjVsSp500Drawdowns as LeveragedEtfDrawdownDataset,
    },

  }


export function getStockResearchData(
  symbol: string,
): StockResearchData | undefined {
  return stockResearchDataRegistry[symbol]
}
