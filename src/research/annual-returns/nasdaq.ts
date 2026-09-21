import type { AnnualReturnsAssetConfig } from "./types"

export const nasdaqAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "^IXIC",
  slug: "nasdaq-historical-annual-returns",
  name: "Nasdaq Composite",
  shortName: "Nasdaq",
  startYear: 1972,

  // TNI NASDAQ — INDEX INTELLIGENCE IDENTITY
  intelligenceEyebrow:
    "NASDAQ INTELLIGENCE",

  canonicalPath: "/nasdaq-historical-annual-returns/",
  embedPath: "/embed/nasdaq-historical-annual-returns/",
  csvPath: "/data/nasdaq-annual-returns.csv",

  returnType: "Nasdaq Composite Price Return",
  sourceLabel: "Yahoo Finance — Nasdaq Composite (^IXIC)",
  categories: ["index", "nasdaq"],
  newsSymbols: ["^IXIC"],

  chart: {
    id: "nasdaq-historical-annual-returns",
    title: "Nasdaq Composite Historical Annual Returns by Year",
    rangeSubtitleSuffix:
      "Interactive Nasdaq Composite price-return history.",
    metricLabel: "Annual price return",
    positiveLabel: "Positive year",
    negativeLabel: "Negative year",
    height: 540,
  },

  seo: {
    title: "Nasdaq Historical Annual Returns: Year-by-Year Performance",
    socialTitle: "Nasdaq Historical Returns by Year (1972–2026)",
    socialDescription:
      "Nasdaq Composite historical annual returns by year, including average return, positive and negative years, long-term performance, and 2026 YTD return.",
    socialImage:
      "/images/social/nasdaq-vs-sp500-historical-returns-og.svg",
  },
} as const
