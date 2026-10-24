import routes from './routes.json'
import './TradingLinks.css'

export default function TradingLinks({ active = '' }: { active?: string }) {
  return <>
    {routes.slice(0, 2).map(route => <a href={route.path} key={route.path} aria-current={active === route.path ? 'page' : undefined}>{route.path === '/trading/' ? 'Overview' : route.title}</a>)}
    <a href="https://app.tradingninvestment.com/prediction-lab">Prediction Lab ↗</a>
    {routes.slice(2, 5).map(route => <a href={route.path} key={route.path} aria-current={active === route.path ? 'page' : undefined}>{route.title}</a>)}
    <details className="tni-brokerage-menu" open={active.includes('/brokerage/') || undefined}>
      <summary>Brokerage <span className="tni-brokerage-chevron" aria-hidden="true">⌄</span></summary>
      <div className="tni-brokerage-links">
        {routes.slice(5).map(route => <a href={route.path} key={route.path} aria-current={active === route.path ? 'page' : undefined}>{route.path === '/trading/brokerage/' ? 'All brokerage categories' : route.title}</a>)}
      </div>
    </details>
  </>
}
