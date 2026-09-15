import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data/charts/msftAnnualReturns.json"
OUTPUT = ROOT / "public/images/msft-annual-stock-returns.png"

with DATA.open() as f:
    dataset = json.load(f)

rows = list(dataset["data"])

# Add current YTD observation if it is stored separately.
current = dataset.get("current_year")
if current and not any(row["year"] == current["year"] for row in rows):
    rows.append({
        "year": current["year"],
        "value": current["return_pct"],
        "label": current["label"],
        "status": (
            "positive"
            if current["return_pct"] >= 0
            else "negative"
        ),
    })

rows.sort(key=lambda x: x["year"])

years = [r["year"] for r in rows]
returns = [r["value"] for r in rows]

# TNI light research palette
positive = "#1677ff"
negative = "#d94b4b"
text = "#172033"
muted = "#667085"
grid = "#e9edf3"
background = "#ffffff"

colors = [
    positive if value >= 0 else negative
    for value in returns
]

# 1200 x 630 at 100 DPI
fig, ax = plt.subplots(figsize=(12, 6.3), dpi=100)
fig.patch.set_facecolor(background)
ax.set_facecolor(background)

ax.bar(
    range(len(years)),
    returns,
    color=colors,
    width=0.72,
)

ax.axhline(
    0,
    color=text,
    linewidth=0.8,
)

ax.yaxis.grid(
    True,
    color=grid,
    linewidth=0.8,
)

ax.set_axisbelow(True)

# Keep year labels readable.
tick_positions = list(range(0, len(years), 3))

if (len(years) - 1) not in tick_positions:
    tick_positions.append(len(years) - 1)

ax.set_xticks(tick_positions)
ax.set_xticklabels(
    [str(years[i]) for i in tick_positions],
    fontsize=8,
    color=muted,
)

ax.tick_params(
    axis="y",
    labelsize=8,
    colors=muted,
    length=0,
)

ax.tick_params(
    axis="x",
    length=0,
)

ax.yaxis.set_major_formatter(
    FuncFormatter(lambda x, _: f"{x:.0f}%")
)

for spine in ax.spines.values():
    spine.set_visible(False)

# Main title
fig.text(
    0.07,
    0.925,
    "Microsoft (MSFT) Annual Stock Returns by Year",
    fontsize=22,
    fontweight="bold",
    color=text,
)

# Subtitle
fig.text(
    0.07,
    0.875,
    "Historical Annual Price Returns | 1987–2026 YTD",
    fontsize=11,
    color=muted,
)

# Brand
fig.text(
    0.93,
    0.925,
    "TRADINGNINVESTMENT",
    fontsize=9,
    fontweight="bold",
    color=text,
    horizontalalignment="right",
)

# Source / methodology footer
fig.text(
    0.07,
    0.045,
    "Price returns • Dividends excluded • Source: Yahoo Finance",
    fontsize=8,
    color=muted,
)

fig.text(
    0.93,
    0.045,
    "tradingninvestment.com",
    fontsize=8,
    color=muted,
    horizontalalignment="right",
)

plt.subplots_adjust(
    left=0.07,
    right=0.97,
    top=0.81,
    bottom=0.14,
)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)

plt.savefig(
    OUTPUT,
    dpi=100,
    facecolor=background,
    bbox_inches=None,
)

plt.close()

print(f"Created: {OUTPUT}")
print("Size: 1200 x 630")
print(f"Observations: {len(rows)}")
print(f"Range: {years[0]}–{years[-1]}")
