// ============================================================================
// TNI ANNUAL RETURNS — GENERIC ARTICLE STATISTICS ENGINE
//
// Calculates reusable article statistics from verified completed-year returns.
// Current-year YTD data is intentionally excluded from completed-year statistics.
// ============================================================================

import type {
  AnnualReturnsCalculationDataset,
  AnnualReturnRow,
} from "./calculations"

// ============================================================================
// TNI ANNUAL RETURNS — ARTICLE STATISTICS TYPE
// ============================================================================

export type AnnualReturnsArticleStatistics = {
  completedYears: AnnualReturnRow[]
  completedYearCount: number

  averageReturnPct: number
  medianReturnPct: number

  nonNegativeYears: AnnualReturnRow[]
  nonNegativeCount: number
  nonNegativeRatePct: number
  nonNegativeAverageReturnPct: number | null
  nonNegativeMedianReturnPct: number | null

  negativeYears: AnnualReturnRow[]
  negativeCount: number
  negativeRatePct: number
  negativeAverageReturnPct: number | null
  negativeMedianReturnPct: number | null

  bestYear: AnnualReturnRow
  worstYear: AnnualReturnRow
}

// ============================================================================
// TNI ANNUAL RETURNS — GENERIC AVERAGE
// ============================================================================

function calculateAverage(
  rows: AnnualReturnRow[],
): number {
  return (
    rows.reduce(
      (sum, row) =>
        sum + row.value,
      0,
    ) / rows.length
  )
}

// ============================================================================
// TNI ANNUAL RETURNS — GENERIC MEDIAN
// ============================================================================

function calculateMedian(
  rows: AnnualReturnRow[],
): number {
  const values =
    rows
      .map(
        (row) => row.value,
      )
      .sort(
        (a, b) => a - b,
      )

  const middle =
    Math.floor(
      values.length / 2,
    )

  if (
    values.length % 2 === 0
  ) {
    return (
      values[middle - 1] +
      values[middle]
    ) / 2
  }

  return values[middle]
}

// ============================================================================
// TNI ANNUAL RETURNS — BUILD ARTICLE STATISTICS
// ============================================================================

export function calculateAnnualReturnsArticleStatistics(
  dataset: AnnualReturnsCalculationDataset,
): AnnualReturnsArticleStatistics {
  const completedYears =
    dataset.data
      .filter(
        (row) =>
          row.year <
          dataset.current_year.year,
      )
      .sort(
        (a, b) =>
          a.year - b.year,
      )

  if (completedYears.length === 0) {
    throw new Error(
      "Annual returns article requires at least one completed calendar year.",
    )
  }

  const nonNegativeYears =
    completedYears.filter(
      (row) =>
        row.value >= 0,
    )

  const negativeYears =
    completedYears.filter(
      (row) =>
        row.value < 0,
    )

  const bestYear =
    completedYears.reduce(
      (best, row) =>
        row.value > best.value
          ? row
          : best,
    )

  const worstYear =
    completedYears.reduce(
      (worst, row) =>
        row.value < worst.value
          ? row
          : worst,
    )

  return {
    completedYears,
    completedYearCount:
      completedYears.length,

    averageReturnPct:
      calculateAverage(
        completedYears,
      ),

    medianReturnPct:
      calculateMedian(
        completedYears,
      ),

    nonNegativeYears,
    nonNegativeCount:
      nonNegativeYears.length,
    nonNegativeRatePct:
      (
        nonNegativeYears.length /
        completedYears.length
      ) * 100,
    nonNegativeAverageReturnPct:
      nonNegativeYears.length > 0
        ? calculateAverage(
            nonNegativeYears,
          )
        : null,
    nonNegativeMedianReturnPct:
      nonNegativeYears.length > 0
        ? calculateMedian(
            nonNegativeYears,
          )
        : null,

    negativeYears,
    negativeCount:
      negativeYears.length,
    negativeRatePct:
      (
        negativeYears.length /
        completedYears.length
      ) * 100,
    negativeAverageReturnPct:
      negativeYears.length > 0
        ? calculateAverage(
            negativeYears,
          )
        : null,
    negativeMedianReturnPct:
      negativeYears.length > 0
        ? calculateMedian(
            negativeYears,
          )
        : null,

    bestYear,
    worstYear,
  }
}

