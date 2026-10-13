import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const jnjAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "JNJ",
  slug: "jnj-stock-returns",
  name: "Johnson & Johnson",
  shortName: "Johnson & Johnson",
  startYear: 1971,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "JOHNSON & JOHNSON STOCK INTELLIGENCE",

  canonicalPath:
    "/jnj-stock-returns/",

  embedPath:
    "/embed/jnj-stock-returns/",

  csvPath:
    "/data/jnj-annual-returns.csv",

  returnType:
    "Johnson & Johnson Price Return",

  sourceLabel:
    "Yahoo Finance — Johnson & Johnson (JNJ)",

  categories: ["stock", "sp500", "djia"],

  newsSymbols: [
    "JNJ",
  ],

  chart: {
    id:
      "jnj-historical-annual-returns",

    title:
      "Johnson & Johnson (JNJ) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive Johnson & Johnson stock price-return history.",

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
    title: "Why Johnson & Johnson Is Unique",
    paragraphs: [
      "Johnson & Johnson (JNJ) is a Dow Jones Industrial Average and S&P 500 constituent focused on innovative medicines and medical technology. Its long-term performance reflects pharmaceutical innovation, healthcare demand, regulatory decisions, and capital allocation.",
      "Its historical shareholder returns also reflect decades of dividends, acquisitions, and the 2023 separation of its consumer-health business, Kenvue.",
    ],
    closing:
      "How have these business dynamics translated into long-term shareholder returns? The historical data below provides the evidence.",
  },

  seo: {
    title:
      "Johnson & Johnson (JNJ) Stock Returns & Performance History",

    socialTitle:
      "Johnson & Johnson (JNJ) Stock Returns",

    socialDescription:
      "Explore JNJ historical stock returns, dividends, long-term performance, growth of $10,000, rolling returns, and comparison with the S&P 500.",

    socialImage:
      "/images/social/jnj-stock-premium-og.png",
  },
}
