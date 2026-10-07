import type { StockResearchData } from '../research/annual-returns/stockDataRegistry'
import type { LeveragedEtfResearchData } from '../research/annual-returns/leveragedEtfDataRegistry'
import type { EtfResearchData } from '../research/annual-returns/etfDataRegistry'

const loaders = import.meta.glob(['./generated/*.json', '!./generated/home-previews.json'], { import: 'default' })
const cache = new Map<string, unknown>()

export async function loadResearchData(kind: 'stock' | 'leveraged' | 'etf', symbol: string) {
  const key = `${kind}-${symbol.toUpperCase()}`
  if (cache.has(key)) return
  const load = loaders[`./generated/${key}.json`]
  if (load) cache.set(key, await load())
}

export const getStockResearchData = (symbol: string) => cache.get(`stock-${symbol}`) as StockResearchData | undefined
export const getLeveragedEtfResearchData = (symbol: string) => cache.get(`leveraged-${symbol}`) as LeveragedEtfResearchData | undefined
export const getEtfResearchData = (symbol: string) => cache.get(`etf-${symbol.toUpperCase()}`) as EtfResearchData | undefined
