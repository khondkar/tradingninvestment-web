import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const nkeAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "NKE",
  slug: "nke-stock-returns",
  name: "NIKE, Inc.",
  shortName: "Nike",
  startYear: 1981,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "NIKE STOCK INTELLIGENCE",

  canonicalPath:
    "/nke-stock-returns/",

  embedPath:
    "/embed/nke-stock-returns/",

  csvPath:
    "/data/nke-annual-returns.csv",

  returnType:
    "Nike Price Return",

  sourceLabel:
    "Yahoo Finance — NIKE, Inc. (NKE)",

  categories: ["stock", "sp500", "djia"],

  newsSymbols: [
    "NKE",
  ],

  chart: {
    id:
      "nke-historical-annual-returns",

    title:
      "Nike (NKE) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive Nike stock price-return history.",

    metricLabel:
      "Annual price return",

    positiveLabel:
      "Positive year",

    negativeLabel:
      "Negative year",

    height: 540,
  },

  companyContext: {
    eyebrow: "BUSINESS & INDUSTRY CONTEXT",
    title: "Why Nike Is Unique",
    paragraphs: [
      "Nike is a global athletic footwear and apparel company whose business is built around product innovation, brand recognition, athlete partnerships, and distribution across wholesale and direct-to-consumer channels.",
      "Nike's historical performance reflects changing consumer demand, international expansion, competition, product cycles, and shifts in its retail distribution strategy.",
    ],
    closing:
      "How have these business dynamics translated into long-term shareholder returns? The historical data below provides the evidence.",
  },

  seo: {
    title:
      "Nike (NKE) Stock Returns & Performance History",

    socialTitle:
      "Nike (NKE) Stock Returns",

    socialDescription:
      "Explore Nike NKE historical returns, long-term performance, growth of $10,000, rolling performance, and comparison with the S&P 500.",

    socialImage:
      "/images/social/nke-stock-premium-og.png",
  },
}
