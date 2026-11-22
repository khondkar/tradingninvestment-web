import { useState } from "react"
import stocks from "../../data/charts/soxlTopStocks.json"

export default function SoxlHoldings() {
  const [selected, select] = useState(stocks[0])
  const [metric, change] = useState<"dd" | "gain">("dd")
  const limit = metric === "dd" ? 100 : 350
  return <section aria-labelledby="soxl-stock-holdings">
    <h3 id="soxl-stock-holdings">SOXL’s 10 largest direct stock holdings</h3>
    <p>How far did each stock climb from the December 31, 2025 close to its highest closing price in 2026? How much had it lost from that peak by November 20?</p>
    <div className="soxl-recovery-controls" role="group" aria-label="Holding return measure">
      <button type="button" aria-pressed={metric === "dd"} onClick={() => change("dd")}>Loss from peak</button>
      <button type="button" aria-pressed={metric === "gain"} onClick={() => change("gain")}>Gain to peak</button>
    </div>
    <p>Select a stock for its prices, peak date and portfolio weight.</p>
    {stocks.map(s => <button type="button" key={s.ticker} aria-pressed={selected.ticker === s.ticker} onClick={() => select(s)} onMouseEnter={() => select(s)} onFocus={() => select(s)}
      style={{display:"grid",gridTemplateColumns:"4em 1fr 6em",alignItems:"center",width:"100%",gap:8,minHeight:36,padding:"3px 8px",font:"inherit",color:"#173047",background:selected.ticker===s.ticker?"#eaf2f7":"white",border:0,textAlign:"left",cursor:"pointer"}}>
      <strong>{s.ticker}</strong><span aria-hidden="true" style={{width:Math.abs(s[metric])/limit*100+"%",height:12,background:metric==="dd"?"#ac4132":"#13725d"}}/><span style={{textAlign:"right"}}>{metric==="gain"?"+":""}{s[metric].toFixed(2)}%</span>
    </button>)}
    <p aria-live="polite"><strong>{selected.ticker} · {selected.weight.toFixed(2)}% of fund assets</strong><br/>
    Dec 31 close ${selected.base.toFixed(2)} → peak ${selected.peak.toFixed(2)} on {selected.date} → Nov 20 close ${selected.end.toFixed(2)}.</p>
    <p className="soxl-recovery-method">Ranked by November 20 direct equity weight. Swaps and cash positions are excluded. Returns use split-adjusted closing prices and exclude dividends. <a href="https://stockanalysis.com/etf/soxl/holdings/">Holdings and weights</a> · <a href={'https://finance.yahoo.com/quote/'+selected.ticker+'/history/'}>{selected.ticker} price history</a></p>
  </section>
}
