// ============================================================================
// TNI ANNUAL RETURNS — DOW JONES ASSET CONFIGURATION
// ============================================================================

import type { AnnualReturnsAssetConfig } from "./types"

export const dowAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "^DJI",
  slug: "stock-market-historical-returns",
  name: "Dow Jones Industrial Average",
  shortName: "Dow Jones",
  startYear: 1921,

  intelligenceEyebrow:
    "DOW JONES INTELLIGENCE",

  canonicalPath: "/stock-market-historical-returns/",
  embedPath: "/embed/stock-market-historical-returns/",
  csvPath: "/data/dow-annual-returns.csv",

  returnType: "Dow Jones Industrial Average Price Return",
  sourceLabel:
    "TNI historical data (1921–1992); Yahoo Finance — Dow Jones Industrial Average (^DJI) (1993–present)",
  categories: ["index", "dow"],
  newsSymbols: ["DIA", "^DJI"],

  chart: {
    id: "dow-jones-historical-annual-returns",
    title: "Dow Jones Historical Annual Returns by Year",
    rangeSubtitleSuffix:
      "Interactive Dow Jones price-return history.",
    metricLabel: "Annual price return",
    positiveLabel: "Positive year",
    negativeLabel: "Negative year",
    height: 540,
  },

  seo: {
    title:
      "Stock Market Historical Returns: 100+ Years of Dow Jones Returns",
    socialTitle:
      "Stock Market Historical Returns: Dow Jones Returns by Year (1921–2026)",
    socialDescription:
      "Dow Jones historical returns by year from 1921 to present, including 1-year, 3-year, 5-year, 10-year and 20-year performance, average returns, positive and negative years, and 2026 YTD performance.",
    socialImage:
      "/images/social/stock-market-historical-returns-og.png",
  },
} as const
