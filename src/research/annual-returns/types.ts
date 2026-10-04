// ============================================================================
// TNI ANNUAL RETURNS — GENERIC ASSET CONFIG TYPE
// ============================================================================

import type { ResearchAuthor } from '../author'

export type AnnualReturnsAssetConfig = {
  companyContext?: {
    eyebrow?: string
    title: string
    paragraphs: string[]
    closing?: string
  }
  symbol: string
  slug: string
  name: string
  shortName: string
  startYear: number

  // Optional company-level intelligence identity shown above the research H1.
  // Existing assets fall back to "TradingNInvestment Research".
  intelligenceEyebrow?: string

  // Static annual-return research image.
  // Used as an indexable/shareable visual on the published research page.
  annualReturnImage?: string
  annualReturnImageAlt?: string

  canonicalPath: string
  embedPath: string
  csvPath: string

  returnType: string
  sourceLabel: string
  author: ResearchAuthor
  categories: string[]
  newsSymbols: string[]

  // Optional metadata for leveraged ETF research pages.
  // Keeps issuer, leverage, benchmark and fund structure out of
  // ticker-specific presentation components.
  leveragedEtf?: {
    issuer: string
    leverageLabel: string
    dailyObjective: string
    benchmarkName: string
    benchmarkTicker: string
    inceptionDate: string
    officialUrl: string

    // Young funds should not render unsupported long-horizon analytics.
    showRolling10Year: boolean

    // Optional fund-structure explanation. Exact holdings can change,
    // so dated portfolio data should be clearly identified as such.
    structureSummary?: string
    compositionAsOf?: string
    compositionNotes?: string[]
  }

  chart: {
    id: string
    title: string
    rangeSubtitleSuffix: string
    metricLabel: string
    positiveLabel: string
    negativeLabel: string
    height: number
  }

  seo: {
    title: string
    h1?: string
    description?: string
    socialTitle: string
    socialDescription: string
    socialImage?: string
  }
}
