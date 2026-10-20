import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

// ============================================================================
// TNI IWM ANNUAL RETURNS — ASSET CONFIGURATION
// ============================================================================

export const iwmAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "IWM",
  slug: "iwm-returns",
  name: "iShares Russell 2000 ETF",
  shortName: "IWM",
  startYear: 2001,
  author: kamalResearchAuthor,

  canonicalPath: "/iwm-returns/",
  embedPath: "/embed/iwm-returns/",
  csvPath: "/data/iwm-annual-returns.csv",

  returnType: "IWM Price Return",

  sourceLabel:
    "Yahoo Finance — iShares Russell 2000 ETF (IWM)",

  categories: ["etf"],

  newsSymbols: ["IWM"],

  chart: {
    id: "iwm-historical-annual-returns",

    title:
      "IWM Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive IWM price-return history.",

    metricLabel:
      "Annual price return",

    positiveLabel:
      "Positive year",

    negativeLabel:
      "Negative year",

    height: 540,
  },

  seo: {
    socialImage: "/images/social/research/iwm-returns-tni-og.png",
    title:
      "IWM Returns: Historical Annual Returns by Year",

    socialTitle:
      "IWM Historical Returns by Year",

    socialDescription:
      "Explore IWM historical annual returns, performance by year, positive and negative years, major gains and declines, and current-year performance.",
  },
}
