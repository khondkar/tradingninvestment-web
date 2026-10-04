import { renderToStaticMarkup } from 'react-dom/server'

import sp500AnnualReturns from './data/charts/sp500AnnualReturns.json'
import dowAnnualReturns from './data/charts/dowAnnualReturns.json'
import msftAnnualReturns from './data/charts/msftAnnualReturns.json'
import nasdaqAnnualReturns from './data/charts/nasdaqAnnualReturns.json'
import nvdaAnnualReturns from './data/charts/nvdaAnnualReturns.json'
import aaplAnnualReturns from './data/charts/aaplAnnualReturns.json'
import aaplReturnMethods from './data/charts/aaplReturnMethods.json'
import brkbAnnualReturns from './data/charts/brkbAnnualReturns.json'
import brkbReturnMethods from './data/charts/brk-bReturnMethods.json'
import gsAnnualReturns from './data/charts/gsAnnualReturns.json'
import googlAnnualReturns from './data/charts/googlAnnualReturns.json'
import googlReturnMethods from './data/charts/googlReturnMethods.json'
import gsReturnMethods from './data/charts/gsReturnMethods.json'
import tslaAnnualReturns from './data/charts/tslaAnnualReturns.json'
import tslaReturnMethods from './data/charts/tslaReturnMethods.json'
import tqqqAnnualReturns from './data/charts/tqqqAnnualReturns.json'
import tqqqReturnMethods from './data/charts/tqqqReturnMethods.json'
import tqqqVsQqqDrawdowns from './data/charts/tqqqVsQqqDrawdowns.json'
import qqqAnnualReturns from './data/charts/qqqAnnualReturns.json'
import nvdlAnnualReturns from './data/charts/nvdlAnnualReturns.json'
import nvdlReturnMethods from './data/charts/nvdlReturnMethods.json'
import nvdlVsNvdaDrawdowns from './data/charts/nvdlVsNvdaDrawdowns.json'
import soxlAnnualReturns from './data/charts/soxlAnnualReturns.json'
import soxlReturnMethods from './data/charts/soxlReturnMethods.json'
import soxlVsSmhDrawdowns from './data/charts/soxlVsSmhDrawdowns.json'
import smhAnnualReturns from './data/charts/smhAnnualReturns.json'
import sp500MonthlyReturns from './data/charts/sp500MonthlyReturns.json'
import nasdaqMetadata from './data/market/nasdaq/metadata.json'
import sp500Metadata from './data/market/sp500/metadata.json'

import { sp500AnnualReturnsConfig } from './research/annual-returns/sp500'
import { dowAnnualReturnsConfig } from './research/annual-returns/dow'
import { msftAnnualReturnsConfig } from './research/annual-returns/msft'
import { nasdaqAnnualReturnsConfig } from './research/annual-returns/nasdaq'
import { nvdaAnnualReturnsConfig } from './research/annual-returns/nvda'
import { aaplAnnualReturnsConfig } from './research/annual-returns/aapl'
import { brkbAnnualReturnsConfig } from './research/annual-returns/brkb'
import { gsAnnualReturnsConfig } from './research/annual-returns/gs'
import { googlAnnualReturnsConfig } from './research/annual-returns/googl'
import { tslaAnnualReturnsConfig } from './research/annual-returns/tsla'
import { tqqqAnnualReturnsConfig } from './research/annual-returns/tqqq'
import { nvdlAnnualReturnsConfig } from './research/annual-returns/nvdl'
import { soxlAnnualReturnsConfig } from './research/annual-returns/soxl'
import { sp500MonthlyReturnsConfig } from './research/monthly-returns/sp500'

import type { AnnualReturnsPageData } from './research/annual-returns/pageShared'
import type { AnnualReturnsAssetConfig } from './research/annual-returns/types'
import type { MonthlyReturnsDataset } from './research/monthly-returns/types'

import GenericAnnualReturnsPage from './templates/GenericAnnualReturnsPage'
import StockAnnualReturnsPage from './templates/StockAnnualReturnsPage'
import LeveragedEtfAnnualReturnsPage from './templates/LeveragedEtfAnnualReturnsPage'
import type { ReturnMethodRow } from './components/charts/DividendCompoundingExplorer'
import type { LeveragedEtfDrawdownDataset } from './components/research/LeveragedEtfDrawdownComparison'
import GenericMonthlyReturnsPage from './templates/GenericMonthlyReturnsPage'
import AverageStockMarketReturnPage from './pages/AverageStockMarketReturnPage'

export type AnnualPrerenderPage = {
  config: AnnualReturnsAssetConfig
  dataset: AnnualReturnsPageData
  benchmarkDataset?: AnnualReturnsPageData
  benchmarkName?: string
  assetAsOfDate?: string
  benchmarkAsOfDate?: string
  returnMethodsData?: ReturnMethodRow[]
  drawdownData?: LeveragedEtfDrawdownDataset
}

