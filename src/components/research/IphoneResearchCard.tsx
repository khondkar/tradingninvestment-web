import './IphoneResearchCard.css';

export const IPHONE_RESEARCH_URL = '/new-iphone-release-apple-stock-price-history/';

/** Reusable card: insert once into the AAPL research list and once into Trading Research. */
export default function IphoneResearchCard({ layout = 'vertical' }: { layout?: 'vertical' | 'horizontal' }) {
  return (
    <a className={`tni-iphone-research-card tni-iphone-research-card--${layout}`} href={IPHONE_RESEARCH_URL}>
      <img src="/images/research/tni-iphone-launch-stock-performance.webp"
        alt="TNI research thumbnail with Apple logo, iPhone and rising stock chart"
        width="1508" height="334" loading="lazy" decoding="async" />
      <div className="tni-iphone-research-card__body">
        <span className="tni-iphone-research-card__eyebrow">APPLE INC. · AAPL</span>
        <strong>iPhone Launch &amp; Stock Performance</strong>
        <span className="tni-iphone-research-card__period">2007–2026</span>
        <p>Interactive AAPL vs. S&amp;P 500 returns, announcement event study and iPhone sales analysis.</p>
        <span className="tni-iphone-research-card__cta">Read research <span aria-hidden="true">→</span></span>
      </div>
    </a>
  );
}
