import nvdaAnnualReturns from "../../data/charts/nvdaAnnualReturns.json"
import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

// ============================================================================
// TNI NVDA ANNUAL RETURNS — ASSET CONFIGURATION
// ============================================================================

export const nvdaAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "NVDA",
  slug: "nvda-returns",
  name: "NVIDIA",
  shortName: "NVIDIA",
  startYear: 2000,
  author: kamalResearchAuthor,
  canonicalPath: "/nvda-returns/",
  embedPath: "/embed/nvda-returns/",
  csvPath: "/data/nvda-annual-returns.csv",
  returnType: "NVIDIA Price Return",
  sourceLabel: "Yahoo Finance — NVIDIA Corporation (NVDA)",
  categories: ["stock", "sp500", "nasdaq", "djia"],
  newsSymbols: ["NVDA"],
  chart: {
    id: "nvda-historical-annual-returns",
    title: "NVIDIA Historical Annual Returns by Year",
    rangeSubtitleSuffix: "Interactive NVIDIA price-return history.",
    metricLabel: "Annual price return",
    positiveLabel: "Positive year",
    negativeLabel: "Negative year",
    height: 540,
  },
  seo: {
    socialImage: "/images/social/nvda-sp500-drawdown-og.png",
    title: `NVIDIA (NVDA) Returns, Drawdowns & Recovery, 2000–${nvdaAnnualReturns.current_year.year} | Charts & Data`,
    h1: `NVIDIA (NVDA) Returns, Drawdowns & Recovery, 2000–${nvdaAnnualReturns.current_year.year}`,
    description: `Explore NVIDIA returns, drawdowns and recovery times from 2000–${nvdaAnnualReturns.current_year.year}. Compare NVDA with the S&P 500 using interactive charts and download annual return data.`,
    socialTitle: "NVIDIA Returns, Drawdowns & Recovery vs. S&P 500",
    socialDescription: `How deep were NVIDIA’s biggest losses, and how long did recovery take? Explore NVDA vs. S&P 500 drawdowns and annual returns from 2000–${nvdaAnnualReturns.current_year.year}.`,
  },
}
