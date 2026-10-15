export type ComparisonPoint = {
  date: string
  etf: number
  underlying: number
}

export type WeekdayPoint = {
  day: string
  observations: number
  up_pct: number
  down_pct: number
  flat_pct: number
  average_return_pct: number
  average_positive_return_pct: number
  average_negative_return_pct: number
}

export type MonthlyPoint = {
  month: string
  label: string
  status: string
  start_date: string
  end_date: string
  etf_return_pct: number
  underlying_return_pct: number
  difference_pp: number
}

export type RiskStatistics = {
  max_drawdown_pct: number
  annualized_volatility_pct: number
  positive_days_pct: number
  daily_return_observations: number
}

export type LeveragedEtfComparison = {
  etfTicker: string
  underlyingTicker: string
  growth: ComparisonPoint[]
  drawdown: ComparisonPoint[]
  weekdays: {
    etf: WeekdayPoint[]
    underlying: WeekdayPoint[]
  }
  months: MonthlyPoint[]
  risk: {
    etf: RiskStatistics
    underlying: RiskStatistics
  }
}

type RawDailyPoint = {
  date: string
  [ticker: string]: string | number
}

type RawMonthlyPoint = {
  month: string
  label: string
  status: string
  start_date: string
  end_date: string
  difference_pp: number
  [field: string]: string | number
}

export function normalizeComparison(input: {
  etfTicker: string
  underlyingTicker: string
  growth: { data: RawDailyPoint[] }
  drawdown: {
    data: RawDailyPoint[]
    summary: Record<string, RiskStatistics>
  }
  weekdays: { tickers: Record<string, WeekdayPoint[]> }
  monthly: { months: RawMonthlyPoint[] }
}): LeveragedEtfComparison {
  const etf = input.etfTicker.toLowerCase()
  const underlying = input.underlyingTicker.toLowerCase()

  const numeric = (value: string | number): number => {
    const result = Number(value)
    if (!Number.isFinite(result)) {
      throw new Error("Invalid leveraged ETF comparison value")
    }
    return result
  }

  const normalizeDaily = (
    points: RawDailyPoint[]
  ): ComparisonPoint[] =>
    points.map(point => ({
      date: point.date,
      etf: numeric(point[etf]),
      underlying: numeric(point[underlying])
    }))

  const etfWeekdays = input.weekdays.tickers[input.etfTicker]
  const underlyingWeekdays =
    input.weekdays.tickers[input.underlyingTicker]
  const etfRisk = input.drawdown.summary[etf]
  const underlyingRisk = input.drawdown.summary[underlying]

  if (!etfWeekdays || !underlyingWeekdays || !etfRisk || !underlyingRisk) {
    throw new Error("Missing leveraged ETF comparison data")
  }

  return {
    etfTicker: input.etfTicker,
    underlyingTicker: input.underlyingTicker,
    growth: normalizeDaily(input.growth.data),
    drawdown: normalizeDaily(input.drawdown.data),
    weekdays: {
      etf: etfWeekdays,
      underlying: underlyingWeekdays
    },
    months: input.monthly.months.map(point => ({
      month: point.month,
      label: point.label,
      status: point.status,
      start_date: point.start_date,
      end_date: point.end_date,
      etf_return_pct: numeric(point[`${etf}_return_pct`]),
      underlying_return_pct: numeric(
        point[`${underlying}_return_pct`]
      ),
      difference_pp: point.difference_pp
    })),
    risk: {
      etf: etfRisk,
      underlying: underlyingRisk
    }
  }
}
