import { useEffect, useState } from "react";
import "./DowHistoricalArticle.css";

/** Restored original TNI historical article with interactive 1920–2026 charts. */
export default function DowHistoricalArticle() {
  const [markup, setMarkup] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/tni-dow-article/article.html").then(r => {if (!r.ok) throw Error("Article HTML missing"); return r.text()}),
      fetch("/tni-dow-article/article.js").then(r => {if (!r.ok) throw Error("Article JS missing"); return r.text()})
    ]).then(([html, js]) => {
      if (cancelled) return;
      setMarkup(html);
      // Execute after React has inserted article markup.
      requestAnimationFrame(() => {
        if (cancelled) return;
        const root = document.querySelector(".tni-dow-react-root");
        if (!root) return;
        const script = document.createElement("script");
        script.textContent = js;
        script.dataset.tniDow = "interactive";
        root.appendChild(script);
      });
    }).catch(e => { if (!cancelled) setError(String(e)) });
    return () => { cancelled = true; };
  }, []);
  return <div className="tni-dow-react-root">
    <div className="tni-dow-topbar"><a href="/">TradingNInvestment</a><span>Historical Research · 1920–2026</span></div>
    {error ? <p role="alert">{error}</p> : markup ? <div dangerouslySetInnerHTML={{__html:markup}} /> : <p>Loading historical research…</p>}
  </div>;
}