export const annualPrerenderPages: AnnualPrerenderPage[] = [
  {
    config: sp500AnnualReturnsConfig,
    dataset: sp500AnnualReturns as AnnualReturnsPageData,
  },
  {
    config: dowAnnualReturnsConfig,
    dataset: dowAnnualReturns as AnnualReturnsPageData,
  },
  {
    config: msftAnnualReturnsConfig,
    dataset: msftAnnualReturns as AnnualReturnsPageData,
  },
  {
    config: nasdaqAnnualReturnsConfig,
    dataset: nasdaqAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: sp500AnnualReturns as AnnualReturnsPageData,
    benchmarkName: 'S&P 500',
    assetAsOfDate: nasdaqMetadata.last_date,
    benchmarkAsOfDate: sp500Metadata.last_date,
  },
  {
    config: nvdaAnnualReturnsConfig,
    dataset: nvdaAnnualReturns as AnnualReturnsPageData,
  },
  {
    config: aaplAnnualReturnsConfig,
    dataset: aaplAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: sp500AnnualReturns as AnnualReturnsPageData,
    benchmarkName: 'S&P 500',
    returnMethodsData:
      aaplReturnMethods.data as ReturnMethodRow[],
  },
  {
    config: brkbAnnualReturnsConfig,
    dataset: brkbAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: sp500AnnualReturns as AnnualReturnsPageData,
    benchmarkName: 'S&P 500',
    returnMethodsData:
      brkbReturnMethods.data as ReturnMethodRow[],
  },
  {
    config: gsAnnualReturnsConfig,
    dataset: gsAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: sp500AnnualReturns as AnnualReturnsPageData,
    benchmarkName: 'S&P 500',
    returnMethodsData:
      gsReturnMethods.data as ReturnMethodRow[],
  },
  {
    config: googlAnnualReturnsConfig,
    dataset: googlAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: sp500AnnualReturns as AnnualReturnsPageData,
    benchmarkName: 'S&P 500',
    returnMethodsData:
      googlReturnMethods.data as ReturnMethodRow[],
  },
  {
    config: tslaAnnualReturnsConfig,
    dataset: tslaAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: sp500AnnualReturns as AnnualReturnsPageData,
    benchmarkName: 'S&P 500',
    returnMethodsData:
      tslaReturnMethods.data as ReturnMethodRow[],
  },
  {
    config: tqqqAnnualReturnsConfig,
    dataset: tqqqAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: qqqAnnualReturns as AnnualReturnsPageData,
    benchmarkName: 'QQQ',
    returnMethodsData:
      tqqqReturnMethods.data as ReturnMethodRow[],
    drawdownData:
      tqqqVsQqqDrawdowns as LeveragedEtfDrawdownDataset,
  },
  {
    config: nvdlAnnualReturnsConfig,
    dataset: nvdlAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: nvdaAnnualReturns as AnnualReturnsPageData,
    benchmarkName: 'NVDA',
    returnMethodsData:
      nvdlReturnMethods.data as ReturnMethodRow[],
    drawdownData:
      nvdlVsNvdaDrawdowns as LeveragedEtfDrawdownDataset,
  },
  {
    config: soxlAnnualReturnsConfig,
    dataset: soxlAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: smhAnnualReturns as AnnualReturnsPageData,
    benchmarkName: 'SMH',
    returnMethodsData:
      soxlReturnMethods.data as ReturnMethodRow[],
    drawdownData:
      soxlVsSmhDrawdowns as LeveragedEtfDrawdownDataset,
  },
]

export function renderAnnualPage(page: AnnualPrerenderPage) {
  if (
    page.returnMethodsData &&
    page.config.categories.includes('leveraged-etf')
  ) {
    return renderToStaticMarkup(
      <LeveragedEtfAnnualReturnsPage
        config={page.config}
        dataset={page.dataset}
        benchmarkDataset={page.benchmarkDataset!}
        benchmarkName={page.benchmarkName ?? 'QQQ'}
        returnMethodsData={page.returnMethodsData}
        drawdownData={page.drawdownData}
      />,
    )
  }

  if (page.returnMethodsData) {
    return renderToStaticMarkup(
      <StockAnnualReturnsPage
        config={page.config}
        dataset={page.dataset}
        returnMethodsData={page.returnMethodsData}
      />,
    )
  }

  return renderToStaticMarkup(
    <GenericAnnualReturnsPage
      config={page.config}
      dataset={page.dataset}
      benchmarkDataset={page.benchmarkDataset}
      benchmarkName={page.benchmarkName}
      assetAsOfDate={page.assetAsOfDate}
      benchmarkAsOfDate={page.benchmarkAsOfDate}
    />,
  )
}

export const monthlyPrerenderPages = [
  {
    config: sp500MonthlyReturnsConfig,
    dataset: sp500MonthlyReturns as MonthlyReturnsDataset,
  },
]

export function renderMonthlyPage(
  page: (typeof monthlyPrerenderPages)[number],
) {
  return renderToStaticMarkup(
    <GenericMonthlyReturnsPage
      config={page.config}
      dataset={page.dataset}
    />,
  )
}


// ============================================================================
// TNI AVERAGE STOCK MARKET RETURN — SSR / STATIC PRERENDER
// ============================================================================

export function renderAverageStockMarketReturnPage() {
  return renderToStaticMarkup(
    <AverageStockMarketReturnPage />,
  )
}
