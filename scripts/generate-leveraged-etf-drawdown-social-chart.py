import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.ticker import FuncFormatter

from tni_research_og import (
    TNI_RESEARCH_CHART_RECT,
    add_tni_research_header,
    add_tni_research_identity,
)

ROOT = Path(__file__).resolve().parents[1]

parser = argparse.ArgumentParser(
    description="Generate a TNI leveraged ETF drawdown social / OG chart."
)

parser.add_argument("--data", required=True)
parser.add_argument("--output", required=True)
parser.add_argument("--symbol", required=True)
parser.add_argument("--benchmark", required=True)
parser.add_argument("--leverage", required=True)

args = parser.parse_args()

DATA = ROOT / args.data
OUTPUT = ROOT / args.output

with DATA.open() as f:
    dataset = json.load(f)

rows = dataset["data"]
asset_summary = dataset["asset_summary"]
benchmark_summary = dataset["benchmark_summary"]

df = pd.DataFrame(rows)
df["date"] = pd.to_datetime(df["date"])

asset_col = "asset_drawdown_pct"
benchmark_col = "benchmark_drawdown_pct"

start_date = df["date"].iloc[0]
end_date = df["date"].iloc[-1]

range_label = f"{start_date.year}–{end_date.year}"

# TNI research palette
navy = "#07152f"
text = "#172033"
muted = "#667085"
grid = "#e6ebf2"
background = "#ffffff"

asset_color = "#0868e8"
benchmark_color = "#667085"

fig = plt.figure(figsize=(12, 6.3), dpi=100)
fig.patch.set_facecolor(background)

add_tni_research_identity(
    fig,
    navy=navy,
    muted=muted,
    background=background,
)

add_tni_research_header(
    fig,
    title=f"{args.symbol} vs {args.benchmark} Drawdowns",
    subtitle=(
        f"Historical drawdown from prior peak · "
        f"{args.leverage.replace('x', '×').replace('X', '×')} daily exposure"
    ),
    descriptor=f"{args.symbol} STOCK LEVERAGED ETF INTELLIGENCE",
    range_label=range_label,
    navy=navy,
    muted=muted,
    accent=asset_color,
)

ax = fig.add_axes(TNI_RESEARCH_CHART_RECT)
ax.set_facecolor(background)

ax.plot(
    df["date"],
    df[asset_col],
    linewidth=2.8,
    color=asset_color,
    label=args.symbol,
)

ax.plot(
    df["date"],
    df[benchmark_col],
    linewidth=2.2,
    color=benchmark_color,
    label=args.benchmark,
)

ax.axhline(
    0,
    linewidth=0.8,
    color=grid,
)

ax.yaxis.grid(
    True,
    color=grid,
    linewidth=0.7,
    alpha=0.85,
)

ax.xaxis.grid(False)
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
    FuncFormatter(lambda value, _: f"{value:.0f}%")
)

for spine in ax.spines.values():
    spine.set_visible(False)

lowest = min(
    float(df[asset_col].min()),
    float(df[benchmark_col].min()),
)

ax.set_ylim(
    bottom=min(-10, lowest * 1.12),
    top=3,
)

ax.text(
    0.0,
    1.018,
    "DRAWDOWN FROM PRIOR PEAK",
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
        f"MAX DRAWDOWN · "
        f"{args.symbol} {asset_summary['max_drawdown_pct']:.1f}%  ·  "
        f"{args.benchmark} {benchmark_summary['max_drawdown_pct']:.1f}%"
    ),
    transform=ax.transAxes,
    fontsize=6.5,
    fontweight="bold",
    color=muted,
    horizontalalignment="right",
    verticalalignment="bottom",
)

legend = ax.legend(
    loc="lower left",
    frameon=False,
    fontsize=8,
    ncol=2,
)

for line in legend.get_lines():
    line.set_linewidth(3)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)

plt.savefig(
    OUTPUT,
    dpi=100,
    facecolor=background,
)

plt.close(fig)

print(f"Generated: {OUTPUT}")
print(
    f"{args.symbol} max drawdown: "
    f"{asset_summary['max_drawdown_pct']:.2f}%"
)
print(
    f"{args.benchmark} max drawdown: "
    f"{benchmark_summary['max_drawdown_pct']:.2f}%"
)
