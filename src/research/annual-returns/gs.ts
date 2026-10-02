import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const gsAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "GS",
  slug: "gs-stock-returns",
  name: "The Goldman Sachs Group, Inc.",
  shortName: "Goldman Sachs",
  startYear: 2000,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "GOLDMAN SACHS STOCK INTELLIGENCE",

  canonicalPath:
    "/gs-stock-returns/",

  embedPath:
    "/embed/gs-stock-returns/",

  csvPath:
    "/data/gs-annual-returns.csv",

  returnType:
    "Goldman Sachs Price Return",

  sourceLabel:
    "Yahoo Finance — The Goldman Sachs Group, Inc. (GS)",

  categories: [
    "stock",
    "sp500",
  ],

  newsSymbols: [
    "GS",
  ],

  chart: {
    id:
      "gs-historical-annual-returns",

    title:
      "Goldman Sachs (GS) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive Goldman Sachs stock price-return history.",

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
      "Goldman Sachs (GS) Stock Performance vs S&P 500",

    socialTitle:
      "Goldman Sachs (GS) Stock Returns",

    socialDescription:
      "Explore Goldman Sachs GS historical returns, long-term performance, growth of $10,000, rolling 10-year performance, and comparison with the S&P 500.",

    socialImage:
      "/images/social/gs-stock-intelligence-og.png",
  },
}
