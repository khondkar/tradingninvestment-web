import routes from './routes.json'
import './TradingLinks.css'

export default function TradingLinks({ active = '' }: { active?: string }) {
  return <>
    {routes.slice(0, 5).map(route => <a href={route.path} key={route.path} aria-current={active === route.path ? 'page' : undefined}>{route.path === '/trading/' ? 'Overview' : route.title}</a>)}
    <details className="tni-brokerage-menu" open={active.includes('/brokerage/') || undefined}>
      <summary>Brokerage <span className="tni-brokerage-chevron" aria-hidden="true">⌄</span></summary>
      <div className="tni-brokerage-links">
        {routes.slice(5).map(route => <a href={route.path} key={route.path} aria-current={active === route.path ? 'page' : undefined}>{route.path === '/trading/brokerage/' ? 'All brokerage categories' : route.title}</a>)}
      </div>
    </details>
  </>
}
