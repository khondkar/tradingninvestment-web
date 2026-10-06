import { publishedAnnualReturnsResearchRegistry } from './annual-returns/registry'
import { monthlyReturnsRegistry } from './monthly-returns/registry'
import { drawdownsResearchRegistry } from './drawdowns/registry'
import { additionalPublications } from './additional-publications'

export type ResearchItem = {
  slug: string
  path: string
  title: string
  description: string
  name: string
  symbol: string
  categories: string[]
  kind: 'annual' | 'monthly' | 'drawdowns' | 'article'
}

export const researchItems: ResearchItem[] = [
  ...publishedAnnualReturnsResearchRegistry.map(({ config }) => ({
    slug: config.slug,
    path: config.canonicalPath,
    title: config.seo.socialTitle,
    description: config.seo.socialDescription,
    name: config.name,
    symbol: config.symbol,
    categories: config.categories,
    kind: 'annual' as const,
  })),
  ...monthlyReturnsRegistry.map(({ config }) => ({
    slug: config.slug,
    path: config.canonicalPath,
    title: config.seo.socialTitle,
    description: config.seo.socialDescription,
    name: config.name,
    symbol: config.symbol,
    categories: config.categories,
    kind: 'monthly' as const,
  })),
  ...drawdownsResearchRegistry.map(({ config }) => ({
    slug: config.slug,
    path: config.canonicalPath,
    title: config.seo.socialTitle,
    description: config.seo.socialDescription,
    name: config.name,
    symbol: config.symbol,
    categories: config.categories,
    kind: 'drawdowns' as const,
  })),
  ...additionalPublications,
]

export type ResearchHub = {
  path: string
  title: string
  description: string
  parent?: string
  match: (item: ResearchItem) => boolean
}

const has = (item: ResearchItem, category: string) =>
  item.categories.includes(category)

const stockItems = [...new Map(researchItems.filter((item) => has(item, 'stock')).map((item) => [item.symbol, item])).values()]

export const researchHubs: ResearchHub[] = [
  {
    path: '/research/market-crashes/',
    title: 'Market Crashes',
    description: 'Historical research on market crashes and their consequences.',
    parent: '/research/market-history/',
    match: (item) => has(item, 'market-crash'),
  },

  {
    path: '/research/',
    title: 'Explore TNI Research',
    description: 'Explore published market studies by company, index, market history, or risk. Each study has one permanent article address.',
    match: () => true,
  },
  {
    path: '/research/stocks/',
    title: 'Stock Research',
    description: 'Company-level research and interactive historical returns for the stocks covered by TNI.',
    parent: '/research/',
    match: (item) => has(item, 'stock'),
  },
  {
    path: '/research/etfs/',
    title: 'ETF Research',
    description: 'ETF performance research, historical returns, benchmark comparisons, and fund-level market intelligence.',
    parent: '/research/',
    match: (item) => has(item, 'etf'),
  },
  {
    path: '/research/etfs/leveraged/',
    title: 'Leveraged ETF Research',
    description: 'Historical performance, compounding, drawdowns, and benchmark comparisons for leveraged ETFs covered by TNI.',
    parent: '/research/etfs/',
    match: (item) => has(item, 'leveraged-etf'),
  },
  {
    path: '/research/indexes/',
    title: 'Index Research',
    description: 'S&P 500, Nasdaq Composite, and Dow Jones historical performance research.',
    parent: '/research/',
    match: (item) => has(item, 'index'),
  },
  {
    path: '/research/market-history/',
    title: 'Market History',
    description: 'Historical annual and monthly returns, corrections, and long-term market behavior.',
    parent: '/research/',
    match: (item) => item.kind !== 'article' || has(item, 'market-history'),
  },
  {
    path: '/research/market-risk/',
    title: 'Market Risk',
    description: 'Research on S&P 500 corrections, bear markets, drawdowns, and recovery periods.',
    parent: '/research/',
    match: (item) => has(item, 'drawdowns'),
  },
  {
    path: '/research/indexes/sp-500/',
    title: 'S&P 500 Research',
    description: 'S&P 500 returns, drawdowns, and research on companies covered by TNI that are classified in the S&P 500.',
    parent: '/research/indexes/',
    match: (item) => has(item, 'sp500'),
  },
  {
    path: '/research/indexes/nasdaq/',
    title: 'Nasdaq Research',
    description: 'Nasdaq Composite index history and separate research on Nasdaq-listed companies. A listing does not imply membership in the Composite for every historical date.',
    parent: '/research/indexes/',
    match: (item) => has(item, 'nasdaq'),
  },
  {
    path: '/research/indexes/dow/',
    title: 'Dow Jones Research',
    description: 'Dow Jones Industrial Average history and research on covered companies classified in the Dow.',
    parent: '/research/indexes/',
    match: (item) => has(item, 'dow') || has(item, 'djia'),
  },
  ...stockItems.map((stock) => ({
    path: `/research/stocks/${stock.symbol.toLowerCase()}/`,
    title: `${stock.name} Stock Intelligence`,
    description: `${stock.name} company research, historical performance, and paths into broader market context.`,
    parent: '/research/stocks/',
    match: (item: ResearchItem) => item.symbol === stock.symbol,
  })),
]

