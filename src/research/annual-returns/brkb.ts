import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

import brkbMarketEvents from "../../data/charts/brkbMarketEvents.json"

const brkbSeoDescription = `Explore BRK.B vs S&P 500 across ${brkbMarketEvents.corrections.length} market declines. Compare drawdowns, recovery times and returns, plus Berkshire’s cash reserves and share buybacks.`

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
    description: brkbSeoDescription,
    title:
      "Is Berkshire Really Safer Than the S&P 500?",

    socialTitle:
      "Is Berkshire Really Safer Than the S&P 500?",

    socialDescription:
      brkbSeoDescription,

    socialImage:
      "/images/social/brkb-stock-intelligence-og.png",
  },
}
