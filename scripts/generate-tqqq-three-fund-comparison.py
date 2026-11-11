"""Add QLD to the existing, date-matched TQQQ/QQQ research snapshot."""
import csv
from datetime import datetime, timedelta, timezone
import hashlib
import json
import math
from pathlib import Path
import tempfile
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]


def build():
    source = ROOT / "src/data/charts/tqqqVsQqqDrawdowns.json"
    saved = json.loads(source.read_text())
    start = saved["range"]["first_date"]
    through = saved["range"]["last_date"]
    params = urllib.parse.urlencode({
        "period1": int(datetime.fromisoformat(start).replace(tzinfo=timezone.utc).timestamp()),
        "period2": int((datetime.fromisoformat(through) + timedelta(days=1)).replace(tzinfo=timezone.utc).timestamp()),
        "interval": "1d",
    })
    url = "https://query1.finance.yahoo.com/v8/finance/chart/QLD?" + params
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        raw = response.read()
    chart = json.loads(raw)["chart"]["result"][0]
    if chart["meta"]["symbol"] != "QLD" or chart["meta"]["dataGranularity"] != "1d":
        raise ValueError("QLD response is not daily QLD history")
    adjusted = chart["indicators"]["adjclose"][0]["adjclose"]
    stamps = chart["timestamp"]
    if len(stamps) != len(adjusted):
        raise ValueError("QLD timestamps and adjusted closes differ in length")
    qld = {}
    for stamp, price in zip(stamps, adjusted):
        day = datetime.fromtimestamp(stamp, ZoneInfo("America/New_York")).date().isoformat()
        if start <= day <= through:
            if day in qld or price is None or not math.isfinite(price) or price <= 0:
                raise ValueError(f"Invalid or duplicate QLD observation on {day}")
            qld[day] = price

    rows = []
    for row in saved["data"]:
        rows.append({"date": row["date"], "qqq": row["benchmark_adjusted_close"],
                     "qld": qld[row["date"]], "tqqq": row["asset_adjusted_close"]})
    dates = [row["date"] for row in rows]
    if dates != sorted(set(dates)) or set(dates) != set(qld):
        raise ValueError("Trading dates differ between QLD and the saved TQQQ/QQQ snapshot")
    if len(rows) != saved["range"]["daily_observations"] or dates[-1] != through:
        raise ValueError("Comparison coverage differs from the article snapshot")
    if not all(math.isfinite(row[key]) and row[key] > 0 for row in rows for key in ("qqq", "qld", "tqqq")):
        raise ValueError("Invalid comparison prices")
    payload = {
        "first_date": start, "through": through, "daily_observations": len(rows),
        "price_basis": "Yahoo Finance adjusted daily closes; distribution-adjusted total-return proxy",
        "source": "Yahoo Finance", "qld_source_url": url,
        "qld_response_sha256": hashlib.sha256(raw).hexdigest(),
        "tqqq_qqq_snapshot_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "methodology": "Identical daily dates; each fund uses its own running peak. Recovery is the first later close at or above the peak. Durations are calendar days.",
        "data": rows,
    }
    fields = ["date"] + [f"{key}_{metric}" for key in ("qqq", "qld", "tqqq")
                          for metric in ("adjusted_close", "growth_10000", "drawdown_pct")]
    peak = {key: rows[0][key] for key in ("qqq", "qld", "tqqq")}
    # Validate all input data before staging either publication file.
    with tempfile.TemporaryDirectory(dir=ROOT) as temp:
        stage = Path(temp)
        json_file = stage / "tqqqQldQqqComparison.json"
        json_file.write_text(json.dumps(payload, separators=(",", ":"), allow_nan=False) + "\n")
        csv_file = stage / "tqqq-qld-qqq-comparison.csv"
        with csv_file.open("w", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=fields, lineterminator="\n")
            writer.writeheader()
            for row in rows:
                record = {"date": row["date"]}
                for key in peak:
                    peak[key] = max(peak[key], row[key])
                    record[f"{key}_adjusted_close"] = row[key]
                    record[f"{key}_growth_10000"] = 10000 * row[key] / rows[0][key]
                    record[f"{key}_drawdown_pct"] = 100 * (row[key] / peak[key] - 1)
                writer.writerow(record)
        json_file.replace(ROOT / "src/data/charts" / json_file.name)
        csv_file.replace(ROOT / "public/data" / csv_file.name)
    print(f"PASS: {len(rows):,} matching QQQ/QLD/TQQQ dates, {start} through {through}")


if __name__ == "__main__":
    build()
