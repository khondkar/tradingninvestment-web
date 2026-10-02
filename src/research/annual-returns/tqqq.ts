import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const tqqqAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "TQQQ",
  slug: "tqqq-returns",
  name: "ProShares UltraPro QQQ",
  shortName: "TQQQ",
  startYear: 2011,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "TQQQ STOCK LEVERAGED ETF INTELLIGENCE",

  canonicalPath:
    "/tqqq-returns/",

  embedPath:
    "/embed/tqqq-returns/",

  csvPath:
    "/data/tqqq-annual-returns.csv",

  returnType:
    "TQQQ Price Return",

  sourceLabel:
    "Yahoo Finance — ProShares UltraPro QQQ (TQQQ)",

  categories: [
    "etf",
    "leveraged-etf",
    "nasdaq-100",
  ],

  newsSymbols: [
    "TQQQ",
    "QQQ",
  ],

  chart: {
    id:
      "tqqq-historical-annual-returns",

    title:
      "TQQQ Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive TQQQ price-return history.",

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
      "TQQQ Returns: Historical Performance vs QQQ",

    socialTitle:
      "TQQQ Returns",

    socialDescription:
      "Explore TQQQ historical returns, price return, total return, growth of $10,000, annual performance, and comparison with QQQ.",

    socialImage:
      "/images/social/tqqq-leveraged-etf-intelligence-og.png",
  },
}
