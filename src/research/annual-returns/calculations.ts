// ============================================================================
// TNI ANNUAL RETURNS — GENERIC PERIOD RETURN CALCULATIONS
// ============================================================================

export type AnnualReturnRow = {
  year: number
  value: number
}

export type AnnualReturnsCalculationDataset = {
  current_year: {
    year: number
    label: string
    return_pct: number
  }
  data: AnnualReturnRow[]
}

export type CompletedPeriodReturn = {
  years: number
  startYear: number
  endYear: number
  cumulativeReturnPct: number
  annualizedReturnPct: number
}

export function calculateCompletedPeriodReturn(
  dataset: AnnualReturnsCalculationDataset,
  years: number,
): CompletedPeriodReturn | null {
  if (
    !Number.isInteger(years) ||
    years < 1
  ) {
    return null
  }

  // ==========================================================================
  // TNI ANNUAL RETURNS — COMPLETED PERIOD CALENDAR CONTINUITY
  //
  // Require the exact N completed calendar years immediately preceding the
  // current year. Missing years or duplicate years invalidate the period.
  // ==========================================================================

  const expectedStartYear =
    dataset.current_year.year -
    years

  const expectedEndYear =
    dataset.current_year.year -
    1

  const selectedYears =
    dataset.data
      .filter(
        (row) =>
          row.year >=
            expectedStartYear &&
          row.year <=
            expectedEndYear,
      )
      .sort(
        (a, b) =>
          a.year - b.year,
      )

  const hasContinuousYears =
    selectedYears.length ===
      years &&
    selectedYears.every(
      (row, index) =>
        row.year ===
        expectedStartYear +
          index,
    )

  if (!hasContinuousYears) {
    return null
  }

  const growthFactor =
    selectedYears.reduce(
      (growth, row) =>
        growth *
        (1 + row.value / 100),
      1,
    )

  const cumulativeReturnPct =
    (growthFactor - 1) * 100

  const annualizedReturnPct =
    (
      Math.pow(
        growthFactor,
        1 / years,
      ) - 1
    ) * 100

  return {
    years,
    startYear:
      selectedYears[0].year,
    endYear:
      selectedYears[
        selectedYears.length - 1
      ].year,
    cumulativeReturnPct,
    annualizedReturnPct,
  }
}
