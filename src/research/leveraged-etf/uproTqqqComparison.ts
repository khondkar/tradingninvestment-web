export type PairPoint = { date: string; upro: number; tqqq: number }
export type PairRange = 'YTD' | '1Y' | '3Y' | '5Y' | '10Y' | 'ALL'
export const pairRanges: PairRange[] = ['YTD', '1Y', '3Y', '5Y', '10Y', 'ALL']
const day = (date: string) => Date.parse(date + 'T00:00:00Z')
export function selectPairRange(data: PairPoint[], range: PairRange) {
  if (range === 'ALL') return data
  const end = new Date(day(data[data.length - 1].date))
  const year = end.getUTCFullYear()
  const target = range === 'YTD' ? Date.UTC(year - 1, 11, 31)
    : Date.UTC(year - Number(range.slice(0, -1)), end.getUTCMonth(), end.getUTCDate())
  // Use the last common trading close on or before the calendar cutoff.
  let start = -1
  for (let i = 0; i < data.length && day(data[i].date) <= target; i++) start = i
  return start < 0 ? [] : data.slice(start)
}
export function pairStats(rows: PairPoint[], key: 'upro' | 'tqqq') {
  if (rows.length < 2) return null
  const first = rows[0], last = rows[rows.length - 1]
  const growth = last[key] / first[key]
  const years = (day(last.date) - day(first.date)) / (365.25 * 86400000)
  let peak = rows[0][key], peakIndex = 0, worst = 0, troughIndex = 0, worstPeakIndex = 0
  rows.forEach((row, i) => {
    if (row[key] >= peak) { peak = row[key]; peakIndex = i }
    const dd = row[key] / peak - 1
    if (dd < worst) { worst = dd; troughIndex = i; worstPeakIndex = peakIndex }
  })
  const recoveryIndex = worst === 0 ? 0 : rows.findIndex((row, i) => i > troughIndex && row[key] >= rows[worstPeakIndex][key])
  const days = (a: number, b: number) => Math.round((day(rows[a].date) - day(rows[b].date)) / 86400000)
  return { total: (growth - 1) * 100, cagr: (Math.pow(growth, 1 / years) - 1) * 100,
    ending: 10000 * growth, drawdown: worst * 100,
    peakDate: rows[worstPeakIndex].date, troughDate: rows[troughIndex].date,
    recoveryDate: recoveryIndex < 0 ? null : rows[recoveryIndex].date,
    lowToRecovery: recoveryIndex < 0 ? null : days(recoveryIndex, troughIndex),
    underwater: recoveryIndex < 0 ? null : days(recoveryIndex, worstPeakIndex) }
}
