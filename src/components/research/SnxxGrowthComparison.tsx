import LeveragedEtfGrowthComparison from "./leveraged-etf/LeveragedEtfGrowthComparison"
import { normalizeComparison } from "../../research/leveraged-etf/normalizeComparison"

import growth from "../../data/charts/snxxSndkGrowthComparison.json"
import drawdown from "../../data/charts/snxxSndkRiskComparison.json"
import weekdays from "../../data/charts/snxxSndkWeekdayComparison.json"
import monthly from "../../data/charts/snxxSndkMonthlyComparison.json"

const comparison = normalizeComparison({
  etfTicker: "SNXX",
  underlyingTicker: "SNDK",
  growth,
  drawdown,
  weekdays,
  monthly
})

export default function SnxxGrowthComparison() {
  return (
    <LeveragedEtfGrowthComparison
      etfTicker={comparison.etfTicker}
      underlyingTicker={comparison.underlyingTicker}
      data={comparison.growth}
    />
  )
}
