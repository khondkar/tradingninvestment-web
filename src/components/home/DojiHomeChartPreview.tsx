import data from '../../research/doji/reversal-continuation-results.json'

const scenarios = [
  'Bullish reversal',
  'Bearish reversal',
  'Bullish continuation',
  'Bearish continuation',
]

export default function DojiHomeChartPreview() {
  const rows = scenarios.map(name => ({
    name,
    value: data.performance.find(
      row => row.Scenario === name && row.Horizon === 10
    )?.Advantage_pp,
  }))

  return (
    <div className="tni-home-chart" style={{ boxSizing: 'border-box' }}>
      <div className="tni-home-chart-top">
        <strong>SPY · DOJI STUDY</strong>
        <span>26 YEARS</span>
      </div>

      <div style={{
        marginTop: 18,
        marginBottom: 5,
        fontSize: 17,
        fontWeight: 750,
        letterSpacing: '-.04em',
      }}>
        Reversal or continuation?
      </div>

      <p style={{ marginBottom: 18 }}>
        10-day Doji advantage · percentage points
      </p>

      {rows.map(({ name, value }) => {
        if (value === undefined) return null

        const width = Math.min(Math.abs(value) / 5 * 100, 100)

        return (
          <div key={name} style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 6,
              fontSize: 11,
            }}>
              <span>{name}</span>
              <strong style={{ whiteSpace: 'nowrap' }}>
                {value > 0 ? '+' : ''}{value.toFixed(2)} pp
              </strong>
            </div>

            <div style={{
              height: 8,
              borderRadius: 4,
              background: '#edf2ef',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${width}%`,
                height: '100%',
                borderRadius: 4,
                background: value >= 0 ? '#168b80' : '#d69a4a',
              }} />
            </div>
          </div>
        )
      })}

      <div className="tni-home-chart-bottom">
        <span>ORIGINAL RESEARCH · SPY 2000–2026</span>
        <strong>FIGURE 7 ↗</strong>
      </div>
    </div>
  )
}
