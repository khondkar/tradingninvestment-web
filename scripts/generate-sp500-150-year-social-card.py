from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json
import math

# ============================================================
# TNI — 154 YEARS OF U.S. STOCK MARKET HISTORY
# REAL DATA ONLY
#
# Source:
# src/data/sp500-historical-return-methods.json
#
# Uses completed calendar years only: 1872–2025.
# Wealth path compounds annual TOTAL RETURN with dividends.
# ============================================================

W, H = 1200, 630

DATA_FILE = Path("src/data/sp500-historical-return-methods.json")
OUT = Path("public/images/social/sp500-150-year-compounding.png")
OUT.parent.mkdir(parents=True, exist_ok=True)

STARTING_WEALTH = 10_000.0

# ------------------------------------------------------------
# LOAD REAL TNI DATA
# ------------------------------------------------------------

payload = json.loads(DATA_FILE.read_text())

rows = [
    row for row in payload["data"]
    if not row.get("is_ytd", False)
    and row.get("total_return") is not None
]

rows = sorted(rows, key=lambda r: int(r["year"]))

if not rows:
    raise RuntimeError("No completed annual total-return observations found.")

start_year = int(rows[0]["year"])
end_year = int(rows[-1]["year"])

# ------------------------------------------------------------
# COMPOUND ACTUAL TOTAL RETURNS
# ------------------------------------------------------------

wealth = STARTING_WEALTH
series = [(start_year - 1, wealth)]

for row in rows:
    r = float(row["total_return"]) / 100.0
    wealth *= (1.0 + r)

    if wealth <= 0:
        raise RuntimeError(
            f"Wealth became non-positive in {row['year']}; "
            "cannot plot logarithmically."
        )

    series.append((int(row["year"]), wealth))

ending_wealth = wealth
completed_years = len(rows)

cagr = (
    (ending_wealth / STARTING_WEALTH) ** (1 / completed_years) - 1
) * 100

# ------------------------------------------------------------
# FORMATTERS
# ------------------------------------------------------------

def money_short(value):
    if value >= 1_000_000_000:
        return f"${value / 1_000_000_000:.2f} BILLION"
    if value >= 1_000_000:
        return f"${value / 1_000_000:.1f} MILLION"
    if value >= 1_000:
        return f"${value / 1_000:.1f}K"
    return f"${value:,.0f}"

ending_label = money_short(ending_wealth)

# ------------------------------------------------------------
# COLORS
# ------------------------------------------------------------

BG = "#05070B"
WHITE = "#FFFFFF"
MUTED = "#8F9AAA"
GREEN = "#39FF88"
YELLOW = "#FFD84D"
BLUE = "#5EA8FF"
GRID = "#1A202A"
GRID_MAJOR = "#29313D"
RED = "#FF5A67"

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# ------------------------------------------------------------
# FONTS
# ------------------------------------------------------------

bold_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
]

regular_candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
]

def find_font(candidates):
    for p in candidates:
        if Path(p).exists():
            return p
    raise FileNotFoundError("Could not find required system font.")

BOLD = find_font(bold_candidates)
REGULAR = find_font(regular_candidates)

eyebrow_font = ImageFont.truetype(BOLD, 21)
title_font = ImageFont.truetype(BOLD, 43)
start_font = ImageFont.truetype(BOLD, 37)
arrow_font = ImageFont.truetype(BOLD, 38)
billion_font = ImageFont.truetype(BOLD, 67)
metric_font = ImageFont.truetype(BOLD, 19)
small_font = ImageFont.truetype(REGULAR, 17)
tiny_font = ImageFont.truetype(REGULAR, 14)
brand_font = ImageFont.truetype(BOLD, 18)

# ------------------------------------------------------------
# BACKGROUND GRID
# ------------------------------------------------------------

for x in range(0, W, 80):
    draw.line((x, 0, x, H), fill=GRID, width=1)

for y in range(0, H, 70):
    draw.line((0, y, W, y), fill=GRID, width=1)

