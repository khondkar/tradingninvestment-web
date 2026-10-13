import { useState } from 'react'
import './JpmEarnings2026Q3.css'

type Bank = 'BAC' | 'MS'
const banks = {
  BAC: {
    name: 'Bank of America', release: '6:45 a.m.', call: '8:30 a.m.',
    schedule: 'https://newsroom.bankofamerica.com/content/newsroom/press-releases/2026/09/bank-of-america-to-report-third-quarter-2026-financial-results-a.html',
    source: 'https://investor.bankofamerica.com/',
    question: 'Can lending income grow while funding costs and credit losses remain controlled?',
    metrics: [
      ['Net interest income', 'Compare interest income with deposit costs and management’s outlook.'],
      ['Deposits and funding costs', 'Separate balance growth from the price paid to retain deposits.'],
      ['Credit quality', 'Read net charge-offs alongside provisions and changes in reserves.'],
      ['Capital and ROTCE', 'Assess profitability together with CET1 capital and capital distributions.'],
    ],
    prior: [['Diluted EPS', '$1.21'], ['Revenue, net of interest expense', '$31.6B'], ['Net income', '$9.1B'], ['ROTCE · non-GAAP', '17.0%']],
  },
  MS: {
    name: 'Morgan Stanley', release: '7:30 a.m.', call: '9:30 a.m.',
    schedule: 'https://www.morganstanley.com/press-releases/morgan-stanley-schedules-2026-quarterly-investor-conference-call',
    source: 'https://www.morganstanley.com/about-us-ir/shareholder/2q2026.pdf',
    question: 'Can wealth management growth sustain returns as trading and deal activity change?',
    metrics: [
      ['Net new assets', 'Distinguish recurring flows from unusually large client transactions.'],
      ['Wealth management margin', 'Check whether fee income is growing faster than expenses.'],
      ['Investment banking and trading', 'Separate advisory, underwriting, equities and fixed income.'],
      ['ROTCE and efficiency', 'Compare profitability with expense discipline and capital use.'],
    ],
    prior: [['Diluted EPS', '$3.46'], ['Net revenues', '$21.348B'], ['Wealth management margin', '30.5%'], ['Net new assets', '$148.1B']],
  },
}
export default function BankEarningsPreview2026Q3({ ticker }: { ticker: Bank }) {
  const [tab, setTab] = useState('What matters')
  const bank = banks[ticker]
  return <section className="jpm-earnings">
    <div className="jpm-meta">Q3 2026 PREVIEW · OCTOBER 14, 2026</div>
    <div className="jpm-note"><strong>Confirmed schedule · Eastern time</strong><p>Results expected approximately {bank.release} ET · Conference call {bank.call} ET.</p><a href={bank.schedule} target="_blank" rel="noreferrer">Company announcement ↗</a></div>
    <nav className="jpm-tabs" aria-label={`${ticker} earnings sections`}>{['What matters', 'Results', 'History'].map(label => <button type="button" key={label} aria-pressed={tab===label} onClick={()=>setTab(label)}>{label}</button>)}</nav>
    {tab==='What matters' && <><h3>{bank.question}</h3><p>TNI research framework: select a driver to see what to compare when the report arrives.</p>{bank.metrics.map(([name, note])=><details className="jpm-note" key={name}><summary>{name}</summary><p>{note}</p><p>Compare Q3 2026 with Q2 2026 and Q3 2025 using the same accounting basis. A favorable headline alone does not establish a stronger underlying trend.</p></details>)}</>}
    {tab==='Results' && <><h3>Results have not been added.</h3><p>This preview was reviewed October 13, 2026. Q3 actuals, guidance and market reactions will require a verified update after publication; they do not update automatically.</p><a href={bank.schedule} target="_blank" rel="noreferrer">Check the official reporting information ↗</a></>}
    {tab==='History' && <><h3>The previous quarter, in context.</h3><p>Q2 2026 reported figures. These are historical reference values, not Q3 estimates.</p><div className="jpm-tiles">{bank.prior.map(([name,value])=><article key={name}><span>{name}</span><strong>{value}</strong><small>Q2 2026</small></article>)}</div>{ticker==='MS' && <p>Just over half of Q2 net new assets came from IPO-related inflows through Workplace. Consider that concentration when comparing the next quarter.</p>}<p>No historical surprise or stock-reaction series is presented without verified data.</p></>}
    <footer className="jpm-source"><a href={bank.source} target="_blank" rel="noreferrer">{bank.name} · Q2 reference source ↗</a><span>Reviewed October 13, 2026 · Static preview · Company schedules may change</span></footer>
  </section>
}
