import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const soxlAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "SOXL",
  slug: "soxl-etf",
  name: "Direxion Daily Semiconductor Bull 3X Shares",
  shortName: "SOXL",
  startYear: 2011,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "SOXL STOCK LEVERAGED ETF INTELLIGENCE",

  canonicalPath:
    "/soxl-etf/",

  embedPath:
    "/embed/soxl-etf/",

  csvPath:
    "/data/soxl-annual-returns.csv",

  returnType:
    "SOXL Price Return",

  sourceLabel:
    "Yahoo Finance — Direxion Daily Semiconductor Bull 3X Shares (SOXL)",

  categories: [
    "etf",
    "leveraged-etf",
  ],

  newsSymbols: [
    "SOXL",
    "NVDA",
    "AMD",
  ],

  leveragedEtf: {
    issuer: "Direxion",
    leverageLabel: "3× long",
    dailyObjective:
      "Seeks 300% of the daily performance of the NYSE Semiconductor Index, before fees and expenses.",
    benchmarkName:
      "NYSE Semiconductor Index",
    benchmarkTicker:
      "ICESEMIT",
    inceptionDate:
      "2010-03-11",
    officialUrl:
      "https://www.direxion.com/product/daily-semiconductor-bull-bear-3x-etfs",
    showRolling10Year: true,
    structureSummary:
      "SOXL is a leveraged semiconductor ETF designed to provide 3× daily exposure to the NYSE Semiconductor Index. Because the leverage objective resets daily, longer-period returns can differ substantially from three times the index return.",
    compositionNotes: [
      "SOXL targets 300% of the daily performance of the NYSE Semiconductor Index, before fees and expenses.",
      "SOXL uses derivatives and other financial instruments to obtain leveraged semiconductor exposure.",
      "Daily leverage resets mean multi-day performance depends on both the path and volatility of semiconductor returns.",
      "SMH is used in TNI research as an investable semiconductor ETF comparison; it is not SOXL's official benchmark.",
      "Current holdings and portfolio exposures should be evaluated using the latest Direxion fund holdings and official fund documents.",
    ],
  },

  chart: {
    id:
      "soxl-historical-annual-returns",

    title:
      "SOXL Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive SOXL price-return history.",

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
      "SOXL ETF: Holdings, Performance & Historical Returns",

    h1:
      "SOXL ETF: Performance, Holdings & Historical Returns",

    description:
      "Analyze the SOXL ETF, including holdings, historical performance, annual returns, drawdowns and growth of $10,000. Learn how Direxion SOXL targets 3× the daily performance of the NYSE Semiconductor Index.",

    socialTitle:
      "SOXL ETF: Performance, Holdings & Historical Returns",

    socialDescription:
      "Research SOXL ETF performance, holdings, historical returns, growth of $10,000, drawdowns, and SOXL vs SMH using independent TNI analysis.",

    socialImage:
      "/images/social/soxl-leveraged-etf-intelligence-og.png",
  },
}
