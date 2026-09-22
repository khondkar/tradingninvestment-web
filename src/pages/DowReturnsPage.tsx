import dowAnnualReturns from "../data/charts/dowAnnualReturns.json"
import dowHistoricalPrices from "../data/charts/dowHistoricalPrices.json"
import dowHistoricalAnnotations from "../data/charts/dowHistoricalAnnotations.json"

import { dowAnnualReturnsConfig } from "../research/annual-returns/dow"
import type { AnnualReturnsPageData } from "../research/annual-returns/pageShared"
import type {
  TNIHistoricalPricePoint,
  TNIHistoricalPriceAnnotation,
} from "../charts/tni/tniChartTypes"

import GenericAnnualReturnsPage from "../templates/GenericAnnualReturnsPage"
import GenericHistoricalPriceChart from "../templates/GenericHistoricalPriceChart"
import DowHistoricalReturnsFAQ from "../components/research/DowHistoricalReturnsFAQ"

const dataset =
  dowAnnualReturns as AnnualReturnsPageData

const historicalPriceData =
  dowHistoricalPrices.data as TNIHistoricalPricePoint[]

const historicalAnnotations =
  dowHistoricalAnnotations as TNIHistoricalPriceAnnotation[]

export default function DowReturnsPage() {
  return (
    <GenericAnnualReturnsPage
      config={dowAnnualReturnsConfig}
      dataset={dataset}
      beforeReturnExplorer={
        <section
          style={{
            marginBottom: "30px",
            padding: "22px",
            border: "1px solid #e4ebf3",
            borderRadius: "14px",
            background: "#ffffff",
          }}
        >
          <GenericHistoricalPriceChart
            data={historicalPriceData}
            config={{
              id: "dow-jones-historical-price-chart",
              title: "Dow Jones Historical Chart: 1921–2026",
              subtitle:
                "Long-term Dow Jones price history. Logarithmic scale.",
              symbol: "^DJI",
              metricLabel: "Dow Jones",
              branding: {
                brandName: "TradingNInvestment",
                watermarkText:
                  "TradingNInvestment.com | TNI Research",
                sourceLabel:
                  "TNI historical data (1921–1991); Yahoo Finance (^DJI) (1992–present)",
              },
              height: 600,
              useLogScale: true,
              showWatermark: true,
              showSource: true,
              annotations: historicalAnnotations,
            }}
          />
        </section>
      }
      afterMethodology={
        <DowHistoricalReturnsFAQ
          dataset={dataset}
          prices={historicalPriceData}
        />
      }
    />
  )
}
