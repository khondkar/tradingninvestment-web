import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap, Normalize
from matplotlib.ticker import FuncFormatter

from tni_research_og import (
    TNI_RESEARCH_CHART_RECT,
    add_tni_research_header,
    add_tni_research_identity,
)

ROOT = Path(__file__).resolve().parents[1]

DATA = (
    ROOT
    / "src/data/sp500-historical-return-methods.json"
)

OUTPUT = (
    ROOT
    / "public/images/social/average-stock-market-return-og.png"
)

with DATA.open() as f:
    dataset = json.load(f)

rows = [
    row
    for row in dataset["data"]
    if row.get("total_return") is not None
]

rows.sort(key=lambda row: int(row["year"]))

if not rows:
    raise RuntimeError(
        "No total-return observations found."
    )

years = [
    int(row["year"])
    for row in rows
]

returns = [
    float(row["total_return"])
    for row in rows
]

start_year = years[0]
end_year = years[-1]

latest_row = rows[-1]
latest_is_ytd = bool(
    latest_row.get("is_ytd", False)
)

range_label = (
    f"{start_year}–{end_year}"
    + (" YTD" if latest_is_ytd else "")
)

# ------------------------------------------------------------
# COMPLETED-YEAR STATISTICS
#
# YTD is displayed in the chart but excluded from historical
# full-year statistics when the latest observation is partial.
# ------------------------------------------------------------

completed_rows = [
    row
    for row in rows
    if not row.get("is_ytd", False)
]

completed_returns = [
    float(row["total_return"])
    for row in completed_rows
]

average_return = (
    sum(completed_returns)
    / len(completed_returns)
)

best_row = max(
    completed_rows,
    key=lambda row: float(row["total_return"]),
)

worst_row = min(
    completed_rows,
    key=lambda row: float(row["total_return"]),
)

positive_count = sum(
    1
    for row in completed_rows
    if float(row["total_return"]) > 0
)

positive_pct = (
    positive_count
    / len(completed_rows)
    * 100
)

best_year = int(best_row["year"])
best_return = float(best_row["total_return"])

worst_year = int(worst_row["year"])
worst_return = float(worst_row["total_return"])

best_index = years.index(best_year)

# ------------------------------------------------------------
# TNI RESEARCH PALETTE
# ------------------------------------------------------------

navy = "#07152f"
text = "#172033"
muted = "#667085"
grid = "#e6ebf2"
background = "#ffffff"

negative_dark = "#c91d25"
negative_light = "#ff8d8d"

positive_light = "#8dc3ff"
positive_dark = "#0868e8"

# ------------------------------------------------------------
# RETURN-INTENSITY COLORS
#
# Larger positive returns become darker blue.
# Larger negative returns become darker red.
# ------------------------------------------------------------

positive_values = [
    value
    for value in returns
    if value >= 0
]

negative_values = [
    abs(value)
    for value in returns
    if value < 0
]

positive_max = max(
    positive_values,
    default=1,
)

negative_max = max(
    negative_values,
    default=1,
)

positive_cmap = LinearSegmentedColormap.from_list(
    "tni_positive",
    [
        positive_light,
        positive_dark,
    ],
)

negative_cmap = LinearSegmentedColormap.from_list(
    "tni_negative",
    [
        negative_light,
        negative_dark,
    ],
)

positive_norm = Normalize(
    vmin=0,
    vmax=positive_max,
)

negative_norm = Normalize(
    vmin=0,
    vmax=negative_max,
)

colors = []

for value in returns:
    if value >= 0:
        colors.append(
            positive_cmap(
                positive_norm(value)
            )
        )
    else:
        colors.append(
            negative_cmap(
                negative_norm(abs(value))
            )
        )

# ------------------------------------------------------------
# 1200 × 630 OPEN GRAPH CANVAS
# ------------------------------------------------------------
# ------------------------------------------------------------
# 1200 × 630 TNI RESEARCH CANVAS
#
# DESIGN SYSTEM
# 70% — original research visualization
# 20% — research title / context
# 10% — TNI identity
#
# The visualization is the hero. Branding identifies the work
# without competing with the research itself.
# ------------------------------------------------------------

