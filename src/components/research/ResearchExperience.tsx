import { useEffect, useMemo, useState } from 'react'
import { getHub, getHubItems, getResearchBreadcrumbs, getResearchCompanies, getResearchTopics, researchHubs, researchSectors, researchTopics, sortResearch, uniqueResearch, type ResearchHub, type ResearchItem } from '../../research/discovery'
import './ResearchExperience.css'

const PAGE_SIZE = 12
const collectionPaths = ['/research/indexes/', '/research/stocks/', '/research/etfs/', '/research/history-and-risk/', '/research/trading/']
const collectionNames = ['Indexes', 'Stocks', 'ETFs', 'History & Risk', 'Technical Analysis']
const collectionDescriptions = ['The broad market, in perspective.', 'One company. A deeper understanding.', 'Look beneath the fund.', 'Past cycles. Enduring lessons.', 'Patterns, price action, and trading evidence.']

function StudyCard({ item, eager = false }: { item: ResearchItem; eager?: boolean }) {
  const [broken, setBroken] = useState(false)
  const image = item.image?.startsWith('/') || item.image?.startsWith('https://') ? item.image : undefined
  return <a className="tni-r-study" href={item.path}>
    {image && !broken ? <div className="tni-r-study-art"><img src={image} alt={item.title} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBroken(true)} /></div>
      : <div className="tni-r-study-art tni-r-editorial-art"><span>TRADINGNINVESTMENT / ORIGINAL RESEARCH</span><strong>{item.name}</strong><small>{researchTopics.find((topic) => topic.id === getResearchTopics(item)[0])?.name || 'Research'}</small></div>}
    <div className="tni-r-study-body"><span className="tni-r-kicker">{researchTopics.find((topic) => topic.id === getResearchTopics(item)[0])?.name || 'Research'}</span><h3>{item.title}</h3><p>{item.description}</p><span className="tni-r-card-footer">Explore study <span aria-hidden="true">↗</span></span></div>
  </a>
}
function SectionTitle({ title, label, href }: { title: string; label?: string; href?: string }) {
  return <div className="tni-r-section-title"><h2>{title}</h2>{label && (href ? <a href={href}>{label} <span aria-hidden="true">↗</span></a> : <span>{label}</span>)}</div>
}
function HubCard({ hub, label }: { hub: ResearchHub; label?: string }) {
  return <a className="tni-r-hub-card" href={hub.path}><span className="tni-r-kicker">{label || 'Explore research'}</span><h3>{hub.title.replace(/ Stock Intelligence$/, '').replace(/^.*: /, '')}</h3><p>{hub.description}</p><span className="tni-r-card-footer">Explore <span aria-hidden="true">↗</span></span></a>
}
function StudyList({ items }: { items: ResearchItem[] }) {
  const [sort, setSort] = useState<'newest' | 'title'>('newest')
  const [page, setPage] = useState(1)
  const sorted = sortResearch(items, sort)
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  useEffect(() => { setPage(1) }, [items])
  return <>
    <div className="tni-r-toolbar"><span role="status">{sorted.length} published {sorted.length === 1 ? 'study' : 'studies'}</span><label>Sort <select value={sort} onChange={(event) => { setSort(event.target.value as 'newest' | 'title'); setPage(1) }}><option value="newest">Featured & recent</option><option value="title">Title A-Z</option></select></label></div>
    {sorted.length ? <div className="tni-r-studies">{sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).map((item) => <StudyCard key={item.path} item={item} />)}</div> : <p className="tni-r-empty">No studies match this search. Try a company name, ticker, or a broader topic.</p>}
    {pages > 1 && <nav className="tni-r-pagination" aria-label="Study pages"><button disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button><span aria-live="polite">Page {current} of {pages}</span><button disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button></nav>}
  </>
}
function CompanyDirectory({ items, context, query, category = 'stock' }: { items: ResearchItem[]; context: string; query: string; category?: 'stock' | 'etf' }) {
  const [letter, setLetter] = useState('All')
  const [sort, setSort] = useState('name')
  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [query])
  const all = getResearchCompanies(items, category)
  const companies = all.filter((company) => (letter === 'All' || company.name.toUpperCase().startsWith(letter)) && `${company.name} ${company.symbol}`.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((a, b) => sort === 'count' ? b.count - a.count || a.name.localeCompare(b.name) : a.name.localeCompare(b.name))
  const pages = Math.max(1, Math.ceil(companies.length / 25)); const current = Math.min(page, pages)
  return <>
    <div className="tni-r-alphabet" aria-label="Filter companies by first letter">{['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((value) => <button key={value} aria-pressed={value === letter} onClick={() => { setLetter(value); setPage(1) }}>{value}</button>)}</div>
    <div className="tni-r-toolbar"><span role="status">{companies.length} {category === 'etf' ? (companies.length === 1 ? 'fund' : 'funds') : (companies.length === 1 ? 'company' : 'companies')} with research</span><label>Sort <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }}><option value="name">{category === 'etf' ? 'Fund A-Z' : 'Company A-Z'}</option><option value="count">Most research</option></select></label></div>
    <div className="tni-r-company-list">{companies.slice((current - 1) * 25, current * 25).map((company) => <a href={`${company.path}?from=${encodeURIComponent(context)}`} key={company.symbol}><span className="tni-r-symbol">{company.symbol}</span><strong>{company.name}</strong><span className="tni-r-company-count">{company.count} {company.count === 1 ? 'study' : 'studies'}</span><span aria-hidden="true">↗</span></a>)}</div>
    {!companies.length && <div className="tni-r-empty"><p>No matches for your search.</p><button onClick={() => setLetter('All')}>Show all letters</button></div>}
    {pages > 1 && <nav className="tni-r-pagination" aria-label="Company pages"><button disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button><span>Page {current} of {pages}</span><button disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button></nav>}
  </>
}

