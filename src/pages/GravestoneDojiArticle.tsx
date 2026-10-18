import article from "./article-content.json";
import "./GravestoneDojiArticle.css";

export default function GravestoneDojiArticle() {
  return <article className="tni-gravestone">
    <nav className="tni-crumb"><a href="/research/trading/">Trading Research</a> / Technical Analysis</nav>
    <p className="tni-eyebrow">CANDLESTICK PATTERNS · ORIGINAL RESEARCH ARCHIVE</p>
    <h1>{article.title}</h1>
    <p className="tni-date">Originally published January 21, 2016 · TradingNInvestment</p>
    <div className="tni-article-body">
      {article.blocks.map((block, index) => {
        const [kind, value] = block;
        if (kind === "image") {
          const image = article.originalImages.find(([name]) => name === value);
          return image ? <figure key={index}><img src={image[1]} alt={value.replace(/[-.]/g," ")} loading="lazy"/><figcaption>Original TradingNInvestment chart (2016)</figcaption></figure> : null;
        }
        if (kind === "heading") return <h2 key={index}>{value}</h2>;
        return <p key={index}>{value}</p>;
      })}
    </div>
    <p className="tni-disclaimer">Historical educational material. Trading patterns are not guaranteed signals. Examples are not independently backtested results.</p>
    <a className="tni-back" href="/research/trading/">← More Trading Research</a>
  </article>;
}