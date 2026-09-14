// ============================================================================
// TNI ANNUAL RETURNS — SHARED PAGE TYPES / HELPERS / CARDS
//
// Purpose:
// - Preserve the existing S&P 500 annual-return page presentation.
// - Reuse the same data shape, formatting, regimes and card components.
// - Support GenericAnnualReturnsPage without duplicating visual logic.
// ============================================================================

// ============================================================================
// TNI ANNUAL RETURNS — PAGE DATA TYPES
// ============================================================================

export type AnnualReturnRecord = {
  year: number
  value: number
  label: string
  status: string
}

export type AnnualReturnsPageData = {
  symbol: string
  ticker: string
  metric: string
  return_type: string
  source: string

  methodology: {
    calculation: string
    current_year: string
  }

  summary: {
    completed_years_analyzed: number
    start_year: number
    end_year: number
    positive_years: number
    negative_years: number
    positive_year_pct: number
    negative_year_pct: number
    average_annual_return_pct: number
    median_annual_return_pct: number

    best_year: {
      year: number
      return_pct: number
    }

    worst_year: {
      year: number
      return_pct: number
    }
  }

  current_year: {
    year: number
    label: string
    return_pct: number
  }

  data: AnnualReturnRecord[]
}

// ============================================================================
// TNI RETURN EXPLORER — FILTER TYPES
// ============================================================================

export type PerformanceFilter =
  | "all"
  | "positive"
  | "negative"

export type RangePreset =
  | "all"
  | "3y"
  | "5y"
  | "10y"
  | "20y"
  | "custom"

// ============================================================================
// TNI ANNUAL RETURNS — NUMBER FORMATTING
// ============================================================================

export function formatReturn(
  value: number,
) {
  const sign =
    value > 0 ? "+" : ""

  return `${sign}${value.toFixed(2)}%`
}

// ============================================================================
// TNI ANNUAL RETURNS — RETURN REGIME
//
// RED    = Negative return
// AMBER  = 0% to <10%
// GREEN  = >=10%
// ============================================================================

export function getReturnRegime(
  value: number,
) {
  if (value < 0) {
    return {
      label: "Negative",
      textColor: "#b42318",
      background: "#fef3f2",
      border: "#fecdca",
    }
  }

  if (value < 10) {
    return {
      label: "0% – <10%",
      textColor: "#9a6700",
      background: "#fffaeb",
      border: "#fedf89",
    }
  }

  return {
    label: "≥10%",
    textColor: "#067647",
    background: "#ecfdf3",
    border: "#abefc6",
  }
}

// ============================================================================
// TNI RETURN EXPLORER — MEDIAN CALCULATION
// ============================================================================

export function calculateMedian(
  values: number[],
) {
  if (values.length === 0) {
    return 0
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b,
    )

  const middle =
    Math.floor(
      sorted.length / 2,
    )

  if (
    sorted.length % 2 === 0
  ) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2
  }

  return sorted[middle]
}

// ============================================================================
// TNI ANNUAL RETURNS — STATISTIC CARD
//
// Exact visual structure preserved from the S&P 500 reference page.
// ============================================================================

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div
      style={{
        minHeight: "112px",
        padding: "18px",
        border: "1px solid #e4ebf3",
        borderRadius: "10px",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          marginBottom: "9px",
          color: "#728197",
          fontSize: "11px",
          fontWeight: 750,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#10233f",
          fontSize: "23px",
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>

      {detail && (
        <div
          style={{
            marginTop: "5px",
            color: "#8592a3",
            fontSize: "11px",
          }}
        >
          {detail}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// TNI ANNUAL RETURNS — INFORMATION CARD
//
// Exact visual structure preserved from the S&P 500 reference page.
// ============================================================================

export function InfoCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        padding: "18px",
        border: "1px solid #e4ebf3",
        borderRadius: "10px",
        background: "#f9fbfd",
      }}
    >
      <div
        style={{
          marginBottom: "7px",
          color: "#738298",
          fontSize: "10px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#263a53",
          fontSize: "13px",
          fontWeight: 650,
          lineHeight: 1.5,
        }}
      >
        {value}
      </div>
    </div>
  )
}

// ============================================================================
// TNI RETURN EXPLORER — FILTER BUTTON
// ============================================================================

export function FilterButton({
  active,
  onClick,
  children,
  ariaLabel,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      className={
        active
          ? 'tni-filter-button tni-filter-button-active'
          : 'tni-filter-button'
      }
      onClick={onClick}
    >
      {children}
    </button>
  )
}
