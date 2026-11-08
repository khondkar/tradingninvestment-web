import { useEffect, useRef, useState } from 'react'
import './MiniPredictionLab.css'
import MiniLabSharing from './MiniLabSharing'

const API = ((import.meta as ImportMeta & { env?: { VITE_MINI_LAB_API_URL?: string } }).env?.VITE_MINI_LAB_API_URL || 'https://quant-ai-agent.onrender.com').replace(/\/$/, '')
const LAB = 'https://app.tradingninvestment.com/prediction-lab'
const markets = [{ ticker: 'SPY', name: 'S&P 500' }, { ticker: 'QQQ', name: 'Nasdaq 100' }, { ticker: 'IWM', name: 'Russell 2000' }] as const
const views = [
  { id: 'BULLISH', label: 'Go up', path: 'M5 31 L19 24 L31 27 L47 10 L59 10 M49 10 H59 V20' },
  { id: 'NEUTRAL', label: 'Stay flat', path: 'M5 21 L18 18 L30 23 L43 19 L59 20 M50 12 L59 20 L50 28' },
  { id: 'BEARISH', label: 'Go down', path: 'M5 9 L19 16 L31 13 L47 30 L59 30 M49 30 H59 V20' },
] as const
type View = typeof views[number]['id']
type Outlook = { ticker: string; horizon: number; decision: { action: string; reason?: string }; as_of: string; poll_id: string; poll_token: string | null }
type Community = { poll_id: string; counts: Record<View, number>; total: number; your_view?: View; submission_id?: string }
type Price = { date: string; close: number }
type Signal = { signal_date: string; action: string; horizon: number; status: string; correct: boolean | null; reference_date?: string | null; outcome_date?: string | null }
type History = { ticker: string; rows: Signal[]; price_history?: Price[]; method: string; warning?: string | null }
type Job = { poll_token: string; voter_id: string; submission_id: string; view: View }
function track(name: string, ticker: string) {
  const w = window as Window & { gtag?: (...args: unknown[]) => void }
  w.gtag?.('event', name, { ticker, source: 'homepage_mini_lab' })
}
async function request(path: string, signal: AbortSignal, body?: unknown) {
  const response = await fetch(API + path, { signal, credentials: 'omit', ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) })
  if (!response.ok) throw new Error(response.status === 400 ? 'This poll may have expired. Refresh the outlook.' : 'The service is temporarily unavailable. Please retry.')
  return response.json()
}
function validCommunity(value: Community, poll: string) {
  return value?.poll_id === poll && Number.isInteger(value.total) && value.total >= 0 && views.every(v => Number.isInteger(value.counts?.[v.id]) && value.counts[v.id] >= 0) && views.reduce((sum, v) => sum + value.counts[v.id], 0) === value.total
}
function voterId() {
  let id = localStorage.getItem('tni-pl-browser')
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    id = crypto.randomUUID(); localStorage.setItem('tni-pl-browser', id)
  }
  return id
}
const percent = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}%`
const day = (date: string) => new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

function RecordedReplay({ ticker, choice }: { ticker: string; choice: View | null }) {
  const [data, setData] = useState<History | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const reduced = useRef(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.current = media.matches
    const change = () => { reduced.current = media.matches; if (media.matches) setPlaying(false) }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 60000)
    setError(''); setData(null); setPlaying(false); setIndex(0); setProgress(0)
    request('/prediction-lab/signals/' + ticker, controller.signal).then((value: History) => {
      if (controller.signal.aborted) return
      if (value.ticker !== ticker || !Array.isArray(value.rows)) throw new Error('Recorded signals are unavailable.')
      const prices = value.price_history
      if (prices && (!Array.isArray(prices) || prices.some((p, i) => !/^\d{4}-\d{2}-\d{2}$/.test(p.date) || !Number.isFinite(p.close) || p.close <= 0 || (i > 0 && p.date <= prices[i-1].date)))) throw new Error('The price history is incomplete. Please retry.')
      setData(value)
      if (prices && prices.length > 1 && !reduced.current && !document.hidden) setPlaying(true)
    }).catch(e => { if (!controller.signal.aborted) setError(e.message) })
    const timed = window.setTimeout(() => { if (controller.signal.aborted) setError('History is taking longer than expected. Please retry.') }, 60010)
    return () => { controller.abort(); clearTimeout(timeout); clearTimeout(timed) }
  }, [ticker, attempt])
  const prices = data?.price_history || []
  useEffect(() => {
    if (!playing || prices.length < 2) return
    const initial = performance.now() - progress * 10000
    const timer = window.setInterval(() => {
      const next = Math.min(1, (performance.now() - initial) / 10000)
      setProgress(next); setIndex(Math.min(prices.length - 1, Math.floor(next * (prices.length - 1))))
      if (next >= 1) { setPlaying(false); track('mini_lab_replay_completed', ticker) }
    }, 50)
    const pause = () => { if (document.hidden) setPlaying(false) }
    document.addEventListener('visibilitychange', pause)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', pause) }
    // Progress is sampled at start; do not restart the timer on every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, prices.length, ticker])
  const select = (next: number) => { setPlaying(false); setIndex(next); setProgress(next / Math.max(1, prices.length - 1)); track('mini_lab_session_selected', ticker) }
  if (error) return <div role="alert" className="tni-mini-error"><p>{error}</p><button onClick={() => setAttempt(a => a + 1)}>Retry history</button></div>
  if (!data) return <p role="status">Loading recorded signals and completed prices…</p>
  if (prices.length < 2) return <div className="tni-mini-community"><strong>Price replay unavailable</strong><p>{data.warning || 'There are not enough completed prices for a replay yet.'}</p><a href={LAB + '?ticker=' + ticker}>View recorded signals in Prediction Lab →</a></div>
  const values = prices.map(p => (p.close / prices[0].close - 1) * 100)
  const value = values[index]
  const daily = index ? (prices[index].close / prices[index-1].close - 1) * 100 : 0
  const low = Math.min(0, ...values), high = Math.max(0, ...values), span = Math.max(1, high - low)
  const x = (i: number) => 24 + i / (prices.length - 1) * 552
  const y = (v: number) => 190 - (v - low) / span * 155
  const row = data.rows.find(r => r.signal_date === prices[index].date)
  const status = !row ? 'No recorded signal' : row.status === 'evaluated' ? row.correct ? 'Direction matched' : 'Direction missed' : row.status === 'not_scored' ? 'HOLD · not scored' : row.status === 'unavailable' ? 'Unavailable' : 'Pending'
  const viewLabel = views.find(v => v.id === choice)?.label || 'Not selected'
  return <section className="tni-mini-replay" aria-label="Recorded market replay">
    <div className="tni-mini-replay-top"><span>RECORDED HISTORY · {ticker}</span><b>Your view: {viewLabel}</b></div>
    <h3>Market moves. Model decisions.</h3>
    <div className="tni-mini-return"><span>Market return from {day(prices[0].date)}</span><strong key={index} className={value < 0 ? 'is-negative' : 'is-positive'}>{percent(value)}</strong><b>{index === 0 ? 'Starting point' : `Through ${day(prices[index].date)}`} · {index}/{prices.length - 1} sessions</b></div>
    <div className="tni-mini-chart-legend"><span>Teal: price rose</span><span>Red: price fell</span><span>Versus previous session</span></div>
    <svg viewBox="0 0 600 230" className="tni-mini-chart" aria-label={`${ticker} cumulative market return ${percent(value)} through ${prices[index].date}`}>
      <line x1="24" x2="576" y1={y(0)} y2={y(0)} stroke="#92a9b8" strokeDasharray="5 5" />
      <text x="24" y="222">{prices[0].date}</text><text x="576" y="222" textAnchor="end">{prices[prices.length-1].date}</text>
      {values.slice(1, index+1).map((v,i) => <line key={i} x1={x(i)} y1={y(values[i])} x2={x(i+1)} y2={y(v)} stroke={v < values[i] ? '#b41c3e' : '#08776d'} strokeWidth="5" strokeLinecap="round" />)}
      {values.slice(0, index + 1).map((v, i) => {
        const recorded = data.rows.find(
          signal => signal.signal_date === prices[i].date
        )
        if (!recorded || !['BUY', 'HOLD', 'SELL'].includes(recorded.action)) {
          return null
        }
        const color = recorded.action === 'BUY'
          ? '#08776d'
          : recorded.action === 'SELL'
            ? '#b41c3e'
            : '#7a5300'
        const left = Math.max(1, Math.min(549, x(i) - 25))
        const top = Math.max(4, y(v) - 33)
        return (
          <g
            key={'signal-' + prices[i].date}
            className="tni-mini-signal-badge"
            pointerEvents="none"
          >
            <title>{`${day(prices[i].date)}: recorded ${recorded.action}, ${recorded.horizon} trading days`}</title>
            <rect
              x={left}
              y={top}
              width={50}
              height={23}
              rx={6}
              fill={color}
              stroke="white"
              strokeWidth={1.5}
            />
            <text
              x={left + 25}
              y={top + 16}
              textAnchor="middle"
              style={{
                fill: '#ffffff',
                fontSize: 14,
                fontWeight: 900,
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {recorded.action}
            </text>
          </g>
        )
      })}
      {values.slice(0,index+1).map((v,i) => <circle key={i} cx={x(i)} cy={y(v)} r={i===index?9:4} role="button" tabIndex={0} aria-label={`${day(prices[i].date)}, market return ${percent(v)}`} onClick={()=>select(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(i)}}} style={{cursor:'pointer'}} fill={i>0&&v<values[i-1]?'#b41c3e':'#08776d'} stroke="white" strokeWidth="2" />)}
    </svg>
    <label className="tni-mini-session-label">Explore a session <input type="range" min="0" max={prices.length-1} value={index} onChange={e => select(Number(e.target.value))} aria-valuetext={`${day(prices[index].date)}, market return ${percent(value)}`} /></label>
    <div className="tni-mini-record"><div><small>{day(prices[index].date)}</small><strong>{row?.action || 'No recorded signal'}</strong></div><div><small>Direction check</small><strong>{status}</strong></div><div><small>Forecast horizon</small><strong>{row ? `${row.horizon} trading days` : 'Unavailable'}</strong></div><div><small>Change from prior session</small><strong>{index ? percent(daily) : 'Baseline'}</strong></div></div>
    <div className="tni-mini-replay-controls"><button disabled={index===0} onClick={() => select(index-1)}>← Previous</button><button onClick={() => { if(playing) setPlaying(false); else { if(progress>=1){setIndex(0);setProgress(0)} setPlaying(true);track('mini_lab_replay_started',ticker) } }}>{playing?'Pause':progress>0&&progress<1?'Resume':'Replay · 10 sec'}</button><button disabled={index===prices.length-1} onClick={() => select(index+1)}>Next →</button></div>
    <progress max="1" value={progress} aria-label="Replay progress" /><p className="tni-mini-time">{Math.min(10, Math.floor(progress*10))} / 10 seconds · Adjusted daily closes. Market return is not model performance.</p>
    <details className="tni-mini-why"><summary>{row?.status==='evaluated'&&row.correct===false?'Direction missed — review risk context':'What did the Risk Agent say at the time?'}</summary><p>Historical Risk Agent assessments are not included in this record. We cannot infer whether it agreed or warned at the time. A falling session alone does not mean a multi-day forecast failed.</p><a className="tni-mini-text-button" href={LAB+'?ticker='+ticker}>Open Prediction Lab for current risk evidence →</a></details>
    <MiniLabSharing snapshot={{ticker,kind:'replay',view:viewLabel,returnPct:value,startDate:prices[0].date,endDate:prices[index].date}} onOpen={()=>setPlaying(false)}/>
    <details className="tni-mini-why"><summary>How this history is measured</summary><p>{data.method}</p><p>Replay starts at the first displayed adjusted close. Signal dates match exactly; no missing signals are reconstructed.</p>{data.warning&&<p>{data.warning}</p>}</details>
  </section>
}

function MarketOutlook({ ticker, name }: { ticker: string; name: string }) {
  const [outlook, setOutlook] = useState<Outlook | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [community, setCommunity] = useState<Community | null>(null)
  const [choice, setChoice] = useState<View | null>(null)
  const [voteError, setVoteError] = useState('')
  const [queued, setQueued] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const queue = useRef<Job[]>([])
  const active = useRef<AbortController | null>(null)
  const failed = useRef(false)
  const hasVoted = useRef(false)
  const alive = useRef(true)
  const storageKey = useRef('')
  const persist = () => { if(storageKey.current) sessionStorage.setItem(storageKey.current,JSON.stringify(queue.current)) }
  useEffect(() => { alive.current=true; return () => { alive.current=false; active.current?.abort() } }, [])
  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 60000)
    let current = true
    active.current?.abort(); active.current=null; queue.current=[]; failed.current=false; hasVoted.current=false
    setOutlook(null);setError('');setCommunity(null);setChoice(null);setVoteError('');setQueued(0);setRevealed(false);setHistoryOpen(false)
    request('/analyze',controller.signal,{ticker}).then(async (data: Outlook) => {
      if (!current) return
      if(data.ticker!==ticker||!['BUY','HOLD','SELL'].includes(data.decision?.action)||!Number.isInteger(data.horizon)||data.horizon<1||!data.poll_id||!Number.isFinite(Date.parse(data.as_of))) throw new Error('The outlook response is incomplete. Please retry.')
      setOutlook(data);track('mini_lab_outlook_loaded',ticker)
      storageKey.current='tni-mini-pending:'+data.poll_id
      try {
        const saved=JSON.parse(sessionStorage.getItem(storageKey.current)||'[]')
        if(Array.isArray(saved)&&saved.every(j=>j&&typeof j.submission_id==='string'&&typeof j.voter_id==='string'&&views.some(v=>v.id===j.view))){
          queue.current=saved.map(j=>({...j,poll_token:data.poll_token}));setQueued(queue.current.length)
          if(queue.current.length){failed.current=true;setVoteError('Unconfirmed votes found. Retry to confirm them without counting twice.')}
        }
      } catch { /* New votes show a clear storage error if persistence is unavailable. */ }
      if(data.poll_token){try{const result=await request('/prediction-lab/community?poll_token='+encodeURIComponent(data.poll_token),controller.signal);if(current&&!hasVoted.current&&validCommunity(result,data.poll_id))setCommunity(result)}catch{/* Voting has its own retry path. */}}
    }).catch(e=>{if(current)setError(e.name==='AbortError'?'The outlook is taking longer than expected. Please retry.':e.message)}).finally(()=>clearTimeout(timeout))
    return()=>{current=false;controller.abort();clearTimeout(timeout)}
  },[ticker,attempt])
  async function drain() {
    if(active.current||failed.current||!outlook)return
    const controller=new AbortController();active.current=controller
    try{
      while(queue.current.length && alive.current && !controller.signal.aborted){
        const job=queue.current[0]
        const timeout=window.setTimeout(()=>controller.abort(),25000)
        let result:Community
        try{result=await request('/prediction-lab/vote',controller.signal,job)}finally{clearTimeout(timeout)}
        if(!alive.current||controller.signal.aborted||active.current!==controller)return
        if(!validCommunity(result,outlook.poll_id)||result.submission_id!==job.submission_id)throw new Error('Repeat voting could not be confirmed. The updated voting service must be deployed first.')
        queue.current.shift();persist();setQueued(queue.current.length);setCommunity(result);track('mini_lab_vote_saved',ticker)
      }
    }catch(e){if(alive.current&&active.current===controller){failed.current=true;setVoteError(e instanceof Error&&e.name!=='AbortError'?e.message:'Vote confirmation timed out. Retry the same submissions safely.')}}
    finally{if(active.current===controller)active.current=null}
  }
  function vote(view:View){
    if(!outlook?.poll_token)return
    try{
      const job={poll_token:outlook.poll_token,voter_id:voterId(),submission_id:crypto.randomUUID(),view}
      const next=[...queue.current,job]
      sessionStorage.setItem(storageKey.current,JSON.stringify(next))
      hasVoted.current=true;queue.current=next;setQueued(next.length);setChoice(view);track('mini_lab_vote_clicked',ticker);void drain()
    }catch{setVoteError('Browser storage is required to preserve votes safely. You can still reveal the outlook.')}
  }
  const choiceLabel=views.find(v=>v.id===choice)?.label
  return <div className="tni-mini-panel">
    <div className="tni-mini-market"><strong>{name} · {ticker}</strong><span>YOUR VIEW FIRST</span></div>
    {!outlook&&!error&&<div className="tni-mini-loading" role="status"><span className="tni-mini-loader" aria-hidden="true"/><strong>Getting the {ticker} outlook…</strong><p>Combining model, news and risk analysis.</p></div>}
    {error&&<div className="tni-mini-error" role="alert"><p>{error}</p><button onClick={()=>setAttempt(a=>a+1)}>Retry outlook</button></div>}
    {outlook&&<>
      <div className="tni-mini-voting"><h3>What will {ticker} do next?</h3><p>Choose your view for the next {outlook.horizon} trading days.</p>
        <div className="tni-mini-votes" role="group" aria-label="Your market view">{views.map(v=><button key={v.id} className={'tni-mini-vote tni-mini-'+v.id.toLowerCase()} aria-pressed={choice===v.id} disabled={!outlook.poll_token} onClick={()=>vote(v.id)}><span className="tni-mini-vote-check" aria-hidden="true">{choice===v.id?'✓':''}</span><svg viewBox="0 0 64 40" aria-hidden="true"><path d={v.path}/></svg><strong>{v.label}</strong><small>{choice===v.id?'Vote again':'Tap to vote'}</small></button>)}</div>
        <p className="tni-mini-vote-status" role="status">{choiceLabel?'Your view: '+choiceLabel+'. ':''}{queued?`${queued} vote${queued===1?'':'s'} awaiting confirmation.`:'Repeat votes allowed.'}</p>
        {!outlook.poll_token&&<p>Voting is unavailable. You can still reveal the outlook.</p>}
        {voteError&&<div className="tni-mini-error-text" role="alert"><p>{voteError}</p>{queue.current.length>0&&<button className="tni-mini-text-button" onClick={()=>{failed.current=false;setVoteError('');void drain()}}>Retry unconfirmed votes</button>}<button className="tni-mini-text-button" onClick={()=>setAttempt(a=>a+1)}>Refresh outlook</button></div>}
        {community&&<div className="tni-mini-community"><div className="tni-mini-total"><span>Votes submitted today<small>{ticker} · {outlook.horizon}-day poll · ET</small></span><strong>{community.total.toLocaleString()}</strong></div>{choice&&community.total>0&&views.map(v=><div className="tni-mini-result" key={v.id}><span>{v.label}</span><meter min="0" max={community.total} value={community.counts[v.id]} aria-label={v.label}/><b>{(community.counts[v.id]/community.total*100).toFixed(1)}%</b></div>)}<small>Repeat submissions count. Totals are not unique people or evidence of model accuracy.</small></div>}
      </div>
      {!revealed?<button className="tni-mini-cover" onClick={()=>{setRevealed(true);track('mini_lab_outlook_revealed',ticker)}}><span>TNI’S OUTLOOK</span><strong>{choice?'Compare with TNI →':'Reveal TNI’s outlook →'}</strong><small>Tap anywhere on this card</small></button>:<section className="tni-mini-revealed" aria-label="TNI outlook"><div className="tni-mini-your-view">Your view: {choiceLabel||'Not selected'}</div><div className={'tni-mini-decision tni-mini-'+outlook.decision.action.toLowerCase()}><span>TNI outlook</span><strong>{outlook.decision.action}</strong><b>Next {outlook.horizon} trading days</b></div><p className="tni-mini-reason">{outlook.decision.reason||'Open Prediction Lab to explore the evidence.'}</p><p className="tni-mini-time">Generated {new Date(outlook.as_of).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})} ET</p><div className="tni-mini-risk"><strong>Before acting, review risk.</strong><a href={LAB+'?ticker='+ticker}>Open Risk Agent in Prediction Lab →</a><small>Sign in for detailed agent evidence.</small></div><MiniLabSharing snapshot={{ticker,kind:'outlook',view:choiceLabel||'Not selected',action:outlook.decision.action,horizon:outlook.horizon,asOf:outlook.as_of}}/><button className="tni-mini-explore" aria-expanded={historyOpen} onClick={()=>{setHistoryOpen(o=>!o);if(!historyOpen)track('mini_lab_history_opened',ticker)}}>{historyOpen?'Hide recorded signals ↑':'Explore recorded signals · 10-sec replay ↓'}</button>{historyOpen&&<RecordedReplay ticker={ticker} choice={choice}/>}</section>}
    </>}
    <a className="tni-mini-cta" href={LAB+'?ticker='+ticker} onClick={()=>track('mini_lab_open_full',ticker)}>Open full Prediction Lab →</a>
    <p className="tni-mini-note">Research and education. Not investment advice.</p>
  </div>
}
export default function MiniPredictionLab(){
  const [selected,setSelected]=useState(0)
  const [visible,setVisible]=useState(false)
  const section=useRef<HTMLElement>(null)
  useEffect(()=>{if(!('IntersectionObserver'in window)){setVisible(true);return}const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect()}},{rootMargin:'160px'});if(section.current)observer.observe(section.current);return()=>observer.disconnect()},[])
  const market=markets[selected]
  return <section className="tni-mini-lab" ref={section} aria-labelledby="tni-mini-title"><div className="tni-mini-copy"><span className="tni-mini-eyebrow">PREDICTION LAB · FREE TO EXPLORE</span><h2 id="tni-mini-title">Your view.<br/> The model.<br/> The evidence.</h2><p>Make your call. Reveal TNI’s outlook. Watch the market’s recorded moves.</p><ol><li><b>01</b><span><strong>Make your call</strong>Up, flat or down?</span></li><li><b>02</b><span><strong>Compare with TNI</strong>Reveal the model’s outlook.</span></li><li><b>03</b><span><strong>Follow the record</strong>Explore prices and actual signals.</span></li></ol><p className="tni-mini-public">SPY · QQQ · IWM<br/>No account needed to explore.</p></div><div className="tni-mini-app"><div className="tni-mini-tabs" role="group" aria-label="Choose a market">{markets.map((m,i)=><button key={m.ticker} aria-pressed={i===selected} onClick={()=>{setSelected(i);setVisible(true);track('mini_lab_market_selected',m.ticker)}}>{m.ticker}<span>{m.name}</span></button>)}</div>{visible?<MarketOutlook key={market.ticker} {...market}/>:<p>The lab loads when this section is visible.</p>}</div></section>
}
