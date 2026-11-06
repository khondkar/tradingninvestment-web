import * as d3 from 'd3'
import type { MarketRecord } from '../../hooks/useMarketTodaySnapshot'

export type HeatNode = {
  name: string
  stock?: MarketRecord
  weight?: number
  children?: HeatNode[]
}

export function makeHeatmapLayout(
  stocks: MarketRecord[],
  width: number,
  height: number
) {
  const groups = [...d3.group(stocks, s => s.sector)]

  const strongest = (rows: MarketRecord[]) =>
    Math.max(0, ...rows.map(s => Math.abs(s.change_pct)))

  groups.sort((a, b) =>
    strongest(b[1]) - strongest(a[1]) ||
    a[0].localeCompare(b[0])
  )

  const children: HeatNode[] = groups.map(([name, rows]) => {
    const weights = rows.map(s =>
      Math.pow(
        Math.min(12, Math.max(.20, Math.abs(s.change_pct))),
        2.2
      )
    )

    // Global stock weights: identical daily moves receive
    // identical area weights, regardless of sector.
    // Sector area is the sum of its constituent stock weights.
    return {
      name,
      children: rows.map((stock, i) => ({
        name: stock.ticker,
        stock,
        weight: weights[i]
      }))
    }
  })

  const root = d3.hierarchy<HeatNode>({
    name: 'S&P 500',
    children
  })
    .sum(node => node.weight ?? 0)
    .sort((a, b) => {
      if (a.depth === 1 && b.depth === 1) {
        const peak = (node: HeatNode) =>
          Math.max(0, ...(node.children ?? []).map(
            child => Math.abs(child.stock?.change_pct ?? 0)
          ))
        return peak(b.data) - peak(a.data) ||
          a.data.name.localeCompare(b.data.name)
      }
      return (b.value ?? 0) - (a.value ?? 0)
    })

  return d3.treemap<HeatNode>()
    .size([width, height])
    .paddingOuter(7)
    .paddingInner(node => node.depth === 0 ? 9 : 3)
    .paddingTop(node => node.depth === 1 ? 38 : 0)
    .round(true)(root)
}
