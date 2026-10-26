import { useEffect, useRef, useState } from 'react'
import './MiniPredictionLab.css'

const API = 'https://quant-ai-agent.onrender.com'
const LAB = 'https://app.tradingninvestment.com/prediction-lab'
const markets = [{ ticker: 'SPY', name: 'S&P 500' }, { ticker: 'QQQ', name: 'Nasdaq 100' }, { ticker: 'IWM', name: 'Russell 2000' }] as const
const views = [{ id: 'BULLISH', label: 'Go up', icon: '↑' }, { id: 'NEUTRAL', label: 'Stay flat', icon: '−' }, { id: 'BEARISH', label: 'Go down', icon: '↓' }] as const
type View = typeof views[number]['id']
type Outlook = { ticker: string; horizon: number; decision: { action: string; reason?: string }; as_of: string; poll_id: string; poll_token: string | null }
type Community = { poll_id: string; counts: Record<View, number>; total: number; your_view?: View }
function track(name: string, ticker: string) {
  const w = window as Window & { gtag?: (...args: unknown[]) => void }
  w.gtag?.('event', name, { ticker, source: 'homepage_mini_lab' })
}
async function request(path: string, signal: AbortSignal, body?: unknown) {
  const response = await fetch(API + path, { signal, credentials: 'omit', ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) })
  if (!response.ok) {
    if (response.status === 400) throw new Error('This poll may have expired. Refresh the outlook and try again.')
    throw new Error('The service is temporarily unavailable. Please try again.')
  }
  return response.json()
}
function validCommunity(value: Community, poll: string) {
  return value?.poll_id === poll && Number.isInteger(value.total) && value.total >= 0 && views.every(v => Number.isInteger(value.counts?.[v.id]) && value.counts[v.id] >= 0) && views.reduce((sum, v) => sum + value.counts[v.id], 0) === value.total
}
function voterId() {
  let id = localStorage.getItem('tni-pl-browser')
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    id = crypto.randomUUID()
    localStorage.setItem('tni-pl-browser', id)
  }
  return id
}
function MarketOutlook({ ticker, name }: { ticker: string; name: string }) {
  const [outlook, setOutlook] = useState<Outlook | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [community, setCommunity] = useState<Community | null>(null)
  const [choice, setChoice] = useState<View | null>(null)
  const [voteError, setVoteError] = useState('')
  const [busy, setBusy] = useState(false)
  const active = useRef<AbortController | null>(null)
  useEffect(() => () => active.current?.abort(), [])
  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 60000)
    let current = true
    active.current?.abort()
    setOutlook(null); setError(''); setCommunity(null); setChoice(null); setVoteError(''); setBusy(false)
    request('/analyze', controller.signal, { ticker }).then(data => {
      if (!current) return
      if (data.ticker !== ticker || !['BUY', 'HOLD', 'SELL'].includes(data.decision?.action) || !Number.isInteger(data.horizon) || data.horizon < 1 || !data.poll_id || !Number.isFinite(Date.parse(data.as_of))) throw new Error('The outlook response is incomplete. Please retry.')
      setOutlook(data)
      track('mini_lab_outlook_loaded', ticker)
    }).catch(e => { if (current) setError(e.name === 'AbortError' ? 'The outlook is taking longer than expected. Please retry.' : e.message) })
      .finally(() => window.clearTimeout(timeout))
    return () => { current = false; controller.abort(); window.clearTimeout(timeout) }
  }, [ticker, attempt])
  async function compare(view?: View) {
    if (!outlook?.poll_token || busy) return
    const controller = new AbortController(); active.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 25000)
    setBusy(true); setVoteError('')
    try {
      let data: Community
      if (view) {
        let id: string
        try { id = voterId() } catch { throw new Error('Browser storage is needed to save your vote. You can still see community results.') }
        data = await request('/prediction-lab/vote', controller.signal, { poll_token: outlook.poll_token, voter_id: id, view })
      } else data = await request('/prediction-lab/community?poll_token=' + encodeURIComponent(outlook.poll_token), controller.signal)
      if (controller.signal.aborted) return
      if (!validCommunity(data, outlook.poll_id)) throw new Error('Community results are incomplete. Please try again.')
      setCommunity(data)
      if (view) { setChoice(view); track('mini_lab_vote_saved', ticker) }
    } catch (e) {
      if (active.current === controller) setVoteError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'We could not confirm the result. Retry to check or save your vote.')
    } finally { window.clearTimeout(timeout); if (active.current === controller) { setBusy(false); active.current = null } }
  }
  return <div className="tni-mini-panel">
    <div className="tni-mini-market"><strong>{name} · {ticker}</strong><span>Decision Agent</span></div>
    {!outlook && !error && <div className="tni-mini-loading" role="status"><span className="tni-mini-loader" aria-hidden="true" /><strong>Getting the {ticker} outlook…</strong><p>Combining the model, news and risk analysis.</p></div>}
    {error && <div className="tni-mini-error" role="alert"><strong>Outlook unavailable</strong><p>{error}</p><button onClick={() => setAttempt(a => a + 1)}>Try again</button></div>}
    {outlook && <>
      <div className={'tni-mini-decision tni-mini-' + outlook.decision.action.toLowerCase()} aria-live="polite"><span>TNI outlook</span><strong>{outlook.decision.action}</strong><b>Next {outlook.horizon} trading days</b></div>
      <details className="tni-mini-why"><summary>Why this outlook?</summary><p>{outlook.decision.reason || 'Open Prediction Lab to explore this outlook.'}</p></details>
      <p className="tni-mini-time">Generated {new Date(outlook.as_of).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} ET</p>
      <div className="tni-mini-voting"><h3>What do you think {ticker} will do?</h3><p>Over the next {outlook.horizon} trading days</p>
        <div className="tni-mini-votes">{views.map(v => <button key={v.id} className={'tni-mini-vote tni-mini-' + v.id.toLowerCase()} aria-pressed={choice === v.id} disabled={busy || !outlook.poll_token} onClick={() => compare(v.id)}><span aria-hidden="true">{v.icon}</span>{v.label}</button>)}</div>
        {outlook.poll_token ? <button className="tni-mini-text-button" disabled={busy} onClick={() => compare()}>{busy ? 'Loading results…' : 'See community results →'}</button> : <p>Community voting is temporarily unavailable.</p>}
        {voteError && <p className="tni-mini-error-text" role="alert">{voteError} <button className="tni-mini-text-button" onClick={() => setAttempt(a => a + 1)}>Refresh outlook</button></p>}
        {community && <div className="tni-mini-community" aria-live="polite"><strong>{choice ? 'Your vote is saved.' : 'Community outlook'}</strong><p>{community.total === 0 ? 'No votes yet. Share your view above.' : `${community.total.toLocaleString()} browser votes`}</p>{community.total > 0 && views.map(v => <div className="tni-mini-result" key={v.id}><span>{v.label}</span><meter min="0" max={community.total} value={community.counts[v.id]} aria-label={v.label} /><b>{Math.round(community.counts[v.id] / community.total * 100)}%</b></div>)}<small>Browser-based voting; not verified individual investors.</small></div>}
      </div>
    </>}
    <a className="tni-mini-cta" href={LAB + '?ticker=' + ticker} onClick={() => track('mini_lab_open_full', ticker)}>Explore Prediction Lab <span aria-hidden="true">→</span></a>
    <p className="tni-mini-note">Public outlooks. Sign in for detailed agent evidence.</p>
  </div>
}
export default function MiniPredictionLab() {
  const [selected, setSelected] = useState(0)
  const [visible, setVisible] = useState(false)
  const section = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setVisible(true); return }
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { setVisible(true); observer.disconnect() } }, { rootMargin: '160px' })
    if (section.current) observer.observe(section.current)
    return () => observer.disconnect()
  }, [])
  const market = markets[selected]
  return <section className="tni-mini-lab" ref={section} aria-labelledby="tni-mini-title">
    <div className="tni-mini-copy"><span className="tni-mini-eyebrow">PREDICTION LAB · FREE TO EXPLORE</span><h2 id="tni-mini-title">Where will the<br />market go next?</h2><p>See TNI’s outlook. Share yours.</p><ol><li><b>01</b><span><strong>Choose a market</strong>Explore SPY, QQQ or IWM.</span></li><li><b>02</b><span><strong>See the decision</strong>Read the outlook and its reasoning.</span></li><li><b>03</b><span><strong>Vote and compare</strong>See how your view compares.</span></li></ol><p className="tni-mini-public">No account needed for these three markets.</p></div>
    <div className="tni-mini-app"><div className="tni-mini-tabs" role="group" aria-label="Choose a market">{markets.map((m, i) => <button key={m.ticker} aria-pressed={i === selected} onClick={() => { setSelected(i); setVisible(true); track('mini_lab_market_selected', m.ticker) }}>{m.ticker}<span>{m.name}</span></button>)}</div>{visible ? <MarketOutlook key={market.ticker} {...market} /> : <div className="tni-mini-panel"><p>The outlook loads when this section is visible.</p><a className="tni-mini-cta" href={LAB + '?ticker=SPY'}>Open Prediction Lab →</a></div>}</div>
  </section>
}
