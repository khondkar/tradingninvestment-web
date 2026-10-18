import type { ResearchItem } from './discovery'

// Register a new article once its canonical page has been published. The
// discovery graph then places it in the matching company, index and topic
// hubs, suggests it alongside related articles, and adds it to the sitemap.
//
// Example for a future NVIDIA study:
// {
//   slug: 'nvda-earnings-history',
//   path: '/nvda-earnings-history/',
//   title: 'NVIDIA Earnings History',
//   description: 'A study of NVIDIA earnings through time.',
//   name: 'NVIDIA',
//   symbol: 'NVDA',
//   categories: ['stock', 'sp500', 'nasdaq', 'earnings'],
//   kind: 'article',
// }

export const additionalPublications: ResearchItem[] = [
  {
    slug: 'nasdaq-selloff-2026',
    path: '/nasdaq-selloff-2026/',
    title: 'Nasdaq Selloff 2026: AI Stocks, Semiconductor Risk and SOXL',
    description: 'Original TNI research on the 2026 Nasdaq selloff, semiconductor stock drawdowns, SOXL daily leverage risk and historical market corrections.',
    name: 'Nasdaq Composite',
    symbol: 'IXIC',
    image: '/images/social/research/nasdaq-selloff-2026-tni-horizontal.svg',
    categories: ['index', 'nasdaq', 'etf', 'leveraged-etf', 'market-history'],
    kind: 'article',
    publishedAt: '2026-10-16',
  },
  {
    slug: 'snxx-etf',
    path: '/snxx-etf/',
    title: 'SNXX Leveraged ETF: Performance, Returns & Risk vs. SNDK',
    description: 'Original research comparing SNXX and SNDK through daily returns, monthly performance, growth of $10,000, drawdowns, and rolling volatility.',
    name: 'SNXX Leveraged ETF',
    symbol: 'SNXX',
    image: '/images/social/snxx-vs-sndk-drawdown-og.png',
    categories: ['etf', 'leveraged-etf'],
    kind: 'article',
    publishedAt: '2026-10-15',
  },

  {
    slug: '100-years-dow-jones-industrial-average-djia-events-history-chart',
    path: '/100-years-dow-jones-industrial-average-djia-events-history-chart/',
    title: '100 Years of Dow Jones Industrial Average: Events, History & Charts (1920–2026)',
    description: 'Explore Dow Jones history from 1920 to 2026, including major market events, historical charts, crashes, and recoveries.',
    name: 'Dow Jones Industrial Average',
    symbol: 'DJIA',
    image: '/wp-content/uploads/2015/12/Dow-Jones-History-1920-to-1940-r43.jpg',
    categories: ['index', 'dow', 'market-history'],
    kind: 'article',
    publishedAt: '2026-10-14',
  },



  {
    slug: 'jpm-vs-gs-earnings-analysis',
    path: '/research/jpm-vs-gs-earnings-analysis/',
    title: 'JPMorgan vs. Goldman Sachs Earnings: Historical EPS, Revenue and Market Reactions',
    description: 'Original research comparing 46 JPMorgan and Goldman Sachs earnings announcements from 2021 to 2026, including EPS expectations, revenue, and early stock-price reactions.',
    name: 'JPMorgan vs. Goldman Sachs Earnings Research',
    symbol: 'GS',
    categories: ['stock', 'earnings'],
    kind: 'article',
    publishedAt: '2026-10-12',
  },

  {
    slug: 'doji-candlestick-spy-26-year-study',
    path: '/research/doji-candlestick-spy-26-year-study/',
    title: 'Does the Doji Candlestick Really Work? A 26-Year SPY Study',
    description: 'Original empirical research on Doji candlestick performance across 6,726 SPY trading sessions, including market regimes, confirmation signals, and bootstrap validation.',
    name: 'SPY Doji Candlestick Research',
    symbol: 'SPY',
    categories: ['technical-analysis', 'trading', 'candlestick-patterns', 'etf', 'sp500'],
    kind: 'article',
    publishedAt: '2026-10-11',
  },
  {
    slug: 'gravestone-doji-candlestick-pattern',
    path: '/gravestone-doji-candlestick-pattern/',
    title: 'Trading Setups for Bearish and Bullish Gravestone Doji',
    description: 'Original 2016 TradingNInvestment article explaining Gravestone Doji candlestick formations, bullish and bearish trading setups, and historical chart examples.',
    name: 'Gravestone Doji Candlestick Pattern',
    symbol: 'DOJI',
    categories: ['technical-analysis', 'trading', 'candlestick-patterns'],
    kind: 'article',
    publishedAt: '2016-01-21',
  },
  {
    slug: 'magic-doji-or-myth-and-how-to-use-doji-for-stock-trading',
    path: '/magic-doji-or-myth-and-how-to-use-doji-for-stock-trading/',
    title: 'Magic Doji or Myth and How to Use Doji for Stock Trading',
    description: 'Original TNI research on Doji formation, market indecision, bullish and bearish patterns, and trading setups.',
    name: 'Doji Candlestick',
    symbol: 'DOJI',
    image: '/images/research/tni-doji-research-cover.png',
    categories: ['technical-analysis', 'trading', 'candlestick-patterns'],
    kind: 'article',
    publishedAt: '2016-02-16',
  },
  {
    slug: 'average-stock-market-return',
    path: '/average-stock-market-return/',
    title: 'Average Stock Market Return: Dividends, Inflation & 150+ Years of History',
    description: 'Explore more than 150 years of U.S. stock market returns, comparing total return with dividends reinvested, inflation-adjusted real return, and price return.',
    name: 'U.S. Stock Market',
    symbol: 'SP500',
    categories: ['index', 'sp500', 'market-history'],
    kind: 'article',
  },
  {
    slug: 'stock-market-crash-of-1929',
    path: '/stock-market-crash-of-1929/',
    title: 'Stock Market Crash of 1929',
    description: 'The Roaring Twenties, the Dow Jones peak, the 1929 crash timeline, and the prolonged decline that followed.',
    name: 'Dow Jones Industrial Average',
    symbol: 'DJIA',
    categories: ['index', 'dow', 'market-history', 'market-crash'],
    kind: 'article',
  },
]
