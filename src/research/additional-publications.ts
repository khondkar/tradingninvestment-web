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
