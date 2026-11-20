
import { useEffect } from 'react'
import article from '../data/articles/nasdaq-ai-selloff-vs-dot-com-crash.html?raw'
import './NasdaqAICrash2026Page.css'
import './NasdaqSelloffComparisonPage.css'

export default function NasdaqSelloffComparisonPage() {
  useEffect(() => {
    document.title = "Nasdaq Sell-Off 2026: AI Stocks vs. the Dot-Com Crash | TNI"
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = 'https://tradingninvestment.com/nasdaq-ai-selloff-vs-dot-com-crash/'
  }, [])
  return (
    <main className="nac-page tni-comparison">
      <nav className="nac-breadcrumb" aria-label="Breadcrumb">
        <a href="/research/">Research</a> / <a href="/research/indexes/nasdaq/">Nasdaq</a> / Nasdaq sell-off
      </nav>
      <div dangerouslySetInnerHTML={{ __html: article }} />
    </main>
  )
}
