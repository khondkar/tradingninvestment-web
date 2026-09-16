// ============================================================================
// TNI S&P 500 MONTHLY RETURNS — ASSET CONFIG
// ============================================================================

import type {
  MonthlyReturnsAssetConfig,
} from "./types"


export const sp500MonthlyReturnsConfig:
  MonthlyReturnsAssetConfig = {

  symbol: "^GSPC",

  slug: "sp-500-monthly-returns",

  name: "S&P 500",

  shortName: "S&P 500",

  startYear: 1928,

  canonicalPath:
    "/sp-500-monthly-returns/",

  returnType:
    "S&P 500 Monthly Price Return",

  sourceLabel:
    "Yahoo Finance — S&P 500 Index (^GSPC)",

  categories: [
    "index",
    "sp500",
  ],

  newsSymbols: [
    "SPY",
    "SPX",
    "^GSPC",
  ],

  chart: {
    id:
      "sp500-historical-monthly-returns",

    title:
      "S&P 500 Historical Monthly Returns",

    metricLabel:
      "Monthly price return",
  },

  seo: {
    title:
      "S&P 500 Monthly Returns: Historical Returns by Month",

    description:
      "Explore S&P 500 monthly returns from 1928 to the present, including historical returns by month, positive and negative month frequency, average returns, seasonal patterns, and current month performance.",
  },
}
