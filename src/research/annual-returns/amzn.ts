import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const amznAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "AMZN",
  slug: "amzn-stock-returns",
  name: "Amazon.com, Inc.",
  shortName: "Amazon",
  startYear: 1998,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "AMAZON STOCK INTELLIGENCE",

  canonicalPath:
    "/amzn-stock-returns/",

  embedPath:
    "/embed/amzn-stock-returns/",

  csvPath:
    "/data/amzn-annual-returns.csv",

  returnType:
    "Amazon Price Return",

  sourceLabel:
    "Yahoo Finance — Amazon.com, Inc. (AMZN)",

  categories: [
    "stock",
    "sp500",
    "nasdaq",
    "djia",
  ],

  newsSymbols: [
    "AMZN",
  ],

  chart: {
    id:
      "amzn-historical-annual-returns",

    title:
      "Amazon (AMZN) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive Amazon stock price-return history.",

    metricLabel:
      "Annual price return",

    positiveLabel:
      "Positive year",

    negativeLabel:
      "Negative year",

    height: 540,
  },

  companyContext: {
    eyebrow: "BUSINESS & INNOVATION CONTEXT",

    title:
      "Why Amazon Is Unique",

    paragraphs: [
      "Amazon began as an online bookseller but developed into a much broader commerce platform built around selection, convenience, fulfillment infrastructure, and a relentless focus on the customer. Its marketplace model allowed third-party sellers to reach Amazon's customers while expanding the range of products available without Amazon owning every item itself.",

      "The company also transformed computing through Amazon Web Services, turning internally developed infrastructure capabilities into on-demand cloud services. The combination of e-commerce, marketplace services, logistics, advertising, subscriptions, and cloud computing created several large businesses operating on shared technology and infrastructure.",
    ],

    closing:
      "How did that business evolution translate into long-term shareholder returns? The data below provides the evidence.",
  },

  seo: {
    title:
      "Amazon (AMZN) Stock Returns & Performance History",

    socialTitle:
      "Amazon (AMZN) Stock Returns",

    socialDescription:
      "Explore Amazon AMZN historical returns, long-term performance, growth of $10,000, rolling performance, and comparison with the S&P 500.",

    socialImage:
      "/images/social/amzn-stock-intelligence-og.png",
  },
}
