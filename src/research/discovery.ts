import { isArticlePublic } from './articleVisibility'
import { getHomepagePlacement, getPublicationImage, type HomepagePlacement } from './publication'
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
  image?: string
  sourceImage?: string
  homepagePlacement?: HomepagePlacement
  publishedAt?: string
  featured?: boolean
  topics?: string[]
  sector?: string
}

export const researchItems: ResearchItem[] = ([
  ...publishedAnnualReturnsResearchRegistry.map(({ config, previewImage, featured, publishAt }) => ({
    image: config.seo.socialImage || previewImage || config.annualReturnImage,
    publishedAt: publishAt,
    featured,
    slug: config.slug,
    path: config.canonicalPath,
    title: config.seo.socialTitle,
    description: config.seo.socialDescription,
    name: config.name,
    symbol: config.symbol,
    categories: config.categories,
    kind: 'annual' as const,
  })),
  ...monthlyReturnsRegistry.map(({ config, previewImage, featured }) => ({
    image: previewImage,
    featured,
    slug: config.slug,
    path: config.canonicalPath,
    title: config.seo.socialTitle,
    description: config.seo.socialDescription,
    name: config.name,
    symbol: config.symbol,
    categories: config.categories,
    kind: 'monthly' as const,
  })),
  ...drawdownsResearchRegistry.map(({ config, previewImage, featured }) => ({
    image: previewImage,
    featured,
    slug: config.slug,
    path: config.canonicalPath,
    title: config.seo.socialTitle,
    description: config.seo.socialDescription,
    name: config.name,
    symbol: config.symbol,
    categories: config.categories,
    kind: 'drawdowns' as const,
  })),
  {
    slug: 'new-iphone-release-apple-stock-price-history',
    path: '/new-iphone-release-apple-stock-price-history/',
    title: 'iPhone Launch & Stock Performance (2007–2026)',
    description: 'Interactive AAPL versus S&P 500 announcement returns, excess performance, and historical iPhone sales research.',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    categories: ['stock', 'trading', 'comparison'],
    kind: 'article',
    image: '/images/research/tni-iphone-launch-stock-performance.webp',
    topics: ['comparisons'],
    publishedAt: '2026-10-18',
  },
  ...additionalPublications,
] satisfies ResearchItem[]).filter(item => isArticlePublic(item.path))

// Source metadata is retained for the build-time image audit; final image paths
// are shared by the research cards, homepage cards, and article social metadata.
for (const item of researchItems) {
  item.sourceImage = item.image || (item.path === '/average-stock-market-return/' ? '/images/social/average-stock-market-return-og.png' : undefined)
  item.image = getPublicationImage(item.path, item.slug, item.sourceImage)
  item.homepagePlacement = getHomepagePlacement(item.path)
}

// Keep browser-rendered annual article metadata aligned with the build output.
for (const { config } of publishedAnnualReturnsResearchRegistry) {
  const item = researchItems.find((item) => item.path === config.canonicalPath)
  if (item?.image) config.seo.socialImage = item.image
}

export type ResearchHub = {
  path: string
  title: string
  description: string
  parent?: string
  match: (item: ResearchItem) => boolean
  view?: 'landing' | 'indexes' | 'index' | 'directory' | 'funds' | 'sectors' | 'company' | 'topics' | 'studies'
  symbol?: string
  sector?: string
}

const has = (item: ResearchItem, category: string) =>
  item.categories.includes(category)

// Normalize discovery labels without changing canonical article configurations.
for (const item of researchItems) {
  if (item.categories.includes('leveraged-etf') && !item.categories.includes('etf')) {
    item.categories = [...item.categories, 'etf']
  }
  // CRM belongs in the Dow research collection as well as its existing scopes.
  if (item.symbol.toUpperCase() === 'CRM' && item.categories.includes('stock') && !item.categories.includes('dow')) {
    item.categories = [...item.categories, 'dow']
  }
}

const stockItems = [...new Map(researchItems.filter((item) => has(item, 'stock')).map((item) => [item.symbol, item])).values()]

