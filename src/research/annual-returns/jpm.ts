import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const jpmAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "JPM",
  slug: "jpm-stock-returns",
  name: "JPMorgan Chase & Co.",
  shortName: "JPMorgan",
  startYear: 1981,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "JPMORGAN STOCK INTELLIGENCE",

  canonicalPath:
    "/jpm-stock-returns/",

  embedPath:
    "/embed/jpm-stock-returns/",

  csvPath:
    "/data/jpm-annual-returns.csv",

  returnType:
    "JPMorgan Price Return",

  sourceLabel:
    "Yahoo Finance — JPMorgan Chase & Co. (JPM)",

  categories: ["stock", "sp500", "djia"],

  newsSymbols: [
    "JPM",
  ],

  chart: {
    id:
      "jpm-historical-annual-returns",

    title:
      "JPMorgan (JPM) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive JPMorgan stock price-return history.",

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
    title: "Why JPMorgan Chase Is Unique",
    paragraphs: [
      "JPMorgan Chase is one of the largest diversified financial institutions in the United States, operating across consumer banking, commercial banking, investment banking, payments, and asset and wealth management.",
      "Its long-term performance reflects interest-rate cycles, credit conditions, capital-market activity, economic growth, financial regulation, and the bank's ability to generate sustainable returns on capital.",
    ],
    closing:
      "How have these business dynamics translated into long-term shareholder returns? The historical data below provides the evidence.",
  },

  seo: {
    title:
      "JPMorgan Chase (JPM) Stock Returns & Performance History",

    socialTitle:
      "JPMorgan Chase (JPM) Stock Returns",

    socialDescription:
      "Explore JPM historical stock returns, dividends, long-term performance, growth of $10,000, rolling returns, and comparison with the S&P 500.",

    socialImage:
      "/images/social/jpm-stock-premium-og.png",
  },
}