// ============================================================================
// TNI ANNUAL RETURNS — RECENT WINDOW ARTICLE STATISTICS TYPE
//
// Supports article sections such as the recent 3-year and 10-year views.
// The current YTD year is part of the display window but is excluded from
// completed-year summary statistics.
// ============================================================================

export type AnnualReturnsRecentWindowStatistics = {
  windowYears: number
  displayStartYear: number
  displayEndYear: number
  isCompleteWindow: boolean

  completedYears: AnnualReturnRow[]
  completedYearCount: number

  averageReturnPct: number | null
  medianReturnPct: number | null

  nonNegativeCount: number
  nonNegativeRatePct: number | null

  negativeCount: number
  negativeRatePct: number | null

  bestYear: AnnualReturnRow | null
  worstYear: AnnualReturnRow | null
}

// ============================================================================
// TNI ANNUAL RETURNS — BUILD RECENT WINDOW ARTICLE STATISTICS
//
// Example with current year 2026:
//   3-year display  = 2024 through 2026 YTD
//   completed years = 2024 and 2025
//
// This is an arithmetic-statistics window, not a CAGR calculation.
// ============================================================================

export function calculateRecentWindowArticleStatistics(
  dataset: AnnualReturnsCalculationDataset,
  windowYears: number,
): AnnualReturnsRecentWindowStatistics {
  if (windowYears < 1) {
    throw new Error(
      "Recent annual-return window must contain at least one year.",
    )
  }

  const displayEndYear =
    dataset.current_year.year

  const displayStartYear =
    displayEndYear -
    windowYears +
    1

  const completedYears =
    dataset.data
      .filter(
        (row) =>
          row.year >= displayStartYear &&
          row.year < displayEndYear,
      )
      .sort(
        (a, b) =>
          a.year - b.year,
      )

  const completedYearCount =
    completedYears.length

  // ==========================================================================
  // TNI ANNUAL RETURNS — RECENT WINDOW COMPLETENESS CHECK
  //
  // Require every completed calendar year expected inside the display window.
  // This prevents a missing or duplicate year from being treated as a valid
  // multi-year historical window.
  // ==========================================================================

  const completedYearSet =
    new Set(
      completedYears.map(
        (row) => row.year,
      ),
    )

  const expectedCompletedYears =
    Array.from(
      {
        length:
          Math.max(
            windowYears - 1,
            0,
          ),
      },
      (_, index) =>
        displayStartYear + index,
    )

  const isCompleteWindow =
    completedYears.length ===
      expectedCompletedYears.length &&
    completedYearSet.size ===
      expectedCompletedYears.length &&
    expectedCompletedYears.every(
      (year) =>
        completedYearSet.has(year),
    )

  const nonNegativeYears =
    completedYears.filter(
      (row) =>
        row.value >= 0,
    )

  const negativeYears =
    completedYears.filter(
      (row) =>
        row.value < 0,
    )

  const bestYear =
    completedYearCount > 0
      ? completedYears.reduce(
          (best, row) =>
            row.value > best.value
              ? row
              : best,
        )
      : null

  const worstYear =
    completedYearCount > 0
      ? completedYears.reduce(
          (worst, row) =>
            row.value < worst.value
              ? row
              : worst,
        )
      : null

  return {
    windowYears,
    displayStartYear,
    displayEndYear,
    isCompleteWindow,

    completedYears,
    completedYearCount,

    averageReturnPct:
      completedYearCount > 0
        ? calculateAverage(
            completedYears,
          )
        : null,

    medianReturnPct:
      completedYearCount > 0
        ? calculateMedian(
            completedYears,
          )
        : null,

    nonNegativeCount:
      nonNegativeYears.length,

    nonNegativeRatePct:
      completedYearCount > 0
        ? (
            nonNegativeYears.length /
            completedYearCount
          ) * 100
        : null,

    negativeCount:
      negativeYears.length,

    negativeRatePct:
      completedYearCount > 0
        ? (
            negativeYears.length /
            completedYearCount
          ) * 100
        : null,

    bestYear,
    worstYear,
  }
}

