// ============================================================================
// TNI ANNUAL RETURNS — GENERIC ASSET CONFIG TYPE
// ============================================================================

export type AnnualReturnsAssetConfig = {
  symbol: string
  slug: string
  name: string
  shortName: string
  startYear: number

  // Optional company-level intelligence identity shown above the research H1.
  // Existing assets fall back to "TradingNInvestment Research".
  intelligenceEyebrow?: string

  canonicalPath: string
  embedPath: string
  csvPath: string

  returnType: string
  sourceLabel: string
  categories: string[]
  newsSymbols: string[]

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
    socialTitle: string
    socialDescription: string
    socialImage?: string
  }
}
