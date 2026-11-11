"""Render the TQQQ/QLD/QQQ research card from the article's saved daily data."""
from pathlib import Path
import json

import matplotlib
matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from matplotlib.ticker import PercentFormatter
import numpy as np
import pandas as pd
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FUNDS = [("tqqq", "TQQQ", "3× daily", "#b22238"),
         ("qld", "QLD", "2× daily", "#00704a"),
         ("qqq", "QQQ", "Nasdaq-100", "#075ac8")]


def generate():
    dataset = json.loads((ROOT / "src/data/charts/tqqqQldQqqComparison.json").read_text())
    prices = pd.DataFrame(dataset["data"]).set_index("date")
    prices.index = pd.to_datetime(prices.index)
    if prices.index.has_duplicates or not prices.index.is_monotonic_increasing:
        raise ValueError("Comparison dates must be unique and sorted")
    if not np.isfinite(prices.to_numpy()).all() or (prices <= 0).any().any():
        raise ValueError("Comparison prices must be positive and finite")
    if prices.index[-1].date().isoformat() != dataset["through"]:
        raise ValueError("Comparison cutoff differs from its saved metadata")
    drawdowns = 100 * (prices / prices.cummax() - 1)
    stats = {}
    for key, ticker, _, _ in FUNDS:
        trough = drawdowns[key].idxmin()
        peak = prices[key].loc[:trough].idxmax()
        recovered = prices[key].loc[prices.index > trough]
        recovered = recovered[recovered >= prices.loc[peak, key]]
        recovery = recovered.index[0] if len(recovered) else None
        stats[ticker] = {"drawdown": float(drawdowns[key].min()),
                         "recovery_days": (recovery - trough).days if recovery is not None else None}

    navy, blue = "#10233f", "#075ac8"
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.weight": "bold",
                         "axes.labelweight": "bold", "text.color": navy, "font.size": 12})
    fig = plt.figure(figsize=(12, 6.3), dpi=100, facecolor="#f4f7fb")
    fig.text(.035, .938, "TNI", fontsize=24, color=blue, weight="bold")
    fig.text(.115, .945, "TRADINGNINVESTMENT", fontsize=12, weight="bold")
    fig.text(.965, .945, "NASDAQ-100 RESEARCH", ha="right", fontsize=12, weight="bold")
    fig.text(.035, .845, "TQQQ vs QLD vs QQQ", fontsize=33, weight="bold")
    fig.text(.035, .787, "Drawdowns & recovery times", fontsize=21, weight="bold")

    for index, (_, ticker, exposure, color) in enumerate(FUNDS):
        x = .035 + index * .317
        fig.add_artist(FancyBboxPatch((x, .506), .296, .231,
            boxstyle="round,pad=0.008,rounding_size=0.012", transform=fig.transFigure,
            facecolor="white", edgecolor="#9eb1c8", linewidth=1.3))
        fig.text(x + .015, .686, ticker, color=color, fontsize=20, weight="bold")
        fig.text(x + .278, .689, exposure, color=navy, fontsize=12, ha="right")
        fig.text(x + .015, .609, f"{stats[ticker]['drawdown']:.2f}%", color=color, fontsize=31, weight="bold")
        fig.text(x + .015, .568, "Maximum drawdown", color=navy, fontsize=12, weight="bold")
        days = stats[ticker]["recovery_days"]
        recovery = f"Low to recovery: {days:,} days" if days is not None else "Recovery ongoing"
        fig.text(x + .015, .524, recovery, color=navy, fontsize=12, weight="bold")

    fig.text(.035, .461, "DRAWDOWN FROM PREVIOUS PEAK · 2021–2024", fontsize=12, weight="bold")
    ax = fig.add_axes([.082, .176, .88, .253], facecolor="white")
    for key, _, _, color in FUNDS:
        cycle = drawdowns[key].loc["2021-01-01":"2024-12-31"]
        ax.plot(cycle.index, cycle, color=color, linewidth=2.7)
    ax.set_ylim(-90, 2)
    ax.set_yticks([0, -40, -80])
    ax.yaxis.set_major_formatter(PercentFormatter(100, decimals=0))
    ax.set_xlim(pd.Timestamp("2021-01-01"), pd.Timestamp("2024-12-31"))
    ax.xaxis.set_major_locator(mdates.YearLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
    ax.grid(axis="y", color="#b2c2d4", linewidth=.8)
    ax.tick_params(colors=navy, labelsize=12, length=0, pad=8)
    for spine in ax.spines.values():
        spine.set_visible(False)
    fig.text(.035, .091, f"Stats: {dataset['first_date']} to {dataset['through']} · Adjusted daily closes", fontsize=11, weight="bold")
    fig.text(.035, .043, "Source: Yahoo Finance · Recovery in calendar days", fontsize=11, weight="bold")
    fig.text(.965, .043, "TRADINGNINVESTMENT.COM", ha="right", fontsize=12, weight="bold")

    output = ROOT / "public/images/social/tqqq-qld-qqq-drawdown-recovery-og.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output, dpi=100, facecolor=fig.get_facecolor())
    plt.close(fig)
    with Image.open(output) as image:
        if image.size != (1200, 630):
            raise ValueError("Unexpected social card dimensions")
        image.resize((600, 315), Image.Resampling.LANCZOS).save(
            output.with_name("tqqq-qld-qqq-drawdown-recovery-thumbnail.webp"), "WEBP", quality=92)
    print(json.dumps(stats, indent=2))
    print("Created 1200×630 OG and 600×315 thumbnail through", dataset["through"])


if __name__ == "__main__":
    generate()
