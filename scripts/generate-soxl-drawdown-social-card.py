import json
from pathlib import Path
from datetime import datetime

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "src/data/charts/soxlVsSmhDrawdowns.json"
OUT_PATH = ROOT / "public/images/social/soxl-vs-smh-drawdown.png"

W, H = 1200, 630

with DATA_PATH.open() as f:
    dataset = json.load(f)

rows = dataset["data"]
asset = dataset["asset"]
benchmark = dataset["benchmark"]
asset_summary = dataset["asset_summary"]
benchmark_summary = dataset["benchmark_summary"]

dates = [datetime.fromisoformat(r["date"]) for r in rows]
asset_dd = [float(r["asset_drawdown_pct"]) for r in rows]
benchmark_dd = [float(r["benchmark_drawdown_pct"]) for r in rows]

# ---------- Colors ----------
BG = (247, 250, 253)
NAVY = (10, 31, 60)
MUTED = (91, 108, 128)
GRID = (215, 224, 234)
BLUE = (26, 111, 214)
RED = (211, 55, 67)
WHITE = (255, 255, 255)
CARD = (255, 255, 255)

# ---------- Fonts ----------
def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold else
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"
        if bold else
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

F_EYEBROW = font(19, True)
F_TITLE = font(40, True)
F_SUB = font(20)
F_BIG = font(34, True)
F_LABEL = font(16, True)
F_AXIS = font(14)
F_FOOT = font(14)

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# ---------- Header ----------
draw.text(
    (65, 38),
    "TNI MARKET INTELLIGENCE",
    fill=BLUE,
    font=F_EYEBROW,
)

draw.text(
    (65, 72),
    "SOXL vs. SMH — Historical Drawdowns",
    fill=NAVY,
    font=F_TITLE,
)

draw.text(
    (65, 124),
    "How 3× semiconductor exposure changes downside risk",
    fill=MUTED,
    font=F_SUB,
)

# ---------- Metric cards ----------
card_y = 165
card_h = 78
card_w = 240

def metric_card(x, ticker, value, color):
    draw.rounded_rectangle(
        (x, card_y, x + card_w, card_y + card_h),
        radius=14,
        fill=CARD,
        outline=GRID,
        width=1,
    )
    draw.text((x + 18, card_y + 13), f"{ticker} MAX DRAWDOWN",
              fill=MUTED, font=F_LABEL)
    draw.text((x + 18, card_y + 35), value,
              fill=color, font=F_BIG)

metric_card(
    65,
    asset,
    f"{asset_summary['max_drawdown_pct']:.2f}%",
    RED,
)

metric_card(
    325,
    benchmark,
    f"{benchmark_summary['max_drawdown_pct']:.2f}%",
    BLUE,
)

# Event annotation
draw.text(
    (600, 178),
    "SAME PEAK → TROUGH",
    fill=MUTED,
    font=F_LABEL,
)
draw.text(
    (600, 204),
    "Dec 27, 2021 → Oct 14, 2022",
    fill=NAVY,
    font=font(20, True),
)

# ---------- Chart ----------
LEFT = 82
RIGHT = 1135
TOP = 275
BOTTOM = 535

# chart background
draw.rounded_rectangle(
    (55, 255, 1150, 555),
    radius=16,
    fill=WHITE,
    outline=GRID,
    width=1,
)

# y-axis: 0 to -100
Y_MIN = -100.0
Y_MAX = 0.0

def x_coord(dt):
    total = (dates[-1] - dates[0]).total_seconds()
    pos = (dt - dates[0]).total_seconds()
    return LEFT + (pos / total) * (RIGHT - LEFT)

def y_coord(value):
    frac = (Y_MAX - value) / (Y_MAX - Y_MIN)
    return TOP + frac * (BOTTOM - TOP)

# horizontal grid
for level in [0, -20, -40, -60, -80, -100]:
    y = y_coord(level)
    draw.line((LEFT, y, RIGHT, y), fill=GRID, width=1)
    draw.text(
        (LEFT - 52, y - 8),
        f"{level}%",
        fill=MUTED,
        font=F_AXIS,
    )

# year labels
for year in [2010, 2013, 2016, 2019, 2022, 2025]:
    dt = datetime(year, 1, 1)
    if dates[0] <= dt <= dates[-1]:
        x = x_coord(dt)
        draw.line((x, TOP, x, BOTTOM), fill=(235, 240, 246), width=1)
        draw.text((x - 18, BOTTOM + 8), str(year),
                  fill=MUTED, font=F_AXIS)

# draw lines
asset_points = [
    (x_coord(d), y_coord(v))
    for d, v in zip(dates, asset_dd)
]

benchmark_points = [
    (x_coord(d), y_coord(v))
    for d, v in zip(dates, benchmark_dd)
]

draw.line(benchmark_points, fill=BLUE, width=3)
draw.line(asset_points, fill=RED, width=3)

# mark maximum drawdowns
asset_trough = datetime.fromisoformat(asset_summary["trough_date"])
benchmark_trough = datetime.fromisoformat(benchmark_summary["trough_date"])

ax = x_coord(asset_trough)
ay = y_coord(asset_summary["max_drawdown_pct"])
bx = x_coord(benchmark_trough)
by = y_coord(benchmark_summary["max_drawdown_pct"])

draw.ellipse((ax - 6, ay - 6, ax + 6, ay + 6), fill=RED)
draw.ellipse((bx - 6, by - 6, bx + 6, by + 6), fill=BLUE)

draw.text(
    (ax + 10, ay - 2),
    "SOXL −90.46%",
    fill=RED,
    font=font(15, True),
)

draw.text(
    (bx + 10, by - 22),
    "SMH −45.30%",
    fill=BLUE,
    font=font(15, True),
)

# legend
legend_y = 265
draw.line((850, legend_y, 882, legend_y), fill=RED, width=4)
draw.text((890, legend_y - 9), "SOXL", fill=NAVY, font=F_AXIS)

draw.line((960, legend_y, 992, legend_y), fill=BLUE, width=4)
draw.text((1000, legend_y - 9), "SMH", fill=NAVY, font=F_AXIS)

# ---------- Footer ----------
draw.text(
    (65, 584),
    "2010–2026 · Adjusted close · Running-peak drawdown · Source: Yahoo Finance",
    fill=MUTED,
    font=F_FOOT,
)

footer = "tradingninvestment.com"
bbox = draw.textbbox((0, 0), footer, font=font(15, True))
draw.text(
    (1135 - (bbox[2] - bbox[0]), 584),
    footer,
    fill=NAVY,
    font=font(15, True),
)

OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT_PATH, "PNG", optimize=True)

print(f"Created: {OUT_PATH}")
print(f"Size: {img.size}")
print(f"SOXL max drawdown: {asset_summary['max_drawdown_pct']:.4f}%")
print(f"SMH max drawdown: {benchmark_summary['max_drawdown_pct']:.4f}%")
print(f"Rows used: {len(rows)}")
