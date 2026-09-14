// ============================================================================
// TNI ANNUAL RETURNS — GENERIC DYNAMIC LABEL BUILDERS
// ============================================================================

import type { AnnualReturnsAssetConfig } from "./types"

// ============================================================================
// TNI ANNUAL RETURNS — PAGE HEADLINE
// ============================================================================

export function buildAnnualReturnsHeadline(
  config: AnnualReturnsAssetConfig,
): string {
  return `${config.name} Returns by Year: ${config.startYear} to Present`
}

// ============================================================================
// TNI ANNUAL RETURNS — DATASET SCHEMA NAME
// ============================================================================

export function buildAnnualReturnsDatasetName(
  config: AnnualReturnsAssetConfig,
): string {
  return `${config.name} Historical Annual Returns: ${config.startYear} to Present`
}

// ============================================================================
// TNI ANNUAL RETURNS — DATASET SCHEMA DESCRIPTION
// ============================================================================

export function buildAnnualReturnsDatasetDescription(
  config: AnnualReturnsAssetConfig,
  periods: number[],
): string {
  return `Historical ${config.name} annual price-return research from ${config.startYear} to the latest available market data, including current-year performance and ${buildAvailablePeriodReturnsLabel(periods).toLowerCase()} return statistics.`
}

// ============================================================================
// TNI ANNUAL RETURNS — DATASET SCHEMA ALTERNATE NAME
// ============================================================================

export function buildAnnualReturnsDatasetAlternateName(
  config: AnnualReturnsAssetConfig,
): string {
  return `TradingNInvestment ${config.name} Historical Return Research Dataset`
}

// ============================================================================
// TNI ANNUAL RETURNS — SEO DESCRIPTION
// ============================================================================

export function buildAnnualReturnsSeoDescription(
  config: AnnualReturnsAssetConfig,
  periods: number[],
): string {
  return `Explore ${config.name} returns by year from ${config.startYear} to present, including current-year and ${buildAvailablePeriodReturnsLabel(periods).toLowerCase()} returns, average historical returns, positive and negative years, and long-term market performance.`
}

// ============================================================================
// TNI ANNUAL RETURNS — DEFAULT CHART SUBTITLE
// ============================================================================



// ============================================================================
// TNI ANNUAL RETURNS — AVAILABLE PERIOD RETURN LABEL
// ============================================================================

export function buildAvailablePeriodReturnsLabel(
  periods: number[],
): string {
  const labels =
    periods.map(
      (years) =>
        `${years}-Year`,
    )

  if (labels.length === 0) {
    return 'Historical'
  }

  if (labels.length === 1) {
    return labels[0]
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`
  }

  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

export function buildAnnualReturnsChartSubtitle(
  config: AnnualReturnsAssetConfig,
  currentYear: number,
): string {
  return `Interactive ${config.shortName} price-return history from ${config.startYear} through ${currentYear} YTD.`
}
