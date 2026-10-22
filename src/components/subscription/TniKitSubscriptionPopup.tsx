import { useEffect, useRef, useState } from 'react';
import './TniKitSubscriptionPopup.css';

const DISMISS_KEY = 'tni-kit-subscription-dismissed-until';
const IBM_SHOWN_KEY = 'tni-ibm-subscription-shown';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Render once in a shared research-article layout, not once per card. */
export default function TniKitSubscriptionPopup({ delayMs = 15000, onceEver = false }: { delayMs?: number; onceEver?: boolean }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (onceEver && localStorage.getItem(IBM_SHOWN_KEY)) return;
      if (Number(localStorage.getItem(DISMISS_KEY) || 0) > Date.now()) return;
    } catch { /* Private browsing: continue without persistence. */ }

    let elapsed = false;
    let scrolled = false;
    const maybeOpen = () => { if (elapsed && scrolled) setReady(true); };
    const onScroll = () => {
      const available = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      scrolled = available > 0 && window.scrollY / available >= 0.5;
      maybeOpen();
    };
    const timer = window.setTimeout(() => { elapsed = true; maybeOpen(); }, delayMs);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [delayMs, onceEver]);

  useEffect(() => {
    if (!ready) return;
    if (onceEver) {
      try {
        if (localStorage.getItem(IBM_SHOWN_KEY)) return;
        localStorage.setItem(IBM_SHOWN_KEY, '1');
      } catch { /* Browser storage unavailable. */ }
    }
    setOpen(true);
  }, [ready, onceEver]);
  useEffect(() => { if (open) closeButton.current?.focus(); }, [open]);


  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + THIRTY_DAYS_MS)); } catch { /* optional */ }
    setOpen(false);
    setReady(false);
  };

  if (!open) return null;
  return (
    <div className="tni-kit-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
      <section className="tni-kit-dialog" role="dialog" aria-modal="true" aria-labelledby="tni-kit-heading">
        <div className="tni-kit-content">
          <header className="tni-kit-header">
            <div className="tni-kit-brand"><span className="tni-kit-logo" aria-hidden="true">↗</span><span><strong>TradingNInvestment</strong><small>INDEPENDENT FINANCIAL RESEARCH</small></span></div>
            <button ref={closeButton} type="button" className="tni-kit-close" onClick={dismiss} aria-label="Close subscription popup">×</button>
          </header>
          <div className="tni-kit-rule" />
          <div className="tni-kit-intro">
            <span className="tni-kit-eyebrow">TNI MARKET INTELLIGENCE</span>
            <h2 id="tni-kit-heading">Go beyond the market headlines.</h2>
            <p>Quant signals, original research, and news intelligence from the TNI News Agent—bringing deeper context to market moves, risks, and opportunities.</p>
          </div>
          <div className="tni-kit-form-host">
            <form
              action="https://app.kit.com/forms/10046716/subscriptions"
              method="POST"
              className="formkit-form"
              data-uid="8f25beaeb4"
            >
              <div className="formkit-fields">
                <div className="formkit-field">
                  <input
                    type="email"
                    name="email_address"
                    placeholder="Your email address"
                    aria-label="Email address"
                    autoComplete="email"
                    required
                  />
                </div>
                <button className="formkit-submit" type="submit">
                  <span>Subscribe</span>
                </button>
              </div>
            </form>
          </div>
          <p className="tni-kit-privacy">Free to read. No spam. Unsubscribe anytime.</p>
        </div>
        <footer className="tni-kit-footer">Signals · Research · News intelligence · Deeper perspective</footer>
      </section>
    </div>
  );
}
