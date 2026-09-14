import type { AnnualReturnsAssetConfig } from "./types"

// ============================================================================
// TNI NVDA ANNUAL RETURNS — ASSET CONFIGURATION
// ============================================================================

export const nvdaAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "NVDA",
  slug: "nvda-returns",
  name: "NVIDIA",
  shortName: "NVIDIA",
  startYear: 2000,
  canonicalPath: "/nvda-returns/",
  embedPath: "/embed/nvda-returns/",
  csvPath: "/data/nvda-annual-returns.csv",
  returnType: "NVIDIA Price Return",
  sourceLabel: "Yahoo Finance — NVIDIA Corporation (NVDA)",
  categories: ["stock", "sp500", "nasdaq"],
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
    title: "NVIDIA (NVDA) Returns by Year: Historical Performance",
    socialTitle: "NVIDIA (NVDA) Returns by Year",
    socialDescription: "Explore NVIDIA annual returns, historical performance, positive and negative years, major gains and declines, and current-year performance.",
  },
}
