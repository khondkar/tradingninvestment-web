import routes from './routes.json'
export default function TradingLinks({active = ''}: {active?: string}) {
  return <>{routes.slice(0,5).map(r => <a href={r.path} key={r.path} aria-current={active === r.path ? 'page' : undefined}>{r.path === '/trading/' ? 'Overview' : r.title}</a>)}<details className="tni-scanner-group" open={active.includes('/brokerage/') || undefined}><summary>Brokerage <span aria-hidden="true">⌄</span></summary>{routes.slice(5).map(r => <a href={r.path} key={r.path} aria-current={active === r.path ? 'page' : undefined}>{r.path === '/trading/brokerage/' ? 'All brokerage categories' : r.title}</a>)}</details></>
}
