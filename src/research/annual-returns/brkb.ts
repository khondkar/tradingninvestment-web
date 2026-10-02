import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const brkbAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "BRK.B",
  slug: "look-berkshire-hathaway-stock-brk-b-berkshire-hathaway-performance-vs-sp-500",
  name: "Berkshire Hathaway Inc.",
  shortName: "Berkshire Hathaway",
  startYear: 1997,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "BERKSHIRE HATHAWAY STOCK INTELLIGENCE",

  canonicalPath:
    "/look-berkshire-hathaway-stock-brk-b-berkshire-hathaway-performance-vs-sp-500/",

  embedPath:
    "/embed/look-berkshire-hathaway-stock-brk-b-berkshire-hathaway-performance-vs-sp-500/",

  csvPath:
    "/data/brkb-annual-returns.csv",

  returnType:
    "Berkshire Hathaway Price Return",

  sourceLabel:
    "Yahoo Finance — Berkshire Hathaway Inc. Class B (BRK-B)",

  categories: [
    "stock",
    "sp500",
  ],

  newsSymbols: [
    "BRK.B",
    "BRK-B",
  ],

  chart: {
    id:
      "brkb-historical-annual-returns",

    title:
      "Berkshire Hathaway (BRK.B) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive Berkshire Hathaway stock price-return history.",

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
      "Berkshire Hathaway (BRK.B) Stock Performance vs S&P 500",

    socialTitle:
      "Berkshire Hathaway (BRK.B) Stock Returns",

    socialDescription:
      "Explore Berkshire Hathaway BRK.B historical returns, long-term performance, growth of $10,000, rolling 10-year performance, and comparison with the S&P 500.",

    socialImage:
      "/images/social/brkb-stock-intelligence-og.png",
  },
}
