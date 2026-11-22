"""Build the SOXL article comparison from the checked-in daily research series."""
import csv
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHARTS = ROOT / "src/data/charts"
IMAGES = ROOT / "public/images/research"
NAMES = ("SOXL", "SMH", "Nasdaq Composite")
COLORS = ("#aa3425", "#125391", "#175e48")


def days(start, end):
    return (date.fromisoformat(end) - date.fromisoformat(start)).days


def measure(dates, closes):
    peak = trough = worst_peak = worst_trough = 0
    drawdowns = []
    for i, close in enumerate(closes):
        if close >= closes[peak]:
            peak = trough = i
        if close < closes[trough]:
            trough = i
        loss = 100 * (close / closes[peak] - 1)
        drawdowns.append(loss)
        if loss < drawdowns[worst_trough]:
            worst_peak, worst_trough = peak, i
    recovered = next((dates[i] for i in range(worst_trough + 1, len(dates))
                      if closes[i] >= closes[worst_peak]), None)
    return drawdowns, {
        "peak": dates[worst_peak], "trough": dates[worst_trough],
        "loss": round(drawdowns[worst_trough], 2), "recovery": recovered,
        "fromLow": days(dates[worst_trough], recovered) if recovered else None,
        "fromPeak": days(dates[worst_peak], recovered) if recovered else None,
        "latestPeak": dates[peak], "current": round(drawdowns[-1], 2),
        "elapsed": days(dates[peak], dates[-1]),
    }


def write_chart(dates, series, start, suffix):
    first = next(i for i, d in enumerate(dates) if d >= start)
    start, end = dates[first], dates[-1]
    span = days(start, end)
    def x(d):
        return 43 + 495 * days(start, d) / span
    def y(v):
        return 25 - 1.91 * v
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 554 259" role="img">',
             f'<title>Drawdown from prior high, {start} through {end}</title>',
             '<rect width="554" height="259" fill="white"/><g font-family="Arial,sans-serif" font-size="14" fill="#384957">']
    for val in range(0, -101, -25):
        parts.append(f'<path d="M43 {y(val)}H538" stroke="#d6dfe5"/><text x="39" y="{y(val)+5}" text-anchor="end">{val}%</text>')
    for values, color in zip(series, COLORS):
        # Keep the first, lowest, highest, and last observation of each pixel column.
        buckets = {}
        for i in range(first, len(dates)):
            buckets.setdefault(int(x(dates[i])), []).append(i)
        indices = set()
        for group in buckets.values():
            indices.update([group[0], group[-1], min(group, key=values.__getitem__), max(group, key=values.__getitem__)])
        points = ' '.join(f'{x(dates[i]):.1f},{y(values[i]):.1f}' for i in sorted(indices))
        parts.append(f'<polyline fill="none" stroke="{color}" stroke-width="1.6" stroke-linejoin="round" points="{points}"/>')
    for i, anchor in [(first, 'start'), ((first+len(dates)-1)//2, 'middle'), (len(dates)-1, 'end')]:
        label = date.fromisoformat(dates[i]).strftime('%b %Y')
        parts.append(f'<text x="{x(dates[i]):.1f}" y="244" text-anchor="{anchor}">{label}</text>')
    (IMAGES / f'soxl-three-way-{suffix}.svg').write_text('\n'.join(parts + ['</g></svg>\n']))


if __name__ == "__main__":
    source = json.loads((CHARTS / 'soxlVsSmhDrawdowns.json').read_text())
    with (ROOT / 'src/data/market/nasdaq/daily.csv').open() as f:
        index = {r['Date']: float(r['Close']) for r in csv.DictReader(f)}
    records = source['data']
    dates = [r['date'] for r in records]
    if dates != sorted(set(dates)) or any(d not in index for d in dates):
        raise ValueError("Missing or disordered common trading sessions")
    series = [[r[k] for r in records] for k in ('asset_adjusted_close', 'benchmark_adjusted_close')]
    series.append([index[d] for d in dates])
    results = [measure(dates, c) for c in series]
    summary = dict(start=dates[0], end=dates[-1], sessions=len(dates),
                   assets=[dict(name=n, color=c, **r[1]) for n, c, r in zip(NAMES, COLORS, results)])
    (CHARTS / 'soxlThreeWayRecovery.json').write_text(json.dumps(summary, indent=2) + '\n')
    IMAGES.mkdir(parents=True, exist_ok=True)
    for start, suffix in [(dates[0], 'history'), ('2021-11-01', 'recovery'), (dates[-1][:4]+'-01-01', 'latest')]:
        write_chart(dates, [r[0] for r in results], start, suffix)