export const getHub = (path: string) =>
  researchHubs.find((hub) => hub.path.replace(/\/$/, '') === path.replace(/\/$/, ''))

export const getHubItems = (hub: ResearchHub) => researchItems.filter(hub.match)

export function getItemHubs(item: ResearchItem) {
  const primary =
    has(item, 'stock')
      ? '/research/stocks/'
      : has(item, 'etf')
        ? '/research/etfs/'
        : '/research/indexes/'

  const paths = [primary]

  if (has(item, 'leveraged-etf')) {
    paths.unshift('/research/etfs/leveraged/')
  }
  if (item.kind !== 'article' || has(item, 'market-history')) paths.push('/research/market-history/')
  if (has(item, 'stock')) paths.unshift(`/research/stocks/${item.symbol.toLowerCase()}/`)
  if (has(item, 'index') && has(item, 'sp500')) paths.unshift('/research/indexes/sp-500/')
  if (has(item, 'index') && has(item, 'nasdaq')) paths.unshift('/research/indexes/nasdaq/')
  if (has(item, 'index') && has(item, 'dow')) paths.unshift('/research/indexes/dow/')
  if (has(item, 'sp500')) paths.push('/research/indexes/sp-500/')
  if (has(item, 'nasdaq')) paths.push('/research/indexes/nasdaq/')
  if (has(item, 'dow') || has(item, 'djia')) paths.push('/research/indexes/dow/')
  if (has(item, 'drawdowns')) paths.push('/research/market-risk/')
  if (has(item, 'market-crash')) paths.push('/research/market-crashes/')
  return [...new Set(paths)].map((path) => getHub(path)!).filter(Boolean)
}

export function getRelatedItems(item: ResearchItem, limit = 3) {
  const curatedPaths: Record<string, string[]> = {
    "/soxl-etf/": [
      "/sp-500-monthly-returns/",
      "/aapl-stock-yearly-return/",
    ],
    "/nvdl-etf/": [
      "/stock-market-historical-returns/",
      "/nvda-returns/",
    ],
  }

  const curated = (curatedPaths[item.path] ?? [])
    .map((path) =>
      researchItems.find((candidate) => candidate.path === path)
    )
    .filter((candidate): candidate is ResearchItem => Boolean(candidate))

  const automatic = researchItems
    .filter(
      (candidate) =>
        candidate.path !== item.path &&
        !curated.some((selected) => selected.path === candidate.path)
    )
    .map((candidate) => ({
      candidate,
      score:
        (candidate.symbol === item.symbol ? 4 : 0) +
        candidate.categories.filter((category) => item.categories.includes(category)).length +
        (candidate.kind === item.kind ? 0 : 1),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .map(({ candidate }) => candidate)

  return [...curated, ...automatic].slice(0, limit)
}
