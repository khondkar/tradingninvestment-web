type TNIResearchIdentityProps = {
  compact?: boolean
}

export default function TNIResearchIdentity({
  compact = false,
}: TNIResearchIdentityProps) {
  return (
    <div
      className={
        compact
          ? 'tni-research-identity tni-research-identity--compact'
          : 'tni-research-identity'
      }
      aria-label="TradingNInvestment Research"
    >
      <div className="tni-research-identity__brand">
        <strong>TNI</strong>
        <span aria-hidden="true">|</span>
        <b>RESEARCH</b>
      </div>

      {!compact && (
        <div className="tni-research-identity__signature">
          <span>tradingninvestment.com</span>
          <small>DATA · INTELLIGENCE · DECISIONS</small>
        </div>
      )}
    </div>
  )
}
