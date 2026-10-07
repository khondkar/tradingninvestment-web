import { useEffect } from 'react'
import { getHub, getHubItems, getItemHubs, getRelatedItems, researchHubs, researchItems, type ResearchHub } from '../../research/discovery'

const baseHubs = researchHubs.filter((hub) => [
  '/research/stocks/',
  '/research/etfs/',
  '/research/indexes/',
  '/research/market-history/',
  '/research/market-risk/',
].includes(hub.path))

export function ResearchHubPage({ hub }: { hub: ResearchHub }) {
  const items = getHubItems(hub)
  const children = researchHubs.filter((candidate) => candidate.parent === hub.path)

  useEffect(() => {
    document.title = `${hub.title} | TradingNInvestment`
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = `https://tradingninvestment.com${hub.path}`
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = hub.description
  }, [hub])

  return (
    <main className="research-discovery">
      <div className="research-discovery-inner">
        <nav className="research-crumb" aria-label="Breadcrumb">
          <a href="/">Home</a><span>›</span>
          {hub.parent && <><a href="/research/">Research</a><span>›</span></>}
          {hub.parent && hub.parent !== '/research/' && <><a href={hub.parent}>{getHub(hub.parent)?.title}</a><span>›</span></>}
          <strong>{hub.title}</strong>
        </nav>
        <header className="research-discovery-hero">
          <span className="research-kicker">TRADINGNINVESTMENT RESEARCH</span>
          <h1>{hub.title}</h1>
          <p>{hub.description}</p>
        </header>
        {hub.path === '/research/indexes/dow/' && (
          <section className="research-hub-section" aria-labelledby="dow-history-chart-heading">
            <span className="research-kicker">HISTORICAL VISUAL RESEARCH</span>
            <h2 id="dow-history-chart-heading">Dow Jones Industrial Average, 1920–1940</h2>
            <p>The original TNI chart traces the Dow through the 1920s expansion, the 1929 peak, and the decline into 1932. It shows historical index levels, not total returns or present market conditions.</p>
            <figure className="dow-history-figure">
              <img src="/wp-content/uploads/2016/03/Dow-Jones-History-1920-to-1940.jpg" alt="Historical Dow Jones Industrial Average chart from 1920 to 1940 showing the 1929 peak and 1932 low" width="736" height="606" loading="lazy" />
              <figcaption>Original TradingNInvestment historical chart. <a href="/stock-market-historical-returns/">Explore Dow Jones annual returns →</a></figcaption>
            </figure>
            <p><a href="/stock-market-crash-of-1929/">Read the chart's historical analysis →</a></p>
          </section>
        )}
        {(hub.path === '/research/' || children.length > 0) && (
          <section className="research-hub-section" aria-labelledby="browse-heading">
            <h2 id="browse-heading">Explore by topic</h2>
            <div className="research-hub-grid">
              {(hub.path === '/research/' ? baseHubs : children).map((child) => (
                <a className="research-hub-card" key={child.path} href={child.path}>
                  <strong>{child.title}</strong><span>{child.description}</span><b aria-hidden="true">↗</b>
                </a>
              ))}
            </div>
          </section>
        )}
        {hub.path.startsWith('/research/stocks/') && hub.path !== '/research/stocks/' && (
          <section className="research-hub-section" aria-labelledby="context-heading">
            <h2 id="context-heading">Explore the market context</h2>
            <div className="research-context-links">
              {items.flatMap(getItemHubs).filter((candidate, index, all) => candidate.path.startsWith('/research/indexes/') && all.findIndex((other) => other.path === candidate.path) === index).map((candidate) => <a key={candidate.path} href={candidate.path}>{candidate.title} ↗</a>)}
            </div>
          </section>
        )}
        <section className="research-hub-section" aria-labelledby="studies-heading">
          <div className="research-section-heading"><span className="research-kicker">PUBLISHED RESEARCH</span><h2 id="studies-heading">{hub.path === '/research/' ? 'All studies' : `Explore ${hub.title}`}</h2></div>
          <div className="research-study-grid">
            {items.map((item) => <a className="research-study-card" href={item.path} key={item.path}>
              <span className="research-kicker">{
                item.kind === 'drawdowns'
                  ? 'MARKET RISK'
                  : item.categories.includes('leveraged-etf')
                    ? 'LEVERAGED ETF RESEARCH'
                    : item.categories.includes('etf')
                      ? 'ETF RESEARCH'
                      : item.categories.includes('stock')
                        ? 'STOCK RESEARCH'
                        : 'INDEX RESEARCH'
              }</span>
              <h3>{item.title}</h3><p>{item.description}</p><b>Explore study ↗</b>
            </a>)}
          </div>
        </section>
      </div>
    </main>
  )
}

export function ResearchConnections({ path }: { path: string }) {
  const item = researchItems.find((candidate) => candidate.path === path)
  if (!item) return null
  const hubs = getItemHubs(item)
  const related = getRelatedItems(item)
  return <aside className="research-connections" aria-label="Explore related research">
    <span className="research-kicker">CONTINUE EXPLORING</span>
    <h2>Follow the research</h2>
    <nav className="research-connection-hubs" aria-label="Research topics">
      <a href="/research/">All research</a>
      {hubs.map((hub) => <a href={hub.path} key={hub.path}>{hub.title}</a>)}
    </nav>
    {related.length > 0 && <div className="research-related-grid">
      {related.map((candidate) => <a href={candidate.path} key={candidate.path}><small>RELATED STUDY</small><strong>{candidate.title}</strong><span>Explore ↗</span></a>)}
    </div>}
  </aside>
}

export function ResearchTrail({ path }: { path: string }) {
  const item = researchItems.find((candidate) => candidate.path === path)
  if (!item) return null
  const primary = getItemHubs(item)[0]
  return <nav className="research-article-trail" aria-label="Breadcrumb">
    <a href="/research/">Research</a><span>›</span>
    <a href={item.categories.includes('stock') ? '/research/stocks/' : '/research/indexes/'}>{item.categories.includes('stock') ? 'Stocks' : 'Indexes'}</a><span>›</span>
    {primary && <><a href={primary.path}>{primary.title}</a><span>›</span></>}
    <strong>{item.title}</strong>
  </nav>
}
