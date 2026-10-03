import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const nvdlAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "NVDL",
  slug: "nvdl-etf",
  name: "GraniteShares 2x Long NVDA Daily ETF",
  shortName: "NVDL",
  startYear: 2023,
  author: kamalResearchAuthor,

  intelligenceEyebrow:
    "NVDL STOCK LEVERAGED ETF INTELLIGENCE",

  canonicalPath:
    "/nvdl-etf/",

  embedPath:
    "/embed/nvdl-etf/",

  csvPath:
    "/data/nvdl-annual-returns.csv",

  returnType:
    "NVDL Price Return",

  sourceLabel:
    "Yahoo Finance — GraniteShares 2x Long NVDA Daily ETF (NVDL)",

  categories: [
    "etf",
    "leveraged-etf",
  ],

  newsSymbols: [
    "NVDL",
    "NVDA",
  ],

  leveragedEtf: {
    issuer: "GraniteShares",
    leverageLabel: "2× long",
    dailyObjective:
      "Seeks two times (2×) the daily percentage change of NVIDIA Corporation (NVDA), before fees and expenses.",
    benchmarkName: "NVDA",
    benchmarkTicker: "NVDA",
    inceptionDate: "2022-12-13",
    officialUrl:
      "https://graniteshares.com/institutional/us/en-us/etfs/nvdl/",
    showRolling10Year: false,
    structureSummary:
      "NVDL obtains leveraged daily exposure to NVIDIA primarily through financial instruments including NVDA-linked swaps, with collateral that can include cash and U.S. Treasury securities.",
    compositionNotes: [
      "NVDL targets 2× the daily percentage change of NVIDIA (NVDA), before fees and expenses.",
      "Derivative exposure can cause gross notional exposure to exceed 100% of fund net assets.",
      "Swap counterparties, collateral positions and portfolio weights can change over time.",
      "Current portfolio composition should therefore be evaluated using the latest GraniteShares fund holdings and official fund documents.",
    ],
  },

  chart: {
    id:
      "nvdl-historical-annual-returns",

    title:
      "NVDL Historical Annual Returns by Year",

    rangeSubtitleSuffix:
      "Interactive NVDL price-return history.",

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
      "NVDL ETF: Holdings, Performance & NVDL vs NVDA",

    h1:
      "NVDL ETF: Performance, Holdings & NVDL vs NVDA",

    description:
      "Analyze the NVDL ETF, including holdings, historical performance, drawdowns, growth of $10,000 and NVDL vs NVDA. Learn how GraniteShares NVDL targets 2× daily NVIDIA exposure.",

    socialTitle:
      "NVDL ETF: Performance, Holdings & NVDL vs NVDA",

    socialDescription:
      "Research NVDL ETF performance, holdings, historical returns, growth of $10,000, drawdowns, and NVDL vs NVDA using independent TNI analysis.",

    socialImage:
      "/images/social/nvdl-vs-nvda-drawdown-og.png",
  },
}
