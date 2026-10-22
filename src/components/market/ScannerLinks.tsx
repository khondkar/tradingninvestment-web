export const equityScanners = [
  { path: 'https://app.tradingninvestment.com/scanner?universe=sp500', title: 'S&P 500 Scanner', description: 'Scan S&P 500 stocks.' },
  { path: 'https://app.tradingninvestment.com/scanner?universe=russell3000', title: 'Russell 3000 Scanner', description: 'Scan the broader U.S. market.' },
]
export default function ScannerLinks({ active }: { active?: string }) {
  return <details className="tni-scanner-group" open={active?.includes('/research/scanners/') || undefined}>
    <summary>Scanner <span aria-hidden="true">⌄</span></summary>
    {equityScanners.map(scanner => <a className="tni-equity-scanner-link" key={scanner.path} href={scanner.path}><strong>{scanner.title}</strong><small>Sign-in required <span aria-hidden="true">↗</span></small></a>)}
    <a href="/research/scanners/leveraged-etf/" aria-current={active?.replace(/\/+$/, '') === '/research/scanners/leveraged-etf' ? 'page' : undefined}>Leveraged ETF Scanner</a>
  </details>
}
