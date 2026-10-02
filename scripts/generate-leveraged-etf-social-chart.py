import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import pandas as pd
import yfinance as yf

from tni_research_og import (
    TNI_RESEARCH_CHART_RECT,
    add_tni_research_header,
    add_tni_research_identity,
)

ROOT = Path(__file__).resolve().parents[1]

parser = argparse.ArgumentParser(
    description="Generate a branded TNI leveraged ETF social / OG chart."
)

parser.add_argument("--data", required=True)
parser.add_argument("--output", required=True)
parser.add_argument("--name", required=True)
parser.add_argument("--symbol", required=True)
parser.add_argument("--benchmark", required=True)
parser.add_argument("--benchmark-ticker", required=True)
parser.add_argument("--comparison-ticker", required=True)
parser.add_argument("--leverage", required=True)
parser.add_argument("--start", required=True)

args = parser.parse_args()

DATA = ROOT / args.data
OUTPUT = ROOT / args.output

# ------------------------------------------------------------
# LOAD GENERATED TNI RETURN DATA
# Used for identity / date-range metadata.
# ------------------------------------------------------------

with DATA.open() as f:
    dataset = json.load(f)

# ------------------------------------------------------------
# DOWNLOAD INVESTABLE COMPARISON SERIES
#
# Social chart:
#   leveraged ETF vs investable comparison ETF
#
# Example:
#   TQQQ vs QQQ
#
# Adjusted Close is used so distributions are incorporated.
# ------------------------------------------------------------

tickers = [
    args.symbol.replace(".", "-"),
    args.comparison_ticker,
]

history = yf.download(
    tickers,
    start=args.start,
    auto_adjust=False,
    progress=False,
)

if history.empty:
    raise RuntimeError("No market data returned for social comparison.")

adj = history["Adj Close"].copy()

if isinstance(adj, pd.Series):
    raise RuntimeError(
        "Expected two adjusted-close series for leveraged ETF comparison."
    )

asset_ticker = tickers[0]
comparison_ticker = args.comparison_ticker

if asset_ticker not in adj.columns:
    raise RuntimeError(f"Missing adjusted-close data for {asset_ticker}")

if comparison_ticker not in adj.columns:
    raise RuntimeError(
        f"Missing adjusted-close data for {comparison_ticker}"
    )

comparison = (
    adj[[asset_ticker, comparison_ticker]]
    .dropna()
    .copy()
)

if comparison.empty:
    raise RuntimeError(
        "No overlapping history found between leveraged ETF and comparison ETF."
    )

# ------------------------------------------------------------
# GROWTH OF $10,000
# Both series begin at exactly $10,000 on the first common date.
# ------------------------------------------------------------

growth = (
    comparison
    / comparison.iloc[0]
    * 10000.0
)

asset_growth = growth[asset_ticker]
comparison_growth = growth[comparison_ticker]

start_date = growth.index[0]
end_date = growth.index[-1]

range_label = (
    f"{start_date.year}–{end_date.year}"
)

asset_final = float(asset_growth.iloc[-1])
comparison_final = float(comparison_growth.iloc[-1])

# ------------------------------------------------------------
# TNI RESEARCH PALETTE
# ------------------------------------------------------------

navy = "#07152f"
text = "#172033"
muted = "#667085"
grid = "#e6ebf2"
background = "#ffffff"

asset_color = "#0868e8"
comparison_color = "#667085"

# ------------------------------------------------------------
# 1200 × 630 TNI RESEARCH CANVAS
# ------------------------------------------------------------

fig = plt.figure(
    figsize=(12, 6.3),
    dpi=100,
)

fig.patch.set_facecolor(background)

add_tni_research_identity(
    fig,
    navy=navy,
    muted=muted,
    background=background,
)