# Top accent
draw.rectangle((0, 0, W, 8), fill=GREEN)

# ------------------------------------------------------------
# HEADER
# ------------------------------------------------------------

draw.text(
    (62, 39),
    "TNI  •  LONG-TERM MARKET RESEARCH",
    font=eyebrow_font,
    fill=GREEN,
)

# badge
badge = "REAL DATA"
badge_font = ImageFont.truetype(BOLD, 17)
bbox = draw.textbbox((0, 0), badge, font=badge_font)
badge_w = bbox[2] - bbox[0]

draw.rounded_rectangle(
    (W - badge_w - 104, 34, W - 58, 72),
    radius=9,
    fill=BLUE,
)

draw.text(
    (W - badge_w - 81, 43),
    badge,
    font=badge_font,
    fill=BG,
)

# ------------------------------------------------------------
# TITLE
# ------------------------------------------------------------

draw.text(
    (62, 88),
    f"{completed_years} YEARS OF",
    font=title_font,
    fill=WHITE,
)

draw.text(
    (62, 137),
    "U.S. STOCK MARKET HISTORY",
    font=title_font,
    fill=WHITE,
)

# ------------------------------------------------------------
# HERO NUMBER
# ------------------------------------------------------------

draw.text(
    (62, 205),
    "$10,000",
    font=start_font,
    fill=WHITE,
)

draw.text(
    (220, 202),
    "→",
    font=arrow_font,
    fill=YELLOW,
)

draw.text(
    (292, 181),
    ending_label,
    font=billion_font,
    fill=GREEN,
)

# ------------------------------------------------------------
# METRICS
# ------------------------------------------------------------

metric_y = 272

draw.text(
    (64, metric_y),
    f"{start_year}–{end_year}",
    font=metric_font,
    fill=WHITE,
)

draw.text(
    (205, metric_y),
    "•",
    font=metric_font,
    fill=MUTED,
)

draw.text(
    (230, metric_y),
    f"{cagr:.2f}% annualized total return",
    font=metric_font,
    fill=WHITE,
)

draw.text(
    (510, metric_y),
    "•",
    font=metric_font,
    fill=MUTED,
)

draw.text(
    (535, metric_y),
    "Dividends reinvested",
    font=metric_font,
    fill=WHITE,
)

# ------------------------------------------------------------
# REAL WEALTH CHART
# LOG SCALE — necessary to make 154 years readable
# ------------------------------------------------------------

chart_left = 64
chart_right = 1137
chart_top = 326
chart_bottom = 515

plot_w = chart_right - chart_left
plot_h = chart_bottom - chart_top

years = [p[0] for p in series]
values = [p[1] for p in series]

min_year = years[0]
max_year = years[-1]

log_values = [math.log10(v) for v in values]
log_min = math.floor(min(log_values))
log_max = math.ceil(max(log_values))

def x_for_year(year):
    return chart_left + (
        (year - min_year) / (max_year - min_year)
    ) * plot_w

def y_for_value(value):
    lv = math.log10(value)
    return chart_bottom - (
        (lv - log_min) / (log_max - log_min)
    ) * plot_h

# ------------------------------------------------------------
# Y GRID / LOG WEALTH LEVELS
# ------------------------------------------------------------

wealth_levels = [
    10_000,
    100_000,
    1_000_000,
    10_000_000,
    100_000_000,
    1_000_000_000,
]

for level in wealth_levels:
    if level < min(values) or level > max(values):
        continue

    y = y_for_value(level)

    draw.line(
        (chart_left, y, chart_right, y),
        fill=GRID_MAJOR,
        width=1,
    )

    if level >= 1_000_000_000:
        label = "$1B"
    elif level >= 1_000_000:
        label = f"${int(level / 1_000_000)}M"
    elif level >= 1_000:
        label = f"${int(level / 1_000)}K"
    else:
        label = f"${level:,.0f}"

    draw.text(
        (chart_right - 45, y - 18),
        label,
        font=tiny_font,
        fill=MUTED,
    )

