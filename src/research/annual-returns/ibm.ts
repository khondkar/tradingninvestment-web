import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const ibmAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "IBM",
  slug: "ibm-stock-returns",
  name: "International Business Machines Corporation",
  shortName: "IBM",
  startYear: 1963,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "IBM STOCK INTELLIGENCE",

  canonicalPath:
    "/ibm-stock-returns/",

  embedPath:
    "/embed/ibm-stock-returns/",

  csvPath:
    "/data/ibm-annual-returns.csv",

  returnType:
    "IBM Price Return",

  sourceLabel:
    "Yahoo Finance — International Business Machines Corporation (IBM)",

  categories: ["stock", "sp500", "djia"],

  newsSymbols: [
    "IBM",
  ],

  chart: {
    id:
      "ibm-historical-annual-returns",

    title:
      "IBM Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive IBM stock price-return history.",

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
    title: "Why IBM Is Unique",
    paragraphs: [
      "IBM is a global enterprise technology company focused on hybrid cloud, artificial intelligence, software, consulting, and infrastructure services.",
      "IBM's historical performance reflects changes in enterprise computing, its transition toward software and services, acquisitions, and its hybrid-cloud and AI strategy.",
    ],
    closing:
      "How have these business dynamics translated into long-term shareholder returns? The historical data below provides the evidence.",
  },

  seo: {
    title:
      "IBM Stock Returns & Performance History",

    socialTitle:
      "IBM Stock Returns",

    socialDescription:
      "Explore IBM stock historical returns, long-term performance, growth of $10,000, rolling performance, and comparison with the S&P 500.",

    socialImage:
      "/images/social/ibm-stock-premium-og.png",
  },
}
