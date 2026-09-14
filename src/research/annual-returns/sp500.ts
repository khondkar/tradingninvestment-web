// ============================================================================
// TNI ANNUAL RETURNS — S&P 500 ASSET CONFIGURATION
// ============================================================================

import type { AnnualReturnsAssetConfig } from "./types"

export const sp500AnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "^GSPC",
  slug: "sp-500-returns",
  name: "S&P 500",
  shortName: "S&P 500",
  startYear: 1928,

  canonicalPath: "/sp-500-returns/",
  embedPath: "/embed/sp-500-returns/",
  csvPath: "/data/sp500-annual-returns.csv",

  returnType: "S&P 500 Price Return",
  sourceLabel: "Yahoo Finance — S&P 500 Index (^GSPC)",
  categories: ["index", "sp500"],
  newsSymbols: ["SPY", "SPX", "^GSPC"],

  chart: {
    id: "sp500-historical-annual-returns",
    title: "S&P 500 Historical Annual Returns by Year",
    rangeSubtitleSuffix: "Interactive S&P 500 price-return history.",
    metricLabel: "Annual price return",
    positiveLabel: "Positive year",
    negativeLabel: "Negative year",
    height: 540,
  },

  seo: {
    title: "S&P 500 Returns by Year: 100-Year History & Performance",
    socialTitle: "S&P 500 Returns by Year (1928–2026)",
    socialDescription: "Nearly a century of S&P 500 market history, including annual returns, average return, positive and negative years, and 2026 YTD performance.",
    socialImage: "/images/sp500-returns-linkedin.png",
  },
} as const
