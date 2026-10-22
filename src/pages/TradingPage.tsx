import ScannerLinks, { equityScanners } from '../components/market/ScannerLinks'
import { isArticlePublic } from '../research/articleVisibility'
import FundedAccountsPage from './FundedAccountsPage'
import { useEffect, useState } from 'react'
import TradingLinks from '../components/trading/TradingLinks'
import routes from '../components/trading/routes.json'
import { getHub, getHubItems, sortResearch, type ResearchItem } from '../research/discovery'
import '../components/market/MarketSectionNavigation.css'
import './TradingPage.css'

export const tradingCollection = (path: string) => { const hub = getHub(path); return hub ? sortResearch(getHubItems(hub)) : [] }
const strategies = tradingCollection('/research/trading/')
const patterns = tradingCollection('/research/trading/candlestick-patterns/')
const studies = sortResearch([
  {
    path: '/spy-opening-gaps-drawdowns-recovery/',
    title: 'SPY Opening Gaps, Drawdowns & Recovery',
    description: 'Historical analysis of SPY opening gaps, intraday lows, first-hour drawdowns, and recovery behavior from 2020–2025.',
    image: '',
  } as ResearchItem,
  ...strategies.filter(item => item.path === '/research/doji-candlestick-spy-26-year-study/'),
  ...tradingCollection('/research/stocks/aapl/').filter(item => item.path === '/new-iphone-release-apple-stock-price-history/'),
  {
    path: '/snxx-etf/',
    title: 'SNXX ETF Research',
    description: 'Explore SNXX ETF performance, historical returns, and investment research.',
    image: '',
  } as ResearchItem,
].filter(item => isArticlePublic(item.path)))
const tools = [...equityScanners,{path:'/research/scanners/leveraged-etf/',title:'Leveraged ETF Scanner',description:'Search leveraged and inverse funds, compare ETFs, and explore historical research.'},{path:'/stock-market-today/heatmap/',title:'S&P 500 Heatmap',description:'Explore stock moves and sector performance in the latest available market snapshot.'}]
function Candles() { return <svg viewBox="0 0 600 220" aria-hidden="true"><path d="M0 180 80 168 150 180 230 120 300 140 390 78 460 98 600 15" fill="none" stroke="#1a71ac" strokeWidth="2"/>{Array.from({length:19},(_,i)=><g key={i} fill={i%4===1?'#f06476':'#31d5b2'} stroke={i%4===1?'#f06476':'#31d5b2'}><path d={`M${22+i*31} ${170-i*7-(i%3)*12}v55`} /><rect x={17+i*31} y={180-i*7-(i%3)*12} width="10" height={18+(i%3)*7} rx="1"/></g>)}</svg> }
function StudyCard({item}: {item:ResearchItem}) { const [broken,setBroken]=useState(false); return <a className="tni-tr-study" href={item.path}>{item.image&&!broken?<img src={item.image} alt="" loading="lazy" decoding="async" width="600" height="320" onError={()=>setBroken(true)}/>:<div className="tni-tr-fallback"><Candles/></div>}<div><span className="tni-tr-kicker">TRADINGNINVESTMENT RESEARCH</span><h3>{item.title}</h3><p>{item.description}</p><b>Read research <span aria-hidden="true">→</span></b></div></a> }
export default function TradingPage({path='/trading/'}:{path?:string}) {
 if (path.startsWith('/trading/brokerage/funded-accounts/')) return <FundedAccountsPage path={path}/>
 return <TradingContent path={path}/>
}
function TradingContent({path}:{path:string}) {
 const route=routes.find(r=>r.path===path)??routes[0];const [query,setQuery]=useState('')
 useEffect(() => {
   document.title = `${route.title} | TradingNInvestment`
   for (const [selector, tag, attr, key, value] of [
     ['link[rel="canonical"]','link','rel','canonical',`https://tradingninvestment.com${route.path}`],
     ['meta[name="description"]','meta','name','description',route.description],
   ]) { let el = document.querySelector(selector); if (!el) { el=document.createElement(tag);el.setAttribute(attr,key);document.head.append(el) } el.setAttribute(tag==='link'?'href':'content',value) }
 },[route])
 const overview=path==='/trading/';const brokerage=path.includes('/brokerage/')
 const pool=path.includes('candlestick-patterns')?patterns:path==='/trading/research/'?studies:strategies
 const filtered=pool.filter(item=>`${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase().trim()))
 return <div className="tni-market-layout tni-tr-layout"><aside className="tni-market-sidebar"><p>TRADING</p><nav aria-label="Trading sections"><TradingLinks active={path}/><ScannerLinks active={path}/></nav></aside><main className="tni-tr-main">
  <header className="tni-tr-hero"><div className="tni-tr-hero-art"><Candles/></div><span className="tni-tr-kicker">TRADING · RESEARCH · MARKET INTELLIGENCE</span><h1>{route.title}</h1><p>{route.description}</p>{!brokerage&&path!=='/trading/tools/'&&<label className="tni-tr-search"><span className="tni-tr-sr">Search trading articles</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Search trading guides, patterns, research…" value={query} onChange={e=>setQuery(e.target.value)}/></label>}</header>
  <details className="tni-tr-mobile-sections"><summary>Trading sections <span aria-hidden="true">⌄</span></summary><nav aria-label="Trading section navigation"><TradingLinks active={path}/><ScannerLinks active={path}/></nav></details>
  {overview&&!query&&<nav className="tni-tr-categories" aria-label="Explore Trading">{routes.slice(1,6).map((r,i)=><a key={r.path} href={r.path}><span className="tni-tr-category-icon" aria-hidden="true">{['↗','▥','▤','▦','▱'][i]}</span><strong>{r.title}</strong><p>{r.description}</p><b>Explore →</b></a>)}</nav>}
  {(!brokerage&&path!=='/trading/tools/')&&<section className="tni-tr-section"><div className="tni-tr-section-title"><h2>{query?'Search results':overview?'Featured Trading Research':route.title}</h2>{overview&&!query&&<a href="/trading/strategies/">View all trading articles →</a>}</div><p className="tni-tr-count" role="status">{filtered.length} published {filtered.length===1?'article':'articles'}</p><div className="tni-tr-studies">{filtered.map(item=><StudyCard key={item.path} item={item}/>)}</div>{!filtered.length&&<p>No articles match this search. Try “Doji” or clear your search.</p>}{!overview&&<a className="tni-tr-text-link" href={path.includes('candlestick-patterns')?'/research/trading/candlestick-patterns/':'/research/trading/'}>Browse the original research collection →</a>}</section>}
  {(overview||path==='/trading/tools/')&&!query&&<section className="tni-tr-section"><div className="tni-tr-section-title"><h2>Trading Tools</h2></div><div className="tni-tr-tool-grid">{tools.map(tool=><a className="tni-tr-tool" key={tool.path} href={tool.path}><span aria-hidden="true">↗</span><h3>{tool.title}</h3><p>{tool.description}</p><b>{tool.path.startsWith('https://app.') ? 'Open scanner →' : 'Open tool →'}</b>{tool.path.startsWith('https://app.') && <small className="tni-scanner-signin-note">Sign-in required</small>}</a>)}</div></section>}
  {(overview||brokerage)&&!query&&<section className="tni-tr-section"><div className="tni-tr-section-title"><h2>{brokerage&&path!=='/trading/brokerage/'?route.title:'Brokerage'}</h2></div><p className="tni-tr-count">Explore the funded accounts directory. Regular and options brokerage comparisons are planned.</p><div className="tni-tr-tool-grid">{routes.slice(6).filter(r=>overview||path==='/trading/brokerage/'||path===r.path).map(r=><article className="tni-tr-broker" key={r.path}><span className="tni-tr-kicker">{r.path.includes("funded-accounts")?"DIRECTORY":"PLANNED COVERAGE"}</span><h3>{r.title}</h3><p>{r.description}</p>{path!==r.path&&<a href={r.path}>View category →</a>}</article>)}</div></section>}
  <footer className="tni-tr-note">Educational research and tools. Historical results do not establish future trading performance.</footer>
 </main></div>
}
