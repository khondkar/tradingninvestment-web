import type { AnnualReturnsAssetConfig } from "./types"

// ============================================================================
// TNI MICROSOFT ANNUAL RETURNS — ASSET CONFIGURATION
//
// Search intent:
// - Microsoft stock returns
// - MSFT stock returns
// - Microsoft historical returns
// - MSFT 5 year return
// - MSFT total return
//
// The public page uses TNI's shared annual-return research engine.
// ============================================================================

export const msftAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "MSFT",
  slug: "msft-stock-returns",
  name: "Microsoft Corporation",
  shortName: "Microsoft",
  startYear: 1987,

  // ==========================================================================
  // TNI MICROSOFT — COMPANY INTELLIGENCE IDENTITY
  // ==========================================================================

  intelligenceEyebrow:
    "MICROSOFT STOCK INTELLIGENCE",

  canonicalPath: "/msft-stock-returns/",
  embedPath: "/embed/msft-stock-returns/",
  csvPath: "/data/msft-annual-returns.csv",

  returnType: "Microsoft Price Return",

  sourceLabel:
    "Yahoo Finance — Microsoft Corporation (MSFT)",

  categories: [
    "stock",
    "sp500",
    "nasdaq",
    "djia",
  ],

  newsSymbols: [
    "MSFT",
  ],

  chart: {
    id: "msft-historical-annual-returns",

    title:
      "Microsoft (MSFT) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive Microsoft stock price-return history.",

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
      "Microsoft (MSFT) Stock Returns: Historical & 5-Year Performance",

    socialTitle:
      "Microsoft (MSFT) Stock Returns",

    socialDescription:
      "Explore Microsoft (MSFT) stock returns by year, historical performance, 5-year and 10-year returns, positive and negative years, major gains and declines, and current-year performance.",

    socialImage:
      "/images/msft-annual-stock-returns.png",
  },
}
