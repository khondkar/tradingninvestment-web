import { renderToStaticMarkup } from 'react-dom/server'

import sp500AnnualReturns from './data/charts/sp500AnnualReturns.json'
import msftAnnualReturns from './data/charts/msftAnnualReturns.json'
import nasdaqAnnualReturns from './data/charts/nasdaqAnnualReturns.json'
import nvdaAnnualReturns from './data/charts/nvdaAnnualReturns.json'
import sp500MonthlyReturns from './data/charts/sp500MonthlyReturns.json'
import nasdaqMetadata from './data/market/nasdaq/metadata.json'
import sp500Metadata from './data/market/sp500/metadata.json'

import { sp500AnnualReturnsConfig } from './research/annual-returns/sp500'
import { msftAnnualReturnsConfig } from './research/annual-returns/msft'
import { nasdaqAnnualReturnsConfig } from './research/annual-returns/nasdaq'
import { nvdaAnnualReturnsConfig } from './research/annual-returns/nvda'
import { sp500MonthlyReturnsConfig } from './research/monthly-returns/sp500'

import type { AnnualReturnsPageData } from './research/annual-returns/pageShared'
import type { AnnualReturnsAssetConfig } from './research/annual-returns/types'
import type { MonthlyReturnsDataset } from './research/monthly-returns/types'

import GenericAnnualReturnsPage from './templates/GenericAnnualReturnsPage'
import GenericMonthlyReturnsPage from './templates/GenericMonthlyReturnsPage'

export type AnnualPrerenderPage = {
  config: AnnualReturnsAssetConfig
  dataset: AnnualReturnsPageData
  benchmarkDataset?: AnnualReturnsPageData
  benchmarkName?: string
  assetAsOfDate?: string
  benchmarkAsOfDate?: string
}

export const annualPrerenderPages: AnnualPrerenderPage[] = [
  {
    config: sp500AnnualReturnsConfig,
    dataset: sp500AnnualReturns as AnnualReturnsPageData,
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
]

export function renderAnnualPage(page: AnnualPrerenderPage) {
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
