import { useEffect, useState } from 'react'
import { getLeveragedEtfResearchData, loadResearchData } from '../performance/researchData'
import type { LeveragedEtfResearchData } from '../research/annual-returns/leveragedEtfDataRegistry'
import { scannerResearchProfiles } from './scannerResearchProfiles'

const pct = (n: number | null | undefined) => typeof n === 'number' && Number.isFinite(n) ? `${n > 0 ? '+' : ''}${n.toFixed(2)}%` : 'Not available'
const date = (s?: string | null) => s || 'Date not recorded'
const row = (label: string, value: string | number) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>

export default function ScannerFundDetails({ ticker }: { ticker: string }) {
  const config = scannerResearchProfiles[ticker]
  const fund = config?.leveragedEtf
  const [data, setData] = useState<LeveragedEtfResearchData | undefined>(() => getLeveragedEtfResearchData(ticker))
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setError(false)
    loadResearchData('leveraged', ticker).then(() => {
      if (!active) return
      const result = getLeveragedEtfResearchData(ticker)
      setData(result)
      if (!result) setError(true)
    }).catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [ticker, attempt])
  if (!fund) return null
  const annual = data?.annualReturns
  const summary = annual?.summary
  const dd = data?.drawdownData
  const methods = data?.returnMethods as (NonNullable<LeveragedEtfResearchData['returnMethods']>[number] & { data_through?: string })[] | undefined
  const latest = methods?.filter(r => r.is_ytd).sort((a,b) => b.year-a.year)[0]
  return <div className="tni-les-research-detail">
    <p className="tni-les-snapshot">Saved TNI research · Not a live quote</p>
    <h4>Fund profile</h4>
    <dl>{row('Fund', config.name)}{row('Issuer',fund.issuer)}{row('Daily objective',fund.leverageLabel)}{row('Inception',fund.inceptionDate)}</dl>
    <p>{fund.dailyObjective}</p>
    {fund.structureSummary && <p>{fund.structureSummary}</p>}
    {fund.compositionNotes?.length ? <details className="tni-les-nested"><summary>Structure & leverage history</summary><ul>{fund.compositionNotes.map(n=><li key={n}>{n}</li>)}</ul></details> : null}
    {!data && !error && <p role="status">Loading saved performance data…</p>}
    {error && <div role="alert"><p>Saved performance data could not load.</p><button type="button" onClick={()=>setAttempt(n=>n+1)}>Retry data</button></div>}
    {data && <>
      {latest && <><h4>{latest.year} YTD snapshot</h4><p>Returns through {date(latest.data_through)}.</p><dl>{row('Price return',pct(latest.price_return))}{row('Total return',pct(latest.total_return))}</dl></>}
      {summary && <><h4>Completed calendar years</h4><p>{summary.start_year}–{summary.end_year} · {summary.completed_years_analyzed} complete years · Price returns</p><dl>
        {row('Positive / negative years',`${summary.positive_years} / ${summary.negative_years}`)}
        {row('Positive years',`${summary.positive_year_pct.toFixed(2)}%`)}
        {row('Average annual return',pct(summary.average_annual_return_pct))}
        {row('Median annual return',pct(summary.median_annual_return_pct))}
        {row(`Best year · ${summary.best_year.year}`,pct(summary.best_year.return_pct))}
        {row(`Worst year · ${summary.worst_year.year}`,pct(summary.worst_year.return_pct))}
      </dl><p>Average is arithmetic, not compound annual growth (CAGR). YTD is excluded.</p></>}
      {dd && <><h4>Drawdown history</h4><p>{dd.range.first_date}–{dd.range.last_date} · {dd.range.daily_observations.toLocaleString()} synchronized observations · Adjusted-close basis</p><dl>
        {row('Maximum drawdown',pct(dd.asset_summary.max_drawdown_pct))}
        {row('Drawdown at snapshot date',pct(dd.asset_summary.current_drawdown_pct))}
        {row('Peak date',dd.asset_summary.peak_date)}{row('Trough date',dd.asset_summary.trough_date)}
        {row('Recovery',dd.asset_summary.recovery_date || `Not recovered by ${dd.range.last_date}`)}
        {row('Peak to trough',`${dd.asset_summary.calendar_days_peak_to_trough} calendar days`)}
        {row('Trough to recovery',dd.asset_summary.calendar_days_trough_to_recovery == null ? 'Not recovered in snapshot' : `${dd.asset_summary.calendar_days_trough_to_recovery} calendar days`)}
        {row('Total time underwater',dd.asset_summary.total_calendar_days_underwater == null ? 'Ongoing at snapshot date' : `${dd.asset_summary.total_calendar_days_underwater} calendar days`)}
        {row('Comparison asset',data.benchmarkName)}
        {row(`${data.benchmarkName} maximum drawdown`,pct(dd.benchmark_summary.max_drawdown_pct))}
        {row(`${data.benchmarkName} snapshot drawdown`,pct(dd.benchmark_summary.current_drawdown_pct))}
      </dl><p>The comparison asset is a research reference; it may differ from the fund’s official target index.</p></>}
      {methods?.length ? <details className="tni-les-nested"><summary>All annual returns ({methods.length} rows)</summary><div className="tni-les-table-scroll"><table><caption>Saved annual returns (%)</caption><thead><tr><th scope="col">Year</th><th scope="col">Price</th><th scope="col">Total</th></tr></thead><tbody>{[...methods].sort((a,b)=>b.year-a.year).map(r=><tr key={r.year}><th scope="row">{r.year}{r.is_ytd?' YTD':''}</th><td>{pct(r.price_return)}</td><td>{pct(r.total_return)}</td></tr>)}</tbody></table></div><p>Price returns exclude dividends. Total returns use adjusted-close data. YTD ends on the date shown above.</p></details> : null}
      <h4>Source & methodology</h4><p>{annual?.source}. {annual?.methodology.calculation}</p>
    </>}
    <div className="tni-les-detail-links"><a href={config.canonicalPath}>Full research & charts ↗</a><a href={fund.officialUrl} target="_blank" rel="noopener noreferrer">Issuer fund page ↗</a></div>
    <p>Live price, trading volume, AUM, expense ratio and current holdings weights are not supplied by this saved dataset. Fund terms may change; see the issuer for current terms.</p>
  </div>
}
