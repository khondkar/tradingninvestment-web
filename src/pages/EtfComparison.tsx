import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import candidates from './leveraged-etf-candidates.json'
import snapshot from './leveraged-etf-daily-metrics.json'
import saved from './four-etf-metrics.json'
import { scannerResearchProfiles as profiles } from './scannerResearchProfiles'
import { loadResearchData, getLeveragedEtfResearchData } from '../performance/researchData'
import './EtfComparison.css'

type Daily = {price:number|null;changePct:number|null;volume:number|null;sessionDate:string|null;aum:number|null;expenseRatioPct:number|null;fundAsOf:string|null}
type Metric = {aumBillion:number|null;expenseRatioPct:number|null;avgVolumeMillion:number|null;avgVolumePeriod:string|null;lastVolumeMillion:number|null;lastVolumeDate:string|null;asOf:string;sources:string[]}
const daily = snapshot.funds as Record<string,Daily>
const metrics = saved as Record<string,Metric>
const number = (v:number|null|undefined, suffix='') => v == null || !Number.isFinite(v) ? 'Not available' : `${v.toLocaleString('en-US',{maximumFractionDigits:2})}${suffix}`
const compact = (v:number|null|undefined, money=false) => v == null ? 'Not available' : `${money?'$':''}${Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(v)}`
const colors = ['#1763ce','#087f72','#9256b8','#bb5422']
export default function EtfComparison({tickers,onClose}:{tickers:string[];onClose:()=>void}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tab,setTab] = useState('Overview')
  const [history,setHistory] = useState<Record<string,{year:number;value:number}[]>>({})
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(false)
  const [year,setYear] = useState<number|null>(null)
  useEffect(()=>{
    const active = document.activeElement as HTMLElement|null
    const overflow = document.body.style.overflow
    dialog.current?.showModal(); document.body.style.overflow='hidden'
    return ()=>{document.body.style.overflow=overflow;active?.focus({preventScroll:true})}
  },[])
  useEffect(()=>{
    if(tab!=='Performance')return
    let cancelled=false
    setLoading(true);setError(false)
    Promise.all(tickers.filter(t=>profiles[t]).map(async t=>{
      await loadResearchData('leveraged',t)
      const data=getLeveragedEtfResearchData(t)?.annualReturns
      // Completed calendar years only; exclude partial/YTD observations.
      return [t,data?.data.filter(r=>r.year <= (data.summary?.end_year ?? 0)) ?? []] as const
    })).then(entries=>{if(!cancelled)setHistory(Object.fromEntries(entries))}).catch(()=>{if(!cancelled)setError(true)}).finally(()=>{if(!cancelled)setLoading(false)})
    return ()=>{cancelled=true}
  },[tab,tickers])
  const years = [...new Set(Object.values(history).flatMap(rows=>rows.map(r=>r.year)))].sort((a,b)=>b-a)
  const selectedYear = year ?? years[0]
  const values=tickers.map(t=>history[t]?.find(r=>r.year===selectedYear)?.value)
  const scale=Math.max(1,...values.map(v=>Math.abs(v??0)))
  const rows:{label:string;value:(t:string)=>string}[]=[
    {label:'Saved price',value:t=>daily[t]?.price == null?'Not available':`$${number(daily[t].price)}`},
    {label:'Session change',value:t=>number(daily[t]?.changePct,'%')},
    {label:'Price / change session',value:t=>daily[t]?.sessionDate??'Not available'},
    {label:'Assets under management',value:t=>compact(daily[t]?.aum??(metrics[t]?.aumBillion == null?null:metrics[t].aumBillion!*1e9),true)},
    {label:'AUM as of',value:t=>(daily[t]?.aum != null?daily[t].fundAsOf:metrics[t]?.aumBillion != null?metrics[t].asOf:null)??'Not available'},
    {label:'Expense ratio',value:t=>number(daily[t]?.expenseRatioPct??metrics[t]?.expenseRatioPct,'%')},
    {label:'Fee as of',value:t=>(daily[t]?.expenseRatioPct != null?daily[t].fundAsOf:metrics[t]?.expenseRatioPct != null?metrics[t].asOf:null)??'Not available'},
    {label:'Average volume',value:t=>metrics[t]?.avgVolumeMillion == null?'Not available':`${compact(metrics[t].avgVolumeMillion!*1e6)} shares (${metrics[t].avgVolumePeriod??'period unspecified'})`},
    {label:'Average volume as of',value:t=>metrics[t]?.avgVolumeMillion == null?'Not available':metrics[t].asOf},
    {label:'Last-session volume',value:t=>compact(daily[t]?.volume??(metrics[t]?.lastVolumeMillion == null?null:metrics[t].lastVolumeMillion!*1e6))},
    {label:'Volume session',value:t=>(daily[t]?.volume != null?daily[t].sessionDate:metrics[t]?.lastVolumeDate)??'Not available'},
    {label:'Daily objective',value:t=>profiles[t]?.leveragedEtf?.leverageLabel??(()=>{const f=candidates.find(f=>f.ticker===t);return f?.leverage?`${f.direction==='Inverse'?'−':'+'}${f.leverage}× · preliminary`:'Not available'})()},
    {label:'Issuer',value:t=>profiles[t]?.leveragedEtf?.issuer??'Not available'},
  ]
  return createPortal(<dialog ref={dialog} className="tni-compare-dialog" aria-labelledby="compare-title" onCancel={e=>{e.preventDefault();onClose()}}>
    <header className="tni-compare-header"><button onClick={onClose}>← Back to scanner</button><button aria-label="Close comparison" onClick={onClose}>✕</button></header>
    <div className="tni-compare-body"><p className="tni-compare-eyebrow">TNI / ETF INTELLIGENCE</p><h2 id="compare-title">A clearer comparison.</h2><p className="tni-compare-description">{tickers.join(' + ')} · Saved research, side by side.</p>
    <div className="tni-compare-tabs" aria-label="Comparison sections">{['Overview','Performance','Sources'].map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {tab==='Overview'&&<><p className="tni-compare-note">Saved snapshots · Not live. Dates and average-volume windows can differ. “Not available” does not mean zero.</p>{tickers.length>2&&<p className="tni-compare-scroll-hint">Swipe the table to see every fund →</p>}<div className="tni-compare-table-wrap" tabIndex={0} role="region" aria-label="Fund metrics, scroll horizontally"><table className={`tni-compare-table tni-compare-count-${tickers.length}`}><thead><tr><th scope="col">Fund metrics</th>{tickers.map((t,i)=><th scope="col" key={t}><span style={{color:colors[i]}}>{t}</span><small>{profiles[t]?.name??candidates.find(f=>f.ticker===t)?.name}</small></th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.label}><th scope="row">{r.label}</th>{tickers.map(t=><td key={t}>{r.value(t)}</td>)}</tr>)}</tbody></table></div></>}
    {tab==='Performance'&&<section className="tni-compare-performance"><h3>Calendar-year price returns</h3><p>Completed years from saved research. Excludes dividends; this is not an intraday price chart. Missing funds and years are not estimated.</p>{loading?<p role="status">Loading saved history…</p>:error?<p role="alert">History could not load. Return to Overview, then try again.</p>:years.length===0?<p>No annual return history is saved for these funds.</p>:<><label>Calendar year <select value={selectedYear} onChange={e=>setYear(Number(e.target.value))}>{years.map(y=><option key={y}>{y}</option>)}</select></label><div className="tni-compare-bars">{tickers.map((t,i)=><div key={t}><strong>{t}</strong><span>{number(values[i],'%')}</span><div className="tni-compare-track"><div style={{width:`${Math.abs(values[i]??0)/scale*100}%`,background:colors[i]}} /></div></div>)}</div><p>Bar length shows absolute magnitude; the signed percentage shows gain or loss. Compare the same year, not different inception periods.</p></>}</section>}
    {tab==='Sources'&&<section className="tni-compare-sources"><h3>Trace the numbers</h3><p>Price, change and available AUM/volume use the saved Yahoo Finance research snapshot. Additional saved metrics fill gaps only; dates are shown in Overview.</p><p>Snapshot export: {snapshot.updatedAt}</p>{tickers.map(t=><article key={t}><h4>{t}</h4><p>{profiles[t]?'Editorial research available.':'Directory listing; classification may be preliminary or inactive.'}</p>{profiles[t]&&<a href={profiles[t].canonicalPath}>Open {t} research ↗</a>}{daily[t]?.price != null && <a href={`https://finance.yahoo.com/quote/${encodeURIComponent(t)}/`} target="_blank" rel="noopener noreferrer">Yahoo Finance snapshot provider ↗</a>}{metrics[t]?.sources.map((s,i)=><a key={s} href={s} target="_blank" rel="noopener noreferrer">Metric source {i+1} ↗</a>)}{!metrics[t]&&!daily[t]&&<p>No saved market metrics for this fund.</p>}</article>)}</section>}
    <aside className="tni-compare-risk">Daily leverage resets. Multi-day returns can diverge materially from the stated multiple. Compare objectives, costs and risks before investing.</aside></div>
  </dialog>,document.body)
}
