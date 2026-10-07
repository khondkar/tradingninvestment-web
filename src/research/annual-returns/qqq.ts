import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

// ============================================================================
// TNI QQQ ANNUAL RETURNS — ASSET CONFIGURATION
// ============================================================================

export const qqqAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "QQQ",
  slug: "qqq-returns",
  name: "Invesco QQQ Trust",
  shortName: "QQQ",
  startYear: 2000,
  author: kamalResearchAuthor,

  canonicalPath: "/qqq-returns/",
  embedPath: "/embed/qqq-returns/",
  csvPath: "/data/qqq-annual-returns.csv",

  returnType: "QQQ Price Return",

  sourceLabel:
    "Yahoo Finance — Invesco QQQ Trust (QQQ)",

  categories: ["etf", "nasdaq"],

  newsSymbols: ["QQQ"],

  chart: {
    id: "qqq-historical-annual-returns",

    title:
      "QQQ Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive QQQ price-return history.",

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
      "QQQ Returns: Historical Annual Returns by Year",

    socialTitle:
      "QQQ Historical Returns by Year",

    socialDescription:
      "Explore QQQ historical annual returns, performance by year, positive and negative years, major gains and declines, and current-year performance.",
  },
}
