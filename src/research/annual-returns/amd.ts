import amdAnnualReturns from "../../data/charts/amdAnnualReturns.json"
import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

// ============================================================================
// TNI AMD ANNUAL RETURNS — ASSET CONFIGURATION
// ============================================================================

export const amdAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "AMD",
  slug: "amd-stock-returns-drawdowns-and-recovery",
  name: "Advanced Micro Devices",
  shortName: "AMD",
  startYear: 2000,
  author: kamalResearchAuthor,
  canonicalPath: "/amd-stock-returns-drawdowns-and-recovery/",
  embedPath: "/embed/amd-stock-returns-drawdowns-and-recovery/",
  csvPath: "/data/amd-annual-returns.csv",
  returnType: "AMD Price Return",
  sourceLabel: "Yahoo Finance — Advanced Micro Devices (AMD)",
  categories: ["stock", "sp500", "nasdaq", "comparison"],
  newsSymbols: ["AMD"],
  chart: {
    id: "amd-historical-annual-returns",
    title: "AMD Historical Annual Returns by Year",
    rangeSubtitleSuffix: "Interactive AMD price-return history.",
    metricLabel: "Annual price return",
    positiveLabel: "Positive year",
    negativeLabel: "Negative year",
    height: 540,
  },
  seo: {
    socialImage: "/images/social/amd-four-annual-returns.png",
    title: `AMD Stock Drawdowns, Recovery & Annual Returns | TNI`,
    h1: `AMD Stock Returns, Drawdowns & Recovery, 2000–${amdAnnualReturns.current_year.year}`,
    description: `See how long AMD took to recover from its 96.6% drawdown. Compare annual returns for AMD, Nvidia, the Nasdaq Composite and the S&P 500 from 2000 to ${amdAnnualReturns.current_year.year}.`,
    socialTitle: "AMD Returns, Drawdowns & Recovery vs. S&P 500",
    socialDescription: `How deep were AMD’s biggest losses, and how long did recovery take? Explore AMD vs. S&P 500 drawdowns and annual returns from 2000–${amdAnnualReturns.current_year.year}.`,
  },
}