export const researchHubs: ResearchHub[] = [
  {
    path: '/research/trading/',
    title: 'Trading & Technical Analysis',
    description: 'Research on candlestick patterns, technical indicators, price action, and evidence-based trading strategies.',
    parent: '/research/',
    match: (item) => item.categories.includes('technical-analysis') || item.categories.includes('trading') || item.categories.includes('candlestick-patterns'),
  },
  {
    path: '/research/trading/candlestick-patterns/',
    title: 'Candlestick Patterns',
    description: 'Candlestick formations, Doji patterns, reversal signals, and trading applications.',
    parent: '/research/trading/',
    match: (item) => item.categories.includes('candlestick-patterns'),
  },
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
  if (has(item, 'technical-analysis')) return ['/research/trading/', ...(has(item, 'candlestick-patterns') ? ['/research/trading/candlestick-patterns/'] : [])].map((path) => getHub(path)!).filter(Boolean)

  if (has(item, 'leveraged-etf')) {
    paths.unshift('/research/etfs/leveraged/')
  }
  if (item.kind !== 'article' || has(item, 'market-history')) paths.push('/research/market-history/')
  if (has(item, 'etf')) paths.unshift(`/research/etfs/${item.symbol.toLowerCase()}/`)
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

// Discovery taxonomy is separate from historical/current index membership.
// Existing registry categories provide the research scope, not a live constituent feed.
export const researchSectors = [
  { id: 'technology', name: 'Information Technology' },
  { id: 'financials', name: 'Financials' },
  { id: 'health-care', name: 'Health Care' },
  { id: 'consumer-discretionary', name: 'Consumer Discretionary' },
  { id: 'communication-services', name: 'Communication Services' },
  { id: 'industrials', name: 'Industrials' },
  { id: 'consumer-staples', name: 'Consumer Staples' },
  { id: 'energy', name: 'Energy' },
  { id: 'utilities', name: 'Utilities' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'materials', name: 'Materials' },
]
// Editorial grouping of the currently covered companies. New records can set
// ResearchItem.sector explicitly; unknown companies remain in the A-Z directory.
const companySectors: Record<string, string> = {
  AAPL: 'technology', MSFT: 'technology', NVDA: 'technology', CRM: 'technology',
  AMZN: 'consumer-discretionary', TSLA: 'consumer-discretionary', NKE: 'consumer-discretionary',
  GOOGL: 'communication-services', GOOG: 'communication-services',
  GS: 'financials', BRKB: 'financials', 'BRK.B': 'financials', 'BRK-B': 'financials',
}
export const getResearchSector = (item: ResearchItem) => item.sector || companySectors[item.symbol.toUpperCase()]
export const researchTopics = [
  { id: 'returns', name: 'Returns & Performance', description: 'Annual returns, total returns, and long-term performance.' },
  { id: 'risk', name: 'Risk & Drawdowns', description: 'Declines, volatility, recovery, and the path through uncertainty.' },
  { id: 'comparisons', name: 'Benchmark Comparisons', description: 'Put performance in context against a benchmark.' },
  { id: 'seasonality', name: 'Seasonality', description: 'Monthly returns and patterns across the calendar.' },
  { id: 'history', name: 'Market History', description: 'Market cycles and the events that shaped them.' },
  { id: 'earnings', name: 'Earnings', description: 'Earnings forecasts, historical reactions, and company results.' },
  { id: 'other', name: 'More Research', description: 'Additional published perspectives and company studies.' },
]
export function getResearchTopics(item: ResearchItem): string[] {
  if (item.topics?.length) return item.topics
  if (item.kind === 'monthly') return ['seasonality']
  if (item.kind === 'drawdowns' || has(item, 'drawdowns') || has(item, 'risk')) return ['risk']
  if (has(item, 'comparison') || has(item, 'comparisons')) return ['comparisons']
  if (item.kind === 'annual') return ['returns']
  if (has(item, 'market-history') || has(item, 'market-crash')) return ['history']
  return ['other']
}
export function uniqueResearch(items: ResearchItem[]) {
  return [...new Map(items.map((item) => [item.path, item])).values()]
}
export function sortResearch(items: ResearchItem[], sort: 'newest' | 'title' = 'newest') {
  return uniqueResearch(items).sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title)
    const date = (s?: string) => s && Number.isFinite(Date.parse(s)) ? Date.parse(s) : 0
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      date(b.publishedAt) - date(a.publishedAt) || a.title.localeCompare(b.title)
  })
}
export function getResearchCompanies(items: ResearchItem[], category: 'stock' | 'etf' = 'stock') {
  const companies = new Map<string, { symbol: string; name: string; path: string; count: number; sector?: string }>()
  for (const item of uniqueResearch(items).filter((item) => has(item, category))) {
    const existing = companies.get(item.symbol)
    if (existing) existing.count += 1
    else companies.set(item.symbol, { symbol: item.symbol, name: item.name,
      path: `/research/${category === 'stock' ? 'stocks' : 'etfs'}/${item.symbol.toLowerCase()}/`, count: 1, sector: getResearchSector(item) })
  }
  return [...companies.values()].sort((a, b) => a.name.localeCompare(b.name))
}
export function getResearchBreadcrumbs(hub: ResearchHub): ResearchHub[] {
  const result: ResearchHub[] = []
  const visited = new Set<string>()
  let current: ResearchHub | undefined = hub
  while (current && !visited.has(current.path)) {
    result.unshift(current); visited.add(current.path)
    current = current.parent ? getHub(current.parent) : undefined
  }
  return result
}
const newHub = (hub: ResearchHub) => { if (!getHub(hub.path)) researchHubs.push(hub) }
const topicHubs = (parent: ResearchHub, items: ResearchItem[]) => {
  for (const topic of researchTopics.filter((topic) => items.some((item) => getResearchTopics(item).includes(topic.id)))) {
    newHub({ path: `${parent.path}topics/${topic.id}/`, title: `${parent.title.replace(/ Stock Intelligence$/, '')}: ${topic.name}`,
      description: topic.description, parent: parent.path, view: 'studies',
      match: (item) => parent.match(item) && getResearchTopics(item).includes(topic.id) })
  }
}
for (const hub of [...researchHubs]) {
  if (hub.path === '/research/') {
    hub.view = 'landing'; hub.title = 'Research';
    hub.description = 'Original research, historical data, and clear paths from one market question to the next.'
  } else if (hub.path === '/research/indexes/') hub.view = 'indexes'
  else if (hub.path === '/research/stocks/') hub.view = 'directory'
  else if (hub.path.startsWith('/research/stocks/')) {
    hub.view = 'company'; hub.symbol = stockItems.find((item) => hub.path === `/research/stocks/${item.symbol.toLowerCase()}/`)?.symbol
    hub.sector = hub.symbol ? companySectors[hub.symbol.toUpperCase()] : undefined
    topicHubs(hub, getHubItems(hub))
  } else if (hub.path.startsWith('/research/indexes/')) {
    hub.view = 'index'
    const scope = hub.match
    const indexItems = researchItems.filter((item) => scope(item) && !has(item, 'stock') && !has(item, 'etf'))
    const indexOnly: ResearchHub = { ...hub, match: (item) => scope(item) && !has(item, 'stock') && !has(item, 'etf') }
    topicHubs(indexOnly, indexItems)
    newHub({ ...indexOnly, path: `${hub.path}studies/`, parent: hub.path, view: 'studies', title: `${hub.title}: All Studies` })
    newHub({ path: `${hub.path}companies/`, parent: hub.path, view: 'directory', title: `${hub.title}: Companies`,
      description: 'Find company research by name or ticker.', match: (item) => scope(item) && has(item, 'stock') })
    const sectorPath = `${hub.path}sectors/`
    newHub({ path: sectorPath, parent: hub.path, view: 'sectors', title: `${hub.title}: Sectors`,
      description: 'Explore company research by sector. Select a collection with published studies.',
      match: (item) => scope(item) && has(item, 'stock') })
    for (const sector of researchSectors) {
      const match = (item: ResearchItem) => scope(item) && has(item, 'stock') && getResearchSector(item) === sector.id
      if (researchItems.some(match)) newHub({ path: `${sectorPath}${sector.id}/`, parent: sectorPath,
        title: `${sector.name} Research`, description: 'Find a company, then explore its research. Organized alphabetically for effortless discovery.',
        view: 'directory', sector: sector.id, match })
    }
  } else {
    hub.view = 'topics'
    topicHubs(hub, getHubItems(hub))
  }
}
newHub({ path: '/research/archive/', title: 'The Research Library', description: 'Search every published study by company, ticker, title, or topic.',
  parent: '/research/', view: 'studies', match: () => true })
