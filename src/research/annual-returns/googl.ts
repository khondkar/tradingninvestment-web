import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const googlAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "GOOGL",
  slug: "googl-stock-returns",
  name: "Alphabet Inc.",
  shortName: "Alphabet",
  startYear: 2005,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "ALPHABET STOCK INTELLIGENCE",

  canonicalPath:
    "/googl-stock-returns/",

  embedPath:
    "/embed/googl-stock-returns/",

  csvPath:
    "/data/googl-annual-returns.csv",

  returnType:
    "Alphabet Price Return",

  sourceLabel:
    "Yahoo Finance — Alphabet Inc. (GOOGL)",

  categories: [
    "stock",
    "sp500",
    "nasdaq",
    "djia",
  ],

  newsSymbols: [
    "GOOGL",
    "GOOG",
  ],

  chart: {
    id:
      "googl-historical-annual-returns",

    title:
      "Alphabet (GOOGL) Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive Alphabet stock price-return history.",

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
      "Why Alphabet Is Unique",

    paragraphs: [
      "Google Search made the expanding web easier to navigate by organizing and ranking information around what users were looking for. It also created an unusual business model: advertising could be shown in response to a user's immediate search intent.",

      "The result was a highly scalable business. Billions of searches could be served through largely the same underlying technology and infrastructure, while advertisers competed for commercially valuable queries. Search became the economic engine that helped finance Alphabet's expansion into YouTube, Android, Maps, Cloud, and AI.",
    ],

    closing:
      "How did that business evolution translate into long-term shareholder returns? The data below provides the evidence.",
  },

  seo: {
    title:
      "Alphabet (GOOGL) Stock Returns & Performance History",

    socialTitle:
      "Alphabet (GOOGL) Stock Returns",

    socialDescription:
      "Explore Alphabet GOOGL historical returns, long-term performance, growth of $10,000, rolling performance, and comparison with the S&P 500.",

    socialImage:
      "/images/social/googl-stock-intelligence-og.png",
  },
}
