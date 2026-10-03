import tqqqAnnualReturns from "../../data/charts/tqqqAnnualReturns.json"
import tqqqReturnMethods from "../../data/charts/tqqqReturnMethods.json"
import qqqAnnualReturns from "../../data/charts/qqqAnnualReturns.json"
import tqqqVsQqqDrawdowns from "../../data/charts/tqqqVsQqqDrawdowns.json"

import nvdlAnnualReturns from "../../data/charts/nvdlAnnualReturns.json"
import nvdlReturnMethods from "../../data/charts/nvdlReturnMethods.json"
import nvdaAnnualReturns from "../../data/charts/nvdaAnnualReturns.json"
import nvdlVsNvdaDrawdowns from "../../data/charts/nvdlVsNvdaDrawdowns.json"

import type {
  AnnualReturnsPageData,
} from "./pageShared"

import type {
  ReturnMethodRow,
} from "../../components/charts/DividendCompoundingExplorer"

import type {
  LeveragedEtfDrawdownDataset,
} from "../../components/research/LeveragedEtfDrawdownComparison"


export type LeveragedEtfResearchData = {
  annualReturns: AnnualReturnsPageData
  returnMethods?: ReturnMethodRow[]
  benchmarkAnnualReturns: AnnualReturnsPageData
  benchmarkName: string
  drawdownData?: LeveragedEtfDrawdownDataset
}


export const leveragedEtfResearchDataRegistry:
  Record<string, LeveragedEtfResearchData> = {
    TQQQ: {
      annualReturns:
        tqqqAnnualReturns as AnnualReturnsPageData,

      returnMethods:
        tqqqReturnMethods.data as ReturnMethodRow[],

      benchmarkAnnualReturns:
        qqqAnnualReturns as AnnualReturnsPageData,

      benchmarkName:
        "QQQ",

      drawdownData:
        tqqqVsQqqDrawdowns as LeveragedEtfDrawdownDataset,
    },
    NVDL: {
      annualReturns:
        nvdlAnnualReturns as AnnualReturnsPageData,

      returnMethods:
        nvdlReturnMethods.data as ReturnMethodRow[],

      benchmarkAnnualReturns:
        nvdaAnnualReturns as AnnualReturnsPageData,

      benchmarkName:
        "NVDA",

      drawdownData:
        nvdlVsNvdaDrawdowns as LeveragedEtfDrawdownDataset,
    },
  }


export function getLeveragedEtfResearchData(
  symbol: string,
): LeveragedEtfResearchData | undefined {
  return leveragedEtfResearchDataRegistry[symbol]
}
