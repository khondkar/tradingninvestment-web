import type { Benchmark } from '../../hooks/useMarketTodaySnapshot'
import './MarketBenchmarkStrip.css'

export default function MarketBenchmarkStrip({benchmarks}: {benchmarks: Benchmark[]}) {
  return <section className="tni-benchmark-strip" aria-label="Major market benchmarks" tabIndex={0}><div className="tni-benchmark-strip-row">
    <span className="tni-benchmark-strip-label">MAJOR MARKET BENCHMARKS</span>
    {['SPY', 'DIA', 'QQQ', 'IWM', 'VIX'].map(symbol => {
      const b = benchmarks.find(b => b.symbol === symbol || (symbol === 'VIX' && b.symbol === '^VIX'))
      const price = b?.available && Number.isFinite(b.price) ? b!.price!.toFixed(2) : '—'
      const change = b?.available && typeof b.change_pct === 'number' && Number.isFinite(b.change_pct) ? b.change_pct : null
      return <span className="tni-benchmark-strip-item" key={symbol} title={b?.name ?? symbol}><strong>{symbol}</strong><b>{price}</b><em className={change !== null && change < 0 ? 'is-down' : 'is-up'}>{change === null ? '' : `${change > 0 ? '+' : ''}${change.toFixed(2)}%`}</em></span>
    })}
  </div></section>
}
