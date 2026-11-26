
import { useEffect } from 'react'
import article from '../data/articles/ai-chip-stocks-vs-dot-com-crash.html?raw'
import './NasdaqAICrash2026Page.css'
import './NasdaqSelloffComparisonPage.css'

export default function SoxDotComPage() {
  useEffect(() => {
    document.title = "Are AI chip stocks following the dot-com crash? | TNI"
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = 'https://tradingninvestment.com/ai-chip-stocks-vs-dot-com-crash/'
  }, [])
  return (
    <main className="nac-page tni-comparison">
      <nav className="nac-breadcrumb" aria-label="Breadcrumb">
        <a href="/research/">Research</a> / <a href="/research/indexes/nasdaq/">Nasdaq</a> / AI chip selloff
      </nav>
      <div dangerouslySetInnerHTML={{ __html: article }} />
    </main>
  )
}