newHub({ path: '/research/history-and-risk/', title: 'Market History & Risk',
  description: 'Explore market cycles, declines, and the lessons of the past.', parent: '/research/', view: 'topics',
  match: (item) => item.kind === 'drawdowns' || has(item, 'drawdowns') || has(item, 'market-crash') || (item.kind === 'article' && has(item, 'market-history')) })
topicHubs(getHub('/research/history-and-risk/')!, getHubItems(getHub('/research/history-and-risk/')!))

// Fund discovery uses the same small directory > topic > canonical study flow.
for (const path of ['/research/etfs/leveraged/']) {
  const hub = getHub(path)
  if (hub) hub.view = 'funds'
}
const etfRoot = getHub('/research/etfs/')!
etfRoot.view = 'indexes'
etfRoot.description = 'Choose regular ETFs or leveraged ETFs, then explore each fund and its published studies.'
// ETF root is a two-part directory. Topic routes remain valid for existing links.
newHub({ path: '/research/etfs/regular/', title: 'Regular ETFs',
  description: 'Published research on funds without leveraged daily objectives.',
  parent: etfRoot.path, view: 'funds',
  match: (item) => has(item, 'etf') && !has(item, 'leveraged-etf') })
const leveragedHub = getHub('/research/etfs/leveraged/')!
leveragedHub.title = 'Leveraged ETFs'
for (const fund of getResearchCompanies(researchItems, 'etf')) {
  const hub: ResearchHub = { path: fund.path, title: `${fund.name} Fund Research`,
    description: 'Explore published fund performance, risk, and benchmark studies.',
    parent: researchItems.some((item) => item.symbol === fund.symbol && has(item, 'leveraged-etf')) ? '/research/etfs/leveraged/' : '/research/etfs/regular/', view: 'company', symbol: fund.symbol,
    match: (item) => has(item, 'etf') && item.symbol === fund.symbol }
  newHub(hub); topicHubs(hub, getHubItems(hub))
}