add_tni_research_header(
    fig,
    title=f"{args.symbol} Returns",
    subtitle=(
        f"Growth of $10,000 · "
        f"{args.symbol} vs {comparison_ticker}"
    ),
    descriptor=(
        f"{args.symbol} STOCK LEVERAGED ETF INTELLIGENCE"
    ),
    range_label=range_label,
    navy=navy,
    muted=muted,
    accent=asset_color,
)

# ------------------------------------------------------------
# HERO VISUALIZATION
# ------------------------------------------------------------

ax = fig.add_axes(
    TNI_RESEARCH_CHART_RECT
)

ax.set_facecolor(background)

ax.plot(
    growth.index,
    asset_growth,
    linewidth=2.8,
    color=asset_color,
    label=args.symbol,
)

ax.plot(
    growth.index,
    comparison_growth,
    linewidth=2.2,
    color=comparison_color,
    label=comparison_ticker,
)

ax.yaxis.grid(
    True,
    color=grid,
    linewidth=0.7,
    alpha=0.85,
)

ax.xaxis.grid(
    False
)

ax.set_axisbelow(True)

ax.tick_params(
    axis="x",
    labelsize=7.5,
    colors=muted,
    length=0,
    pad=5,
)

ax.tick_params(
    axis="y",
    labelsize=7.5,
    colors=muted,
    length=0,
)

ax.yaxis.set_major_formatter(
    FuncFormatter(
        lambda value, _:
            f"${value:,.0f}"
    )
)

for spine in ax.spines.values():
    spine.set_visible(False)

ax.set_ylim(
    bottom=0
)

# ------------------------------------------------------------
# CHART IDENTITY
# ------------------------------------------------------------

ax.text(
    0.0,
    1.018,
    "GROWTH OF $10,000 · TOTAL RETURN",
    transform=ax.transAxes,
    fontsize=6.5,
    fontweight="bold",
    color=muted,
    verticalalignment="bottom",
)

ax.text(
    1.0,
    1.018,
    (
        f"{args.symbol} · {args.leverage.upper().replace('X', '×')} DAILY {args.benchmark.upper()} EXPOSURE"
    ),
    transform=ax.transAxes,
    fontsize=6.3,
    color=muted,
    horizontalalignment="right",
    verticalalignment="bottom",
)

# ------------------------------------------------------------
# ENDPOINT VALUES
# Make the real TQQQ vs QQQ difference visible on the OG image.
# ------------------------------------------------------------

ax.annotate(
    f"{args.symbol}  ${asset_final:,.0f}",
    xy=(end_date, asset_final),
    xytext=(-12, 0),
    textcoords="offset points",
    fontsize=8,
    fontweight="bold",
    color=asset_color,
    verticalalignment="center",
    horizontalalignment="right",
)

ax.annotate(
    f"{comparison_ticker}  ${comparison_final:,.0f}",
    xy=(end_date, comparison_final),
    xytext=(-12, 0),
    textcoords="offset points",
    fontsize=8,
    fontweight="bold",
    color=comparison_color,
    verticalalignment="center",
    horizontalalignment="right",
)

legend = ax.legend(
    loc="upper left",
    frameon=False,
    fontsize=8,
    ncol=2,
)

for line in legend.get_lines():
    line.set_linewidth(3)

# ------------------------------------------------------------
# OUTPUT
# ------------------------------------------------------------

OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True,
)

plt.savefig(
    OUTPUT,
    dpi=100,
    facecolor=background,
    bbox_inches=None,
)

plt.close()

print(f"Created: {OUTPUT}")
print("Size: 1200 x 630")
print("TNI Leveraged ETF Research canvas: PASS")
print(
    f"Comparison: {args.symbol} vs {comparison_ticker}"
)
print(
    f"Underlying benchmark: "
    f"{args.benchmark} ({args.benchmark_ticker})"
)
print(
    f"Common range: "
    f"{start_date.date()} to {end_date.date()}"
)
print(
    f"{args.symbol} $10,000 ending value: "
    f"${asset_final:,.2f}"
)
print(
    f"{comparison_ticker} $10,000 ending value: "
    f"${comparison_final:,.2f}"
)
