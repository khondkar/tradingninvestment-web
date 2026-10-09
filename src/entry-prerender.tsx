import { renderToStaticMarkup } from 'react-dom/server'

import sp500AnnualReturns from './data/charts/sp500AnnualReturns.json'
import dowAnnualReturns from './data/charts/dowAnnualReturns.json'
import nasdaqAnnualReturns from './data/charts/nasdaqAnnualReturns.json'
import sp500MonthlyReturns from './data/charts/sp500MonthlyReturns.json'
import nasdaqMetadata from './data/market/nasdaq/metadata.json'
import sp500Metadata from './data/market/sp500/metadata.json'

import { sp500AnnualReturnsConfig } from './research/annual-returns/sp500'
import { dowAnnualReturnsConfig } from './research/annual-returns/dow'
import { nasdaqAnnualReturnsConfig } from './research/annual-returns/nasdaq'
import { publishedAnnualReturnsResearchRegistry } from './research/annual-returns/registry'
import { getStockResearchData } from './research/annual-returns/stockDataRegistry'
import { getEtfResearchData } from './research/annual-returns/etfDataRegistry'
import { getLeveragedEtfResearchData } from './research/annual-returns/leveragedEtfDataRegistry'
import { sp500MonthlyReturnsConfig } from './research/monthly-returns/sp500'

import type { AnnualReturnsPageData } from './research/annual-returns/pageShared'
import type { AnnualReturnsAssetConfig } from './research/annual-returns/types'
import type { MonthlyReturnsDataset } from './research/monthly-returns/types'

import GenericAnnualReturnsPage from './templates/GenericAnnualReturnsPage'
import StockAnnualReturnsPage from './templates/StockAnnualReturnsPage'
import LeveragedEtfAnnualReturnsPage from './templates/LeveragedEtfAnnualReturnsPage'
import EtfAnnualReturnsPage from './templates/EtfAnnualReturnsPage'
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

const indexResearchData: Record<
  string,
  AnnualPrerenderPage
> = {
  "^DJI": {
    config: dowAnnualReturnsConfig,
    dataset: dowAnnualReturns as AnnualReturnsPageData,
  },
  "^GSPC": {
    config: sp500AnnualReturnsConfig,
    dataset: sp500AnnualReturns as AnnualReturnsPageData,
  },
  "^IXIC": {
    config: nasdaqAnnualReturnsConfig,
    dataset: nasdaqAnnualReturns as AnnualReturnsPageData,
    benchmarkDataset: sp500AnnualReturns as AnnualReturnsPageData,
    benchmarkName: "S&P 500",
    assetAsOfDate: nasdaqMetadata.last_date,
    benchmarkAsOfDate: sp500Metadata.last_date,
  },
}

function resolveAnnualPrerenderPage(
  config: AnnualReturnsAssetConfig,
): AnnualPrerenderPage {
  const symbol = config.symbol

  if (config.categories.includes("leveraged-etf")) {
    const data = getLeveragedEtfResearchData(symbol)
    if (!data) {
      throw new Error(`Missing leveraged ETF data: ${symbol}`)
    }
    return {
      config,
      dataset: data.annualReturns,
      benchmarkDataset: data.benchmarkAnnualReturns,
      benchmarkName: data.benchmarkName,
      returnMethodsData: data.returnMethods,
      drawdownData: data.drawdownData,
    }
  }

  if (config.categories.includes("etf")) {
    const data = getEtfResearchData(symbol)
    if (!data) {
      throw new Error(`Missing ETF data: ${symbol}`)
    }
    const benchmark = getEtfResearchData("SPY")
    return {
      config,
      dataset: data.annualReturns,
      benchmarkDataset:
        symbol === "QQQ" ? benchmark?.annualReturns : undefined,
      benchmarkName: symbol === "QQQ" ? "SPY" : undefined,
      returnMethodsData: data.returnMethods,
    }
  }

  if (config.categories.includes("stock")) {
    const data = getStockResearchData(symbol)
    if (!data) {
      throw new Error(`Missing stock data: ${symbol}`)
    }
    return {
      config,
      dataset: data.annualReturns,
      benchmarkDataset: sp500AnnualReturns as AnnualReturnsPageData,
      benchmarkName: "S&P 500",
      returnMethodsData: data.returnMethods,
      drawdownData: data.drawdownData,
    }
  }

  const indexData = indexResearchData[symbol]
  if (!indexData) {
    throw new Error(`Missing index data: ${symbol}`)
  }
  return { ...indexData, config }
}

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

  if (
    page.returnMethodsData &&
    page.config.categories.includes('etf') &&
    !page.config.categories.includes('leveraged-etf')
  ) {
    return renderToStaticMarkup(
      <EtfAnnualReturnsPage
        benchmarkDataset={page.benchmarkDataset}
        config={page.config}
        dataset={page.dataset}
        returnMethodsData={page.returnMethodsData}
      />,
    )
  }

  if (page.returnMethodsData) {
    return renderToStaticMarkup(
      <StockAnnualReturnsPage
        config={page.config}
        dataset={page.dataset}
        returnMethodsData={page.returnMethodsData}
        drawdownData={page.drawdownData}
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

// Only generate static HTML for research whose publication time has arrived.
export const annualPrerenderPages: AnnualPrerenderPage[] =
  publishedAnnualReturnsResearchRegistry.map(
    (entry) => resolveAnnualPrerenderPage(entry.config),
  )

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
