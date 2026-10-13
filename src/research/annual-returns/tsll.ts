import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const tsllAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "TSLL",
  slug: "tsll-etf",
  name: "Direxion Daily TSLA Bull 2X Shares",
  shortName: "TSLL",
  startYear: 2023,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "TSLL STOCK LEVERAGED ETF INTELLIGENCE",

  canonicalPath: "/tsll-etf/",
  embedPath: "/embed/tsll-etf/",
  csvPath: "/data/tsll-annual-returns.csv",

  returnType: "TSLL Price Return",

  sourceLabel:
    "Yahoo Finance — Direxion Daily TSLA Bull 2X Shares (TSLL)",

  categories: ["etf", "leveraged-etf"],

  newsSymbols: ["TSLL", "TSLA"],

  leveragedEtf: {
    issuer: "Direxion",
    leverageLabel: "2× long",
    dailyObjective:
      "Currently seeks 200% of the daily performance of Tesla, Inc. (TSLA), before fees and expenses. Historical leverage objectives may differ.",
    benchmarkName: "TSLA",
    benchmarkTicker: "TSLA",
    inceptionDate: "2022-08-09",
    officialUrl:
      "https://www.direxion.com/product/daily-tsla-bull-and-bear-leveraged-single-stock-etfs",
    showRolling10Year: false,
    structureSummary:
      "TSLL obtains leveraged daily exposure to Tesla through financial instruments, including derivatives. Its exposure is reset daily, so longer-term performance can differ substantially from twice Tesla's cumulative return.",
    compositionNotes: [
      "TSLL currently targets 2× Tesla's daily performance before fees and expenses.",
      "Historical leverage change: TSLL targeted 1.5× Tesla's daily performance from inception on August 9, 2022 through April 1, 2024. Effective April 2, 2024, its daily objective increased to 2×. The 2024 annual return spans both leverage regimes.",
      "Daily rebalancing, compounding, volatility and financing costs affect multi-day returns.",
      "Derivative exposure, counterparties and collateral holdings can change over time.",
      "Review Direxion's current holdings, prospectus and historical fund documents before investing.",
    ],
  },

  chart: {
    id: "tsll-historical-annual-returns",
    title: "TSLL Historical Annual Returns by Year",
    rangeSubtitleSuffix:
      "Interactive TSLL price-return history.",
    metricLabel: "Annual price return",
    positiveLabel: "Positive year",
    negativeLabel: "Negative year",
    height: 540,
  },

  seo: {
    title:
      "TSLL ETF: Holdings, Performance & TSLL vs TSLA",
    h1:
      "TSLL ETF: Performance, Holdings & TSLL vs TSLA",
    description:
      "Analyze TSLL ETF holdings, annual returns, growth of $10,000, drawdowns and TSLL vs TSLA performance. Understand daily leverage and compounding risks.",
    socialTitle:
      "TSLL ETF: Performance, Holdings & TSLL vs TSLA",
    socialDescription:
      "Independent research on TSLL performance, historical returns, growth of $10,000, drawdowns and TSLL vs TSLA.",
    socialImage:
      "/images/social/tsll-leveraged-etf-intelligence-og.png",
  },
}