export default function ResearchExperience({ hub }: { hub: ResearchHub }) {
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState<ResearchHub | undefined>()
  const items = useMemo(() => uniqueResearch(getHubItems(hub)), [hub])
  const children = researchHubs.filter((child) => child.parent === hub.path)
  const isLanding = hub.view === 'landing'
  const isDirectory = hub.view === 'directory' || hub.view === 'funds'
  const isIndex = hub.view === 'index'
  const topics = children.filter((child) => child.path.includes('/topics/') && getHubItems(child).length)
  const indexItems = items.filter((item) => !item.categories.includes('stock') && !item.categories.includes('etf'))
  const filtered = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return items.filter((item) => { const text = `${item.title} ${item.description} ${item.symbol} ${item.name} ${item.categories.join(' ')} ${getResearchTopics(item).map((id) => researchTopics.find((topic) => topic.id === id)?.name || id).join(' ')}`.toLowerCase(); return words.every((word) => text.includes(word)) })
  }, [items, query])
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setQuery(params.get('q') || '')
    const context = getHub(params.get('from') || '')
    setFrom((context?.view === 'directory' || context?.view === 'funds') && items.some((item) => context.match(item)) ? context : undefined)
    document.title = `${hub.title} | TradingNInvestment`
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
    canonical.href = `https://tradingninvestment.com${hub.path}`
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!description) { description = document.createElement('meta'); description.name = 'description'; document.head.append(description) }
    description.content = hub.description
  }, [hub, items])
  const breadcrumbs = from && hub.view === 'company' ? [...getResearchBreadcrumbs(from), hub] : getResearchBreadcrumbs(hub)
  const featuredPaths = isLanding ? ['/sp-500-returns/', '/stock-market-correction-myth-and-reality/'] : []
  const featuredPool = isLanding ? items : indexItems
  const featured = uniqueResearch([...featuredPaths.map((path) => featuredPool.find((item) => item.path === path)).filter((item): item is ResearchItem => Boolean(item)), ...sortResearch(featuredPool)]).slice(0, 2)
  const title = hub.view === 'company' ? items.find((item) => item.symbol === hub.symbol)?.name || hub.title : hub.title
  return <main className={`tni-research-experience ${isLanding ? 'tni-r-landing' : ''}`}>
    <div className="tni-r-inner">
      {!isLanding && <nav className="tni-r-breadcrumbs" aria-label="Breadcrumb">{breadcrumbs.map((crumb, index) => <span key={crumb.path}>{index > 0 && <i aria-hidden="true">/</i>}{index === breadcrumbs.length - 1 ? <span aria-current="page">{crumb.title.replace(/ Stock Intelligence$/, '')}</span> : <a href={crumb.path}>{crumb.title.replace(/ Stock Intelligence$/, '')}</a>}</span>)}</nav>}
      <header className="tni-r-hero"><span className="tni-r-kicker">{isLanding ? 'Original research & market intelligence' : isIndex ? 'Index intelligence' : hub.view === 'company' ? (hub.path.startsWith('/research/etfs/') ? 'Fund intelligence' : 'Company intelligence') : hub.sector ? 'Sector intelligence' : 'Research collection'}</span>
        {isLanding ? <h1 className="tni-r-journey"><span>Data <b>→</b> Evidence <b>→</b></span><span>Research <b>→</b> <em>Decision</em></span></h1> : <h1>{title}{hub.view === 'company' && <small>{hub.symbol}</small>}</h1>}
        <p>{isLanding ? 'Explore the market. Understand its history. Find your perspective.' : hub.description}</p>
        <form className="tni-r-search" action={hub.path} method="get" onSubmit={(event) => { event.preventDefault(); const url = new URL(window.location.href); query.trim() ? url.searchParams.set('q', query.trim()) : url.searchParams.delete('q'); window.history.replaceState(null, '', url) }}><span aria-hidden="true">⌕</span><input aria-label={isDirectory ? (hub.view === 'funds' ? 'Search fund name or ticker' : 'Search company name or ticker') : 'Search published research'} name="q" type="search" placeholder={isDirectory ? (hub.view === 'funds' ? 'Search fund name or ticker' : 'Search company name or ticker') : 'Search a company, index, ticker or topic'} value={query} onChange={(event) => setQuery(event.target.value)} /><button type="submit" aria-label="Search">→</button></form>
        {isLanding && <div className="tni-r-suggestions">Start with <a href="/research/indexes/sp-500/">S&P 500</a>{getHub('/research/stocks/nvda/') && <a href="/research/stocks/nvda/">NVIDIA</a>}<a href="/research/market-risk/">Drawdowns</a></div>}
      </header>
      {isDirectory ? <CompanyDirectory items={items} context={hub.path} query={query} category={hub.view === 'funds' ? 'etf' : 'stock'} /> : query.trim() ? <section aria-label="Search results"><SectionTitle title="Search results" /><StudyList items={filtered} /></section> : <>
        {(hub.path === '/research/trading/' || hub.path === '/research/trading/candlestick-patterns/') && items.length > 0 && <section>
          <SectionTitle title="Published research." label="Technical analysis" />
          <div className="tni-r-studies">
            {sortResearch(items).map((item) => (
              <StudyCard key={item.path} item={item} />
            ))}
          </div>
        </section>}
        {(isLanding || isIndex) && featured.length > 0 && <section><SectionTitle title={isLanding ? 'A deeper perspective.' : 'Essential perspectives'} label={isLanding ? 'Selected research' : 'Index-level research'} /><div className="tni-r-featured">{featured.map((item, index) => <StudyCard key={item.path} item={item} eager={index === 0} />)}</div></section>}
        {isLanding && <section><SectionTitle title="Follow your curiosity." label="Explore all research" href="/research/archive/" /><div className="tni-r-collections">{collectionPaths.map((path, index) => <a href={path} key={path}><span>0{index + 1}</span><h3>{collectionNames[index]}</h3><p>{collectionDescriptions[index]}</p><small>Explore collection ↗</small></a>)}</div><div className="tni-r-closing"><h2>Complex markets.<br />Clearer questions.</h2><p>Every path leads to the evidence.<br />Explore by index, company, or the question on your mind.</p></div></section>}
        {hub.view === 'indexes' && <section><SectionTitle title={hub.path === '/research/etfs/' ? 'Two ways to explore funds.' : 'A wider lens.'} /><div className="tni-r-hubs">{children.filter((child) => getHubItems(child).length > 0 && (hub.path !== '/research/etfs/' || ['/research/etfs/regular/', '/research/etfs/leveraged/'].includes(child.path))).map((child) => <HubCard key={child.path} hub={child} label={hub.path === '/research/etfs/' ? `${getResearchCompanies(getHubItems(child), 'etf').length} funds with research` : 'Index intelligence'} />)}</div></section>}
        {isIndex && <><section><SectionTitle title="Explore the complete collection" /><div className="tni-r-hubs">{topics.length > 0 && <a className="tni-r-hub-card" href="#index-topics"><span className="tni-r-kicker">Research topics</span><h3>Index-level studies</h3><p>Returns, risk, seasonality, and market history.</p><span className="tni-r-card-footer">Choose a topic ↗</span></a>}{[['sectors/', 'Browse by sector'], ['companies/', 'Find a company'], ['studies/', 'All index studies']].map(([suffix, name]) => { const child = getHub(hub.path + suffix); return child && <HubCard key={child.path} hub={{ ...child, title: name }} label="Explore the collection" /> })}</div></section><section id="index-topics"><SectionTitle title="Start with a question." /><div className="tni-r-hubs">{topics.map((topic) => <HubCard key={topic.path} hub={topic} label={`${getHubItems(topic).length} published ${getHubItems(topic).length === 1 ? 'study' : 'studies'}`} />)}</div></section></>}
        {hub.view === 'sectors' && <section><SectionTitle title="Browse all 11 sectors" /><div className="tni-r-sectors">{researchSectors.map((sector) => { const child = children.find((child) => child.sector === sector.id); const count = child ? getResearchCompanies(getHubItems(child)).length : 0; return child && count ? <a href={child.path} key={sector.id}><h3>{sector.name}</h3><p>{count} {count === 1 ? 'company' : 'companies'} with research <span>↗</span></p></a> : <div key={sector.id}><h3>{sector.name}</h3><p>No published company studies yet</p></div> })}</div></section>}
        {(hub.view === 'company' || hub.view === 'topics') && <section><SectionTitle title={hub.view === 'company' ? 'Explore by question.' : 'Choose a research topic.'} /><div className="tni-r-hubs">{topics.map((topic) => <HubCard key={topic.path} hub={topic} label={`${getHubItems(topic).length} published ${getHubItems(topic).length === 1 ? 'study' : 'studies'}`} />)}{children.filter((child) => !child.path.includes('/topics/') && getHubItems(child).length).map((child) => <HubCard key={child.path} hub={child} />)}</div>{!topics.length && !children.length && <p className="tni-r-empty">No published studies are available in this collection yet.</p>}</section>}
        {hub.path === '/research/trading/' && <section>
          <SectionTitle title="Explore technical analysis." label="Research collections" />
          <div className="tni-r-hubs">
            {children.map((child) => <HubCard key={child.path} hub={child} label="Candlestick research" />)}
          </div>
        </section>}

        {hub.view === 'studies' && <StudyList items={items} />}
        {hub.path === '/research/indexes/dow/' && <section className="tni-r-dow"><SectionTitle title="The original historical perspective" label="1920–1940" /><a href="/stock-market-crash-of-1929/"><img src="/wp-content/uploads/2016/03/Dow-Jones-History-1920-to-1940.jpg" alt="Original TNI Dow Jones history chart, 1920 to 1940" width="736" height="606" loading="lazy" /></a><p>The original TNI chart traces the Dow through the 1920s expansion, the 1929 peak, and the decline into 1932. Historical index levels, not total returns or present market conditions. <a href="/stock-market-historical-returns/">Explore Dow Jones annual returns →</a> <a href="/stock-market-crash-of-1929/">Explore the historical analysis ↗</a></p></section>}
      </>}
      {!isLanding && <a className="tni-r-back" href="/research/">← Back to Research</a>}
    </div>
  </main>
}
