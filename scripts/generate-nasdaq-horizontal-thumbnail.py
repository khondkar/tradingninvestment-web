import json
from pathlib import Path
from xml.sax.saxutils import escape

root = Path.cwd()
data = json.loads(
    (root / "src/data/articles/nasdaq-selloff-2026.json").read_text()
)

target = root / "public/images/social/research/nasdaq-selloff-2026-tni-horizontal.svg"
target.parent.mkdir(parents=True, exist_ok=True)

assets = [
    ("Nasdaq Composite", "nasdaq"),
    ("Nasdaq-100", "nasdaq100"),
    ("PHLX Semiconductor", "sox"),
    ("SMH", "smh"),
    ("SOXL", "soxl"),
]

parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">',
    '<rect width="1200" height="630" fill="#ffffff"/>',
    '<g font-family="Arial,Helvetica,sans-serif">',
    '<text x="54" y="48" fill="#0b1c36" font-size="32" font-weight="800">TNI</text>',
    '<line x1="137" y1="20" x2="137" y2="54" stroke="#8390a3" stroke-width="2"/>',
    '<text x="155" y="46" fill="#0b1c36" font-size="21" font-weight="700" letter-spacing="3">RESEARCH</text>',
    '<text x="54" y="112" fill="#0b1c36" font-size="44" font-weight="800">Nasdaq Selloff 2026</text>',
    '<text x="55" y="151" fill="#1267a3" font-size="23" font-weight="700">The Hidden Damage Beneath the Index</text>',
    '<text x="55" y="181" fill="#68778e" font-size="14">Drawdown from each asset’s own 2026 closing high</text>',
    '<text x="1145" y="181" text-anchor="end" fill="#68778e" font-size="13">OCT 16, 2026</text>',
]

bar_x = 305
bar_max = 685
max_value = 70

for i, (label, key) in enumerate(assets):
    value = abs(float(data["summary"][key]["drawdown_from_2026_peak_pct"]))
    y = 224 + i * 65
    width = value / max_value * bar_max
    color = "#b51f32" if key == "soxl" else "#df5a66"

    parts += [
        f'<text x="55" y="{y+22}" fill="#14243c" font-size="19" font-weight="700">{escape(label)}</text>',
        f'<rect x="{bar_x}" y="{y}" width="{bar_max}" height="29" rx="5" fill="#edf1f6"/>',
        f'<rect x="{bar_x}" y="{y}" width="{width:.2f}" height="29" rx="5" fill="{color}"/>',
        f'<text x="1138" y="{y+22}" text-anchor="end" fill="#b51f32" font-size="21" font-weight="800">−{value:.2f}%</text>',
    ]

parts += [
    '<text x="54" y="566" fill="#69788e" font-size="12">Source: Yahoo Finance closing prices · TNI calculations · Individual peak dates vary</text>',
    '<rect x="0" y="584" width="1200" height="46" fill="#0b1c36"/>',
    '<text x="54" y="613" fill="#ffffff" font-size="13" font-weight="700" letter-spacing="2">TRADINGNINVESTMENT.COM</text>',
    '<text x="1145" y="613" text-anchor="end" fill="#ffffff" font-size="12" letter-spacing="2">MARKETS  |  DATA  |  RESEARCH  |  INTELLIGENCE</text>',
    '</g>',
    '</svg>',
]

target.write_text("\n".join(parts), encoding="utf-8")

print("Horizontal thumbnail created:", target)
print("Data as of:", data["as_of"])
for label, key in assets:
    print(label, data["summary"][key]["drawdown_from_2026_peak_pct"])
