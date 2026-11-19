import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const amdlAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "AMDL",
  slug: "amdl-returns-drawdowns-and-recovery",
  name: "GraniteShares 2x Long AMD Daily ETF",
  shortName: "AMDL",
  startYear: 2024,
  author: kamalResearchAuthor,
  intelligenceEyebrow: "AMDL LEVERAGED ETF INTELLIGENCE",
  canonicalPath: "/amdl-returns-drawdowns-and-recovery/",
  embedPath: "/embed/amdl-returns-drawdowns-and-recovery/",
  csvPath: "/data/amdl-annual-returns.csv",
  returnType: "AMDL Price Return",
  sourceLabel: "Yahoo Finance — GraniteShares 2x Long AMD Daily ETF (AMDL)",
  categories: ["etf", "leveraged-etf"],
  newsSymbols: ["AMDL", "AMD"],
  companyContext: {
    eyebrow: "How to read the record",
    title: "AMDL returns, drawdowns and recovery",
    paragraphs: [
      "AMDL seeks 2× the daily percentage change of Advanced Micro Devices (AMD), before fees and expenses. That objective resets each trading day. It does not promise twice AMD’s return over a month, a year, or any other holding period longer than one day.",
      "AMDL’s first trading session was March 18, 2024. From that first close through December 31, 2024, AMDL fell 69.97% and AMD fell 36.64%. That is a partial-period comparison; it is shown separately from full calendar-year statistics. In 2025, AMDL gained 103.00% and AMD gained 77.30% on a price-return basis.",
      "AMDL, NVDL, QLD and TQQQ all reset their leverage daily, but they track different exposures: AMD, NVIDIA, and the Nasdaq-100. QLD targets 2× the Nasdaq-100; TQQQ targets 3×. Their longer-term returns therefore depend on each fund’s path, volatility, fees and distributions—not just the leverage label.",
      "The 2025 comparison below uses the last available close of 2024 and 2025. It is a matched calendar-year comparison, not a forecast. Daily AMDL price history is not yet available in this research dataset, so this version does not publish a historical maximum drawdown or recovery date for AMDL.",
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
    title: "AMDL Returns, Drawdowns & Recovery | AMDL vs NVDL, QLD & TQQQ",
    h1: "AMDL Returns, Drawdowns & Recovery",
    description:
      "Review AMDL’s annual returns, daily 2× AMD exposure and recovery risks. Compare AMDL with NVDL, QLD and TQQQ, including each fund’s daily leverage objective and 2025 return.",
    socialTitle: "AMDL Returns, Drawdowns & Recovery",
    socialDescription:
      "Independent TNI research comparing AMDL, NVDL, QLD and TQQQ, with annual returns, daily leverage objectives and recovery-risk context.",
  },
}
