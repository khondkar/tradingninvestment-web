import nasdaqAnnualReturns from "../data/charts/nasdaqAnnualReturns.json"
import sp500AnnualReturns from "../data/charts/sp500AnnualReturns.json"
import nasdaqMetadata from "../data/market/nasdaq/metadata.json"
import sp500Metadata from "../data/market/sp500/metadata.json"
import { nasdaqAnnualReturnsConfig } from "../research/annual-returns/nasdaq"
import type { AnnualReturnsPageData } from "../research/annual-returns/pageShared"
import GenericAnnualReturnsPage from "../templates/GenericAnnualReturnsPage"

const dataset =
  nasdaqAnnualReturns as AnnualReturnsPageData

const benchmarkDataset =
  sp500AnnualReturns as AnnualReturnsPageData

export default function NasdaqReturnsPage() {
  return (
    <GenericAnnualReturnsPage
      config={nasdaqAnnualReturnsConfig}
      dataset={dataset}
      benchmarkDataset={benchmarkDataset}
      benchmarkName="S&P 500"
      assetAsOfDate={nasdaqMetadata.last_date}
      benchmarkAsOfDate={sp500Metadata.last_date}
    />
  )
}