# ------------------------------------------------------------
# HISTORICAL YEAR GUIDES
# ------------------------------------------------------------

marker_years = [1872, 1900, 1929, 1974, 2000, 2008, 2020, 2025]

for year in marker_years:
    if year < min_year or year > max_year:
        continue

    x = x_for_year(year)

    draw.line(
        (x, chart_top, x, chart_bottom),
        fill=GRID_MAJOR,
        width=1,
    )

    label = str(year)

    bbox = draw.textbbox((0, 0), label, font=tiny_font)
    tw = bbox[2] - bbox[0]

    draw.text(
        (x - tw / 2, chart_bottom + 8),
        label,
        font=tiny_font,
        fill=MUTED,
    )

# ------------------------------------------------------------
# REAL DATA LINE
# ------------------------------------------------------------

points = [
    (x_for_year(year), y_for_value(value))
    for year, value in series
]

# subtle under-line shadow for contrast
shadow_points = [(x, y + 2) for x, y in points]
draw.line(shadow_points, fill="#0D6B42", width=8, joint="curve")

# actual total-return wealth path
draw.line(points, fill=GREEN, width=5, joint="curve")

# ------------------------------------------------------------
# START / END POINTS
# ------------------------------------------------------------

sx, sy = points[0]
ex, ey = points[-1]

draw.ellipse(
    (sx - 5, sy - 5, sx + 5, sy + 5),
    fill=YELLOW,
)

draw.ellipse(
    (ex - 7, ey - 7, ex + 7, ey + 7),
    fill=GREEN,
)

# ------------------------------------------------------------
# MAJOR MARKET EVENT MARKERS
# Mark years without inventing event values.
# Their y-position comes from the real wealth series.
# ------------------------------------------------------------

wealth_by_year = dict(series)

events = [
    (1929, "1929"),
    (2000, "2000"),
    (2008, "2008"),
    (2020, "2020"),
]

for year, label in events:
    if year not in wealth_by_year:
        continue

    x = x_for_year(year)
    y = y_for_value(wealth_by_year[year])

    draw.ellipse(
        (x - 4, y - 4, x + 4, y + 4),
        fill=RED,
    )

# ------------------------------------------------------------
# CHART LABEL
# ------------------------------------------------------------

draw.text(
    (65, 303),
    "GROWTH OF $10,000  •  TOTAL RETURN  •  LOG SCALE",
    font=small_font,
    fill=MUTED,
)

# ------------------------------------------------------------
# FOOTER
# ------------------------------------------------------------

footer_y = 567

draw.text(
    (62, footer_y),
    "TRADINGNINVESTMENT",
    font=brand_font,
    fill=WHITE,
)

draw.text(
    (62, footer_y + 27),
    "Historical data • Quantitative research • Market intelligence",
    font=tiny_font,
    fill=MUTED,
)

source = "Source: Robert Shiller / Yale + modern S&P 500 index data • TNI calculations"

bbox = draw.textbbox((0, 0), source, font=tiny_font)
source_w = bbox[2] - bbox[0]

draw.text(
    (W - source_w - 62, footer_y + 27),
    source,
    font=tiny_font,
    fill=MUTED,
)

# ------------------------------------------------------------
# SAVE
# ------------------------------------------------------------

img.save(OUT, quality=96)

print()
print("TNI REAL-DATA SOCIAL CARD")
print("=" * 55)
print(f"Dataset:          {DATA_FILE}")
print(f"Completed years:  {completed_years}")
print(f"Period:           {start_year}-{end_year}")
print(f"Starting wealth:  ${STARTING_WEALTH:,.2f}")
print(f"Ending wealth:    ${ending_wealth:,.2f}")
print(f"Annualized:       {cagr:.4f}%")
print(f"Output:           {OUT}")
print(f"Image size:       {W}x{H}")
print("=" * 55)
