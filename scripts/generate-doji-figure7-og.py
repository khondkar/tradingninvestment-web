import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src/research/doji/reversal-continuation-results.json"
OUTPUT = ROOT / "public/images/social/research/doji-candlestick-spy-26-year-study-tni-og.png"

W, H = 1200, 630
IVORY = "#f7f7f0"
GREEN = "#253d32"
GOLD = "#9b7b49"
MUTED = "#68786e"
GRID = "#e3e6df"
WHITE = "#ffffff"

HORIZONS = [
    (1, "1 DAY", "#168b80"),
    (5, "5 DAYS", "#4c7ed9"),
    (10, "10 DAYS", "#e5a04b"),
]

SCENARIOS = [
    ("Bullish reversal", "Bullish reversal"),
    ("Bearish reversal", "Bearish reversal"),
    ("Bullish continuation", "Bullish continuation"),
    ("Bearish continuation", "Bearish continuation"),
]

def font(size, serif=False, bold=False):
    candidates = (
        [
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
            "/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf",
        ]
        if serif else
        [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
            if bold else
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
        ]
    )
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

data = json.loads(DATA.read_text())
lookup = {
    (r["Scenario"], int(r["Horizon"])): float(r["Advantage_pp"])
    for r in data["performance"]
}

for scenario, _ in SCENARIOS:
    for days, _, _ in HORIZONS:
        if (scenario, days) not in lookup:
            raise ValueError(f"Missing Figure 7 observation: {scenario}, {days}")

img = Image.new("RGB", (W, H), IVORY)
d = ImageDraw.Draw(img)

# TNI editorial frame
d.rectangle((0, 0, 12, H), fill=GOLD)
d.text((66, 34), "TNI", font=font(37, serif=True), fill=GREEN)
d.text((155, 48), "TRADINGNINVESTMENT", font=font(15), fill=GOLD)
d.text((1018, 50), "RESEARCH", font=font(13, bold=True), fill=GREEN)
d.line((66, 91, 1136, 91), fill="#dedfd5", width=2)

d.text(
    (66, 109),
    "SPY  /  2000–2026  /  6,726 TRADING SESSIONS",
    font=font(14),
    fill=MUTED,
)

d.text(
    (66, 136),
    "Does the Doji Candlestick Really Work?",
    font=font(32, serif=True),
    fill=GREEN,
)

d.text(
    (66, 181),
    "FIGURE 7  ·  REVERSAL OR CONTINUATION?",
    font=font(16, bold=True),
    fill=GOLD,
)

d.text(
    (66, 208),
    "Doji advantage vs. non-Doji sessions in the same prior-trend regime",
    font=font(15),
    fill=MUTED,
)

# Chart area
chart = (66, 246, 1136, 534)
d.rounded_rectangle(chart, radius=12, fill=WHITE, outline=GRID, width=2)

# Legend
lx = 735
for days, label, color in HORIZONS:
    d.rounded_rectangle((lx, 262, lx + 13, 275), radius=3, fill=color)
    d.text((lx + 20, 260), label, font=font(12, bold=True), fill=GREEN)
    lx += 127

# Chart scale: symmetric, automatically fitted to the research observations
values = list(lookup.values())
limit = max(5, int(max(abs(v) for v in values) + 1))
plot_left, plot_right = 340, 1080
zero_x = (plot_left + plot_right) / 2
half_width = (plot_right - plot_left) / 2

for tick in [-limit, 0, limit]:
    x = zero_x + (tick / limit) * half_width
    d.line(
        (int(x), 294, int(x), 486),
        fill="#aebbb2" if tick == 0 else GRID,
        width=2 if tick == 0 else 1,
    )
    d.text(
        (int(x) - 22, 493),
        f"{tick:+d} pp" if tick else "0",
        font=font(12),
        fill=MUTED,
    )

for i, (scenario, label) in enumerate(SCENARIOS):
    center_y = 322 + i * 48
    d.text((88, center_y - 10), label, font=font(15), fill=GREEN)

    for j, (days, _, color) in enumerate(HORIZONS):
        value = lookup[(scenario, days)]
        y = center_y - 12 + j * 10
        x = zero_x + (value / limit) * half_width
        left, right = sorted((zero_x, x))
        d.rounded_rectangle(
            (int(left), int(y), max(int(left) + 2, int(right)), int(y + 7)),
            radius=2,
            fill=color,
        )

d.text(
    (88, 506),
    "Positive values favor Doji; negative values favor non-Doji.",
    font=font(12),
    fill=MUTED,
)

# Footer
d.line((66, 559, 1136, 559), fill="#dedfd5", width=2)
d.text(
    (66, 579),
    "DATA  →  EVIDENCE  →  RESEARCH  →  DECISION",
    font=font(13),
    fill=GOLD,
)
d.text(
    (895, 579),
    "TRADINGNINVESTMENT.COM",
    font=font(12),
    fill=MUTED,
)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)

backup = OUTPUT.with_name(OUTPUT.stem + "-backup.png")
if OUTPUT.exists() and not backup.exists():
    backup.write_bytes(OUTPUT.read_bytes())

img.save(OUTPUT, optimize=True)

print("OG card generated:", OUTPUT)
print("Dimensions:", img.size)
print("Data points:", len(SCENARIOS) * len(HORIZONS))
print("Scale: ±", limit, "percentage points")
