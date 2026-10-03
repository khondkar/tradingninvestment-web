import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const tslaAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "TSLA",
  slug: "tsla-stock-returns",
  name: "Tesla, Inc.",
  shortName: "Tesla",
  startYear: 2011,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "TESLA STOCK INTELLIGENCE",

  canonicalPath:
    "/tsla-stock-returns/",

  embedPath:
    "/embed/tsla-stock-returns/",

  csvPath:
    "/data/tsla-annual-returns.csv",

  returnType:
    "Tesla Price Return",

  sourceLabel:
    "Yahoo Finance — Tesla, Inc. (TSLA)",

  categories: [
    "stock",
    "sp500",
    "nasdaq",
  ],

  newsSymbols: [
    "TSLA",
  ],

  chart: {
    id:
      "tsla-historical-annual-returns",

    title:
      "Tesla (TSLA) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive Tesla stock price-return history.",

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
      "Tesla (TSLA) Stock Returns & Performance History",

    socialTitle:
      "Tesla (TSLA) Stock Returns",

    socialDescription:
      "Explore Tesla TSLA historical returns, long-term performance, growth of $10,000, rolling performance, and comparison with the S&P 500.",

    socialImage:
      "/images/social/tsla-stock-intelligence-og.png",
  },
}
