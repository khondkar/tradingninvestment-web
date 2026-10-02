import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

// ============================================================================
// TNI APPLE ANNUAL RETURNS — ASSET CONFIGURATION
//
// Search intent:
// - Apple stock returns
// - AAPL stock returns
// - Apple historical returns
// - AAPL 5 year return
// - AAPL total return
//
// Uses TNI's shared annual-return research engine.
// ============================================================================

export const aaplAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "AAPL",
  slug: "aapl-stock-yearly-return",
  name: "Apple Inc.",
  shortName: "Apple",
  startYear: 1981,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "APPLE STOCK INTELLIGENCE",

  canonicalPath:
    "/aapl-stock-yearly-return/",

  embedPath:
    "/embed/aapl-stock-yearly-return/",

  csvPath:
    "/data/aapl-annual-returns.csv",

  returnType:
    "Apple Price Return",

  sourceLabel:
    "Yahoo Finance — Apple Inc. (AAPL)",

  categories: [
    "stock",
    "sp500",
    "nasdaq",
    "djia",
  ],

  newsSymbols: [
    "AAPL",
  ],

  chart: {
    id:
      "aapl-historical-annual-returns",

    title:
      "Apple (AAPL) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive Apple stock price-return history.",

    metricLabel:
      "Annual price return",

    positiveLabel:
      "Positive year",

    negativeLabel:
      "Negative year",

    height: 540,
  },

  seo: {
    title:
      "Apple (AAPL) Stock Returns: Historical & 5-Year Performance",

    socialTitle:
      "Apple (AAPL) Stock Returns",

    socialDescription:
      "Explore Apple (AAPL) stock returns by year, historical performance, 5-year and 10-year returns, positive and negative years, major gains and declines, current-year performance, and comparison with the S&P 500.",

    socialImage:
      "/images/social/aapl-stock-intelligence-og.png",
  },
}
