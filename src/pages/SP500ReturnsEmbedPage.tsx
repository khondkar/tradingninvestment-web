import SP500AnnualReturnsChart from '../components/charts/SP500AnnualReturnsChart'

// ============================================================================
// TNI S&P 500 RETURNS — PUBLISHER EMBED PAGE
//
// Purpose:
// - Dedicated clean iframe destination
// - Displays the full verified annual-return chart
// - Keeps TradingNInvestment branding and source attribution
// - No article navigation, table, or other website chrome
// ============================================================================

export default function SP500ReturnsEmbedPage() {
  return (
    <main
      style={{
        margin: 0,
        minHeight: '100vh',
        background: '#ffffff',
        color: '#10233f',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '14px',
        }}
      >
        {/* =================================================================
            TNI EMBED — INTERACTIVE VERIFIED CHART
        ================================================================= */}

        <SP500AnnualReturnsChart
          rangeLabel="1928–2026 YTD"
        />

        {/* =================================================================
            TNI EMBED — CANONICAL SOURCE / ATTRIBUTION
        ================================================================= */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '6px',
            paddingTop: '10px',
            borderTop: '1px solid #e6edf5',
            color: '#718096',
            fontSize: '11px',
            lineHeight: 1.5,
          }}
        >
          <span>
            © TradingNInvestment | TNI Research
          </span>

          <a
            href="https://tradingninvestment.com/sp-500-returns/"
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#0b63ce',
              fontWeight: 750,
              textDecoration: 'none',
            }}
          >
            Explore full research →
          </a>
        </div>

        {/* =================================================================
            TNI EMBED — USAGE NOTICE
        ================================================================= */}

        <div
          style={{
            marginTop: '8px',
            color: '#8a97a8',
            fontSize: '10px',
            lineHeight: 1.5,
          }}
        >
          Personal, educational, and editorial research use permitted with
          TradingNInvestment attribution. Commercial reproduction,
          redistribution, resale, or use within commercial products or
          services requires permission from TradingNInvestment.
        </div>
      </div>
    </main>
  )
}