fig = plt.figure(
    figsize=(12, 6.3),
    dpi=100,
)

fig.patch.set_facecolor(background)

# ------------------------------------------------------------
# SHARED TNI RESEARCH IDENTITY + ARTICLE-SPECIFIC HEADER
# ------------------------------------------------------------

add_tni_research_identity(
    fig,
    navy=navy,
    muted=muted,
    background=background,
)

add_tni_research_header(
    fig,
    title="Average Stock Market Return",
    subtitle="150+ Years of U.S. Market Returns",
    descriptor=(
        "P R I C E   ·   D I V I D E N D S   ·   "
        "I N F L A T I O N   ·   R E A L   R E T U R N S"
    ),
    range_label=range_label,
    navy=navy,
    muted=muted,
    accent="#0868a8",
)

# ------------------------------------------------------------
# HERO RESEARCH VISUALIZATION
#
# The graph deliberately occupies most of the canvas.
# ------------------------------------------------------------

ax = fig.add_axes(
    TNI_RESEARCH_CHART_RECT
)

ax.set_facecolor(background)

positions = list(range(len(years)))

ax.bar(
    positions,
    returns,
    color=colors,
    width=0.86,
    linewidth=0,
)

ax.axhline(
    0,
    color=navy,
    linewidth=1.0,
)

ax.yaxis.grid(
    True,
    color=grid,
    linewidth=0.7,
    alpha=0.85,
)

ax.set_axisbelow(True)

# ------------------------------------------------------------
# DYNAMIC YEAR LABELS
# ------------------------------------------------------------

target_tick_count = 12

tick_step = max(
    1,
    len(years) // target_tick_count,
)

tick_positions = list(
    range(
        0,
        len(years),
        tick_step,
    )
)

if (
    len(years) - 1
    not in tick_positions
):
    tick_positions.append(
        len(years) - 1
    )

ax.set_xticks(tick_positions)

ax.set_xticklabels(
    [
        str(years[index])
        for index in tick_positions
    ],
    fontsize=7.5,
    color=muted,
)

ax.tick_params(
    axis="x",
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
            f"{value:.0f}%"
    )
)

for spine in ax.spines.values():
    spine.set_visible(False)

# Give the visualization a little breathing room while
# preserving the complete observed return range.

return_min = min(returns)
return_max = max(returns)

lower_padding = max(
    5.0,
    abs(return_min) * 0.08,
)

upper_padding = max(
    5.0,
    abs(return_max) * 0.08,
)

ax.set_ylim(
    return_min - lower_padding,
    return_max + upper_padding,
)

# ------------------------------------------------------------
# SMALL CHART IDENTITY
# ------------------------------------------------------------

ax.text(
    0.0,
    1.018,
    "ANNUAL TOTAL RETURN · DIVIDENDS REINVESTED",
    transform=ax.transAxes,
    fontsize=6.5,
    fontweight="bold",
    color=muted,
    verticalalignment="bottom",
)

ax.text(
    1.0,
    1.018,
    "BLUE = POSITIVE   ·   RED = NEGATIVE",
    transform=ax.transAxes,
    fontsize=6.3,
    color=muted,
    horizontalalignment="right",
    verticalalignment="bottom",
)

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
print("TNI Research canvas: PASS")
print(f"Observations displayed: {len(rows)}")
print(f"Completed years in statistics: {len(completed_rows)}")
print(f"Range: {range_label}")
print(f"Average total return: {average_return:.4f}%")
print(f"Best: {best_year} {best_return:+.4f}%")
print(f"Worst: {worst_year} {worst_return:+.4f}%")
print(
    f"Positive years: {positive_count}/"
    f"{len(completed_rows)} "
    f"({positive_pct:.2f}%)"
)
