// ============================================================================
// TNI ANNUAL RETURNS — S&P 500 ASSET CONFIGURATION
// ============================================================================

import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const sp500AnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "^GSPC",
  slug: "sp-500-returns",
  name: "S&P 500",
  shortName: "S&P 500",
  startYear: 1928,
  author: kamalResearchAuthor,

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
    description: "Which index gained more, and how deep were the losses? Compare S&P 500, Dow and Nasdaq returns, then see how far the S&P and Dow fell and when they recovered.",
    title: "S&P 500 Returns & Drawdowns vs. the Dow and Nasdaq",
    socialTitle: "S&P 500 Returns & Drawdowns vs. the Dow and Nasdaq",
    socialDescription: "Which index gained more, and how deep were the losses? Compare S&P 500, Dow and Nasdaq returns, then see how far the S&P and Dow fell and when they recovered.",
    socialImage: "/images/sp500-returns-linkedin.png",
  },
} as const
