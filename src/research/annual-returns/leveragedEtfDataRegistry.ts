import tqqqAnnualReturns from "../../data/charts/tqqqAnnualReturns.json"
import tqqqReturnMethods from "../../data/charts/tqqqReturnMethods.json"
import qqqAnnualReturns from "../../data/charts/qqqAnnualReturns.json"
import tqqqVsQqqDrawdowns from "../../data/charts/tqqqVsQqqDrawdowns.json"

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
  }


export function getLeveragedEtfResearchData(
  symbol: string,
): LeveragedEtfResearchData | undefined {
  return leveragedEtfResearchDataRegistry[symbol]
}
