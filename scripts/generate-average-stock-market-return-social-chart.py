import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap, Normalize
from matplotlib.ticker import FuncFormatter

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

fig = plt.figure(
    figsize=(12, 6.3),
    dpi=100,
)

fig.patch.set_facecolor(background)

# Main chart occupies lower portion.
ax = fig.add_axes(
    [0.065, 0.145, 0.91, 0.47]
)

ax.set_facecolor(background)

positions = list(range(len(years)))

ax.bar(
    positions,
    returns,
    color=colors,
    width=0.82,
    linewidth=0,
)

ax.axhline(
    0,
    color=text,
    linewidth=0.9,
)

ax.yaxis.grid(
    True,
    color=grid,
    linewidth=0.8,
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
    fontsize=8,
    color=muted,
)

ax.tick_params(
    axis="x",
    length=0,
    pad=5,
)

ax.tick_params(
    axis="y",
    labelsize=8,
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

# ------------------------------------------------------------
# BEST-YEAR HIGHLIGHT / STATIC TOOLTIP
# ------------------------------------------------------------

ax.scatter(
    [best_index],
    [best_return],
    s=48,
    facecolors="white",
    edgecolors=positive_dark,
    linewidths=2,
    zorder=5,
)

tooltip_text = (
    f"{best_year}\n"
    f"Total Return: {best_return:+.1f}%\n"
    "Dividends Reinvested"
)

ax.annotate(
    tooltip_text,
    xy=(best_index, best_return),
    xytext=(32, -8),
    textcoords="offset points",
    fontsize=8.5,
    color="white",
    fontweight="bold",
    linespacing=1.35,
    bbox={
        "boxstyle": "round,pad=0.65",
        "fc": navy,
        "ec": navy,
    },
    arrowprops={
        "arrowstyle": "-|>",
        "color": navy,
        "lw": 1.2,
    },
    zorder=6,
)

# ------------------------------------------------------------
# TITLE
# ------------------------------------------------------------

fig.text(
    0.065,
    0.935,
    "Average Stock Market Return",
    fontsize=25,
    fontweight="bold",
    color=navy,
)

fig.text(
    0.065,
    0.882,
    (
        "Historical Total Returns by Year"
        " · Dividends Reinvested"
        f" · {range_label}"
    ),
    fontsize=11.5,
    color=muted,
)

# ------------------------------------------------------------
# BRAND
# ------------------------------------------------------------

fig.text(
    0.965,
    0.935,
    "TRADINGNINVESTMENT",
    fontsize=9,
    fontweight="bold",
    color=navy,
    horizontalalignment="right",
)

# ------------------------------------------------------------
# COLOR LEGEND
# ------------------------------------------------------------

legend_ax = fig.add_axes(
    [0.065, 0.705, 0.39, 0.055]
)

gradient = [
    [
        -1.0 + (2.0 * i / 255)
        for i in range(256)
    ]
]

legend_cmap = LinearSegmentedColormap.from_list(
    "tni_return_scale",
    [
        negative_dark,
        negative_light,
        "#f4f6f9",
        positive_light,
        positive_dark,
    ],
)

legend_ax.imshow(
    gradient,
    aspect="auto",
    cmap=legend_cmap,
    extent=[-40, 50, 0, 1],
)

legend_ax.set_yticks([])

legend_ax.set_xticks(
    [-40, -20, 0, 20, 40, 50]
)

legend_ax.set_xticklabels(
    [
        "≤ -40%",
        "-20%",
        "0%",
        "20%",
        "40%",
        "≥ 50%",
    ],
    fontsize=7.5,
    color=muted,
)

for spine in legend_ax.spines.values():
    spine.set_visible(False)

fig.text(
    0.065,
    0.775,
    "BAR COLOR SHOWS ANNUAL TOTAL RETURN",
    fontsize=7.5,
    fontweight="bold",
    color=muted,
)

# ------------------------------------------------------------
# STATISTICS CARD
# ------------------------------------------------------------

card_x = 0.515
card_y = 0.682
card_w = 0.45
card_h = 0.12

card = plt.Rectangle(
    (card_x, card_y),
    card_w,
    card_h,
    transform=fig.transFigure,
    facecolor="#f6f8fb",
    edgecolor="#e6ebf2",
    linewidth=1,
)

fig.patches.append(card)

column_width = card_w / 4

stats = [
    (
        "AVERAGE",
        f"{average_return:.1f}%",
        "per year",
        text,
    ),
    (
        "BEST YEAR",
        f"{best_return:+.1f}%",
        str(best_year),
        positive_dark,
    ),
    (
        "WORST YEAR",
        f"{worst_return:+.1f}%",
        str(worst_year),
        negative_dark,
    ),
    (
        "POSITIVE YEARS",
        f"{positive_pct:.0f}%",
        (
            f"{positive_count}"
            f" of {len(completed_rows)}"
        ),
        text,
    ),
]

for index, (
    label,
    value,
    detail,
    value_color,
) in enumerate(stats):
    x = (
        card_x
        + column_width * index
        + column_width / 2
    )

    fig.text(
        x,
        card_y + 0.088,
        label,
        fontsize=6.8,
        fontweight="bold",
        color=muted,
        horizontalalignment="center",
    )

    fig.text(
        x,
        card_y + 0.047,
        value,
        fontsize=15,
        fontweight="bold",
        color=value_color,
        horizontalalignment="center",
    )

    fig.text(
        x,
        card_y + 0.015,
        detail,
        fontsize=6.8,
        color=muted,
        horizontalalignment="center",
    )

    if index < 3:
        divider_x = (
            card_x
            + column_width * (index + 1)
        )

        fig.lines.append(
            plt.Line2D(
                [divider_x, divider_x],
                [
                    card_y + 0.015,
                    card_y + card_h - 0.015,
                ],
                transform=fig.transFigure,
                color="#dce2ea",
                linewidth=0.8,
            )
        )

# ------------------------------------------------------------
# FOOTER
# ------------------------------------------------------------

fig.text(
    0.065,
    0.055,
    (
        "Total return"
        " • Dividends reinvested"
        " • Historical U.S. equity / S&P 500 research"
    ),
    fontsize=7.5,
    color=muted,
)

fig.text(
    0.965,
    0.055,
    "tradingninvestment.com",
    fontsize=7.5,
    color=muted,
    horizontalalignment="right",
)

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
