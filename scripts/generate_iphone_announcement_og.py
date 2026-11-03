#!/usr/bin/env python3
"""Create the Nike-style iPhone OG card from verified event-study data.

Run from any directory: python3 scripts/generate_iphone_announcement_og.py
Requires matplotlib. No network access or hand-entered return statistics.
The committed PNG is used by normal Node builds.
"""
import json
import math
import re
from datetime import date
from pathlib import Path
from statistics import mean

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'public/data/iphone/announcement-events.json'
OUT = ROOT / 'public/images/social/iphone-announcements-2007-2026-og.png'
rows = sorted(json.loads(DATA.read_text()), key=lambda r: r['date'])
if [int(r['date'][:4]) for r in rows] != list(range(2007, 2027)):
    raise SystemExit('Expected one annual flagship announcement per year, 2007–2026.')
for row in rows:
    for field in ('returns', 'benchmark'):
        value = row[field].get('20D')
        if not isinstance(value, (float, int)) or not math.isfinite(value):
            raise SystemExit(f'Missing 20D observation: {row["date"]} {field}')
    # Validate the displayed results against saved endpoint prices.
    observations = row['priceObservations']
    for field, key in [('returns', 'aaplAdjustedClose'), ('benchmark', 'sp500Close')]:
        calculated = 100 * (observations['20D'][key] / observations['baseline'][key] - 1)
        if abs(calculated - row[field]['20D']) > .00011:
            raise SystemExit(f'Endpoint check failed: {row["date"]} {field}')

a = [r['returns']['20D'] for r in rows]
b = [r['benchmark']['20D'] for r in rows]
source_dates = {re.search(r'downloaded on (\d{4}-\d{2}-\d{2})', r['priceSource']).group(1) for r in rows}
if len(source_dates) != 1:
    raise SystemExit('Refresh the complete sample before generating the card.')
checked_label = date.fromisoformat(source_dates.pop()).strftime('%b %d, %Y').replace(' 0', ' ')
navy, muted, blue, red = '#10233f', '#405875', '#0064eb', '#d72539'
green, bg, border = '#007b53', '#f6f9fd', '#d6e3f3'
fig = plt.figure(figsize=(12, 6.3), dpi=100, facecolor=bg)

def text(x, y, label, size=11, color=navy, weight='normal', ha='left'):
    return fig.text(x/1200, 1-y/630, label, fontsize=size, color=color,
                    fontweight=weight, ha=ha, va='top', family='DejaVu Sans')

def panel(x, y, w, h):
    fig.add_artist(FancyBboxPatch((x/1200, 1-(y+h)/630), w/1200, h/630,
        boxstyle='round,pad=0,rounding_size=0.014', transform=fig.transFigure,
        facecolor='white', edgecolor=border, linewidth=.9, zorder=0))

def line(x1, y1, x2, y2, color=border, lw=.7):
    fig.add_artist(plt.Line2D([x1/1200, x2/1200], [1-y1/630, 1-y2/630],
        transform=fig.transFigure, color=color, lw=lw))

text(38, 25, 'TNI STOCK INTELLIGENCE', 13, blue, 'bold')
text(38, 52, 'Do iPhone Launches Move Apple Stock?', 24, weight='bold')
text(38, 95, '2007–2026  ·  20 annual flagship announcements  ·  Returns over 20 trading sessions', 11)

cards = [
    ('AVERAGE RETURN', mean(a), mean(b), '20 announcements', '20 announcements'),
    ('BEST RETURN', max(a), max(b), rows[a.index(max(a))]['date'][:4], rows[b.index(max(b))]['date'][:4]),
    ('WORST RETURN', min(a), min(b), rows[a.index(min(a))]['date'][:4], rows[b.index(min(b))]['date'][:4]),
    ('POSITIVE WINDOWS', None, None, 'of 20 announcements', 'of 20 announcements'),
]
for i, (title, av, bv, al, bl) in enumerate(cards):
    x = 30 + i*294
    panel(x, 128, 282, 107)
    text(x+15, 140, title, 8.7, muted, 'bold')
    text(x+15, 160, 'AAPL', 8.7, weight='bold')
    text(x+149, 160, 'S&P 500', 8.7, weight='bold')
    line(x+138, 161, x+138, 222)
    if av is not None:
        text(x+15, 180, f'{av:+.2f}%', 16, blue, 'bold')
        text(x+149, 180, f'{bv:+.2f}%', 16, red, 'bold')
    else:
        text(x+15, 180, str(sum(v>0 for v in a))+'/20', 16, blue, 'bold')
        text(x+149, 180, str(sum(v>0 for v in b))+'/20', 16, red, 'bold')
    text(x+15, 210, al, 7.8, muted)
    text(x+149, 210, bl, 7.8, muted)

panel(26, 247, 1148, 317)
text(44, 259, 'Announcement dates and subsequent returns', 11.5, weight='bold')
text(1154, 261, 'AAPL adjusted close  /  S&P 500 price index', 8.5, muted, ha='right')
line(601, 288, 601, 551)

# Short labels retain the flagship families; exact source names remain in JSON.
names = ['Original iPhone', '3G', '3GS', '4', '4S', '5', '5s / 5c', '6 / 6 Plus',
         '6s / 6s Plus', '7 / 7 Plus', '8 / 8 Plus / X', 'XS / XS Max', '11',
         '12', '13', '14', '15', '16', '17', '18 Pro / Pro Max']
for block in range(2):
    x = 44 + block*574
    text(x, 287, 'ANNOUNCED', 8.2, muted, 'bold')
    text(x+136, 287, 'iPHONE', 8.2, muted, 'bold')
    text(x+415, 287, 'AAPL', 8.5, blue, 'bold', ha='right')
    text(x+533, 287, 'S&P 500', 8.5, red, 'bold', ha='right')
    line(x, 306, x+533, 306)
    for k, row in enumerate(rows[block*10:(block+1)*10]):
        idx = block*10+k
        y = 313 + k*24
        text(x, y, row['date'], 10.5, weight='bold')
        text(x+136, y, names[idx], 10.5)
        text(x+415, y, f'{a[idx]:+.2f}%', 10.8, blue, 'bold', ha='right')
        text(x+533, y, f'{b[idx]:+.2f}%', 10.8, red, 'bold', ha='right')
        if k<9: line(x, y+20, x+533, y+20, '#e9eff7', .5)

text(38, 575, 'From the prior close; announcement session = day 1. AAPL includes dividend adjustments; S&P 500 excludes dividends.', 8.2, muted)
text(38, 593, 'Sources: Apple Newsroom; Yahoo Finance. Annual flagship events only; SE/off-cycle excluded. Not evidence of causation.', 8.0, muted)
text(38, 611, f'Data checked {checked_label}. Past performance does not predict future returns.', 7.3, muted)
text(1164, 610, 'TRADINGNINVESTMENT.COM', 8.2, navy, 'bold', ha='right')
OUT.parent.mkdir(parents=True, exist_ok=True)
fig.savefig(OUT, dpi=100, facecolor=bg)
plt.close(fig)
print(f'Created {OUT} (1200×630); validated {len(rows)} paired 20-session returns.')
print(f'Mean AAPL: {mean(a):+.4f}%; mean S&P 500: {mean(b):+.4f}%')
