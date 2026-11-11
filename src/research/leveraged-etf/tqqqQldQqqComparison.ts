export type NasdaqFund = 'qqq' | 'qld' | 'tqqq'
export type NasdaqPoint = { date: string; qqq: number; qld: number; tqqq: number }
export type ComparisonFrequency = 'Yearly' | 'Monthly' | 'Weekly' | 'Daily'

export const nasdaqFunds = [
  { key: 'qqq', ticker: 'QQQ', label: 'Nasdaq-100', color: '#075ac8' },
  { key: 'qld', ticker: 'QLD', label: '2× daily', color: '#00704a' },
  { key: 'tqqq', ticker: 'TQQQ', label: '3× daily', color: '#b22238' },
] as const

function periodEnd(date: string, frequency: ComparisonFrequency): string {
  const stamp = new Date(`${date}T00:00:00Z`)
  switch (frequency) {
    case 'Yearly':
      return `${stamp.getUTCFullYear()}-12-31`
    case 'Monthly':
      return new Date(Date.UTC(stamp.getUTCFullYear(), stamp.getUTCMonth() + 1, 0)).toISOString().slice(0, 10)
    case 'Weekly':
      stamp.setUTCDate(stamp.getUTCDate() + (5 - stamp.getUTCDay() + 7) % 7)
      return stamp.toISOString().slice(0, 10)
    case 'Daily':
      return date
  }
}

export function comparisonPeriods(data: NasdaqPoint[], frequency: ComparisonFrequency) {
  const groups = new Map<string, NasdaqPoint>()
  for (const point of data) groups.set(periodEnd(point.date, frequency), point)
  const closes = [...groups.entries()]
  return closes.slice(1).map(([end, point], index) => {
    const previous = closes[index][1]
    return {
      date: point.date,
      partial: end > data[data.length - 1].date,
      qqq: (point.qqq / previous.qqq - 1) * 100,
      qld: (point.qld / previous.qld - 1) * 100,
      tqqq: (point.tqqq / previous.tqqq - 1) * 100,
    }
  }).reverse()
}
