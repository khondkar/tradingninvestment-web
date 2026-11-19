import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const amdlAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "AMDL",
  slug: "amdl-etf",
  name: "GraniteShares 2x Long AMD Daily ETF",
  shortName: "AMDL",
  startYear: 2024,
  author: kamalResearchAuthor,
  intelligenceEyebrow: "AMDL LEVERAGED ETF INTELLIGENCE",
  canonicalPath: "/amdl-etf/",
  embedPath: "/embed/amdl-etf/",
  csvPath: "/data/amdl-annual-returns.csv",
  returnType: "AMDL Price Return",
  sourceLabel: "Yahoo Finance — GraniteShares 2x Long AMD Daily ETF (AMDL)",
  categories: ["etf", "leveraged-etf"],
  newsSymbols: ["AMDL", "AMD"],
  companyContext: {
    eyebrow: "How to read the record",
    title: "AMDL is a daily leveraged trading vehicle",
    paragraphs: [
      "AMDL seeks 2× the daily percentage change of Advanced Micro Devices (AMD), before fees and expenses. That objective resets each trading day. It does not promise twice AMD’s return over a month, a year, or any other holding period longer than one day.",
      "AMDL’s first trading session was March 18, 2024. From that first close through December 31, 2024, AMDL fell 69.97% and AMD fell 36.64%. That is a partial-period comparison; it is shown separately from full calendar-year statistics. In 2025, AMDL gained 103.00% and AMD gained 77.30% on a price-return basis.",
      "This page compares annual price returns with AMD and explains the effects of daily compounding, volatility, derivatives and fund costs. 2026 year-to-date results are through November 18, 2026, the latest completed session in this dataset.",
    ],
  },
  leveragedEtf: {
    issuer: "GraniteShares",
    leverageLabel: "2× long",
    dailyObjective:
      "Seeks two times (2×) the daily percentage change of Advanced Micro Devices, Inc. (AMD), before fees and expenses.",
    benchmarkName: "AMD",
    benchmarkTicker: "AMD",
    inceptionDate: "2024-03-15",
    officialUrl: "https://graniteshares.com/etfs/amdl/",
    showRolling10Year: false,
    structureSummary:
      "AMDL seeks its daily exposure primarily through AMD-linked total-return swaps, supported by cash and short-term U.S. Treasury collateral. The fund’s holdings and counterparties can change.",
    compositionNotes: [
      "AMDL targets 2× AMD’s daily percentage change, before fees and expenses.",
      "The fund generally obtains exposure through swaps rather than holding a conventional diversified basket of stocks.",
      "Daily resetting and compounding can cause longer-period returns to differ materially from 2× AMD’s cumulative return.",
      "Review GraniteShares’ current holdings, prospectus and fee disclosures for the latest fund details.",
    ],
  },
  chart: {
    id: "amdl-historical-annual-returns",
    title: "AMDL Historical Annual Returns by Year",
    rangeSubtitleSuffix: "Interactive AMDL price-return history.",
    metricLabel: "Annual price return",
    positiveLabel: "Positive year",
    negativeLabel: "Negative year",
    height: 540,
  },
  seo: {
    title: "AMDL ETF: Performance, Daily Leverage & AMDL vs AMD",
    h1: "AMDL ETF: Performance, Daily Leverage & AMDL vs AMD",
    description:
      "Explore AMDL ETF annual performance, price returns, daily 2× AMD exposure and the risks of compounding. Compare GraniteShares AMDL with AMD and review fund details.",
    socialTitle: "AMDL ETF Performance & AMDL vs AMD",
    socialDescription:
      "Independent TNI research on AMDL’s annual returns, daily leverage, compounding risks and performance alongside AMD.",
  },
}
