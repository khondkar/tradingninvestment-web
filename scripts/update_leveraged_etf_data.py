#!/usr/bin/env python3
"""Research-only Yahoo snapshot builder. Run after US market close."""
import argparse
import json
import math
import os
import time
import tempfile
from zoneinfo import ZoneInfo
from datetime import datetime, timezone
from pathlib import Path


def number(x):
    try:
        v = float(x)
        return v if math.isfinite(v) else None
    except (TypeError, ValueError):
        return None


def snapshot(root, metadata=False):
    import yfinance as yf
    import pandas as pd
    src = root / 'src/pages/leveraged-etf-candidates.json'
    dest = root / 'src/pages/leveraged-etf-daily-metrics.json'
    candidates = json.loads(src.read_text())
    tickers = list(dict.fromkeys(str(f['ticker']).strip().upper() for f in candidates if f.get('ticker')))
    prior = json.loads(dest.read_text()) if dest.exists() else {'funds': {}}
    result = {}
    started = datetime.now(timezone.utc)
    now = started.isoformat(timespec='seconds')
    started_et = started.astimezone(ZoneInfo('America/New_York'))
    refreshed = set()
    for offset in range(0, len(tickers), 20):
        batch = tickers[offset:offset+20]
        try:
            df = yf.download(batch, period='1mo', interval='1d', auto_adjust=False, progress=False, threads=False, group_by='ticker', timeout=20)
        except Exception as exc:
            print('Batch failed:', batch, str(exc)[:150]); df = pd.DataFrame()
        for ticker in batch:
            old = prior.get('funds', {}).get(ticker, {})
            # Keep the previous snapshot unless a usable, non-regressing bar arrives.
            row = dict(old)
            for key in ('price', 'changePct', 'volume', 'sessionDate', 'aum', 'expenseRatioPct', 'fundAsOf'):
                row.setdefault(key, None)
            try:
                if isinstance(df.columns, pd.MultiIndex):
                    frame = df[ticker]
                elif len(batch) == 1:
                    frame = df
                else:
                    raise ValueError('Ambiguous multi-ticker response')
                frame = frame.dropna(subset=['Close']).sort_index()
                # Daily US bars can be used after 17:00 New York time. The daily
                # schedule runs later; manual intraday runs still exclude today.
                today_et = started_et.date()
                include_today = started_et.hour >= 17
                frame = frame[[
                    pd.Timestamp(i).date() < today_et or
                    (include_today and pd.Timestamp(i).date() == today_et)
                    for i in frame.index
                ]]
                if len(frame):
                    last = frame.iloc[-1]
                    price = number(last.get('Close'))
                    session = str(pd.Timestamp(frame.index[-1]).date())
                    old_session = old.get('sessionDate')
                    if price is not None and price > 0 and (not old_session or session >= old_session):
                        vol = number(last.get('Volume'))
                        previous = number(frame.iloc[-2].get('Close')) if len(frame) > 1 else None
                        change = round(100 * (price / previous - 1), 4) if previous is not None and previous > 0 else None
                        row.update(price=price, changePct=change,
                                   volume=int(vol) if vol is not None and vol >= 0 else None,
                                   sessionDate=session)
                        refreshed.add(ticker)
                    elif old_session and session < old_session:
                        print('Older response retained prior snapshot:', ticker, session, old_session)
            except Exception as exc:
                print('Price unavailable', ticker, str(exc)[:90])
            result[ticker] = row
        print('Price batch', offset//20+1, '/', (len(tickers)+19)//20)
        time.sleep(1)
    if not refreshed:
        raise RuntimeError('No usable completed-session prices downloaded. Previous data and timestamp preserved.')
    if metadata:
        for i, ticker in enumerate(tickers):
            try:
                info = yf.Ticker(ticker).info or {}
                row = result[ticker]
                aum = number(info.get('totalAssets'))
                # Yahoo reports totalAssets in dollars and annualReportExpenseRatio as a decimal.
                expense = number(info.get('annualReportExpenseRatio'))
                if aum is not None and aum >= 0: row['aum'] = aum
                if expense is not None and 0 <= expense <= 1: row['expenseRatioPct'] = round(expense*100, 4)
                if (aum is not None and aum >= 0) or (expense is not None and 0 <= expense <= 1): row['fundAsOf'] = now[:10]
            except Exception as exc:
                print('Metadata unavailable', ticker, str(exc)[:90])
            if (i+1) % 10 == 0: print('Metadata', i+1, '/', len(tickers))
            time.sleep(0.4)
    completed_at = datetime.now(timezone.utc).isoformat(timespec='seconds')
    retained = sum(t not in refreshed and number(result[t].get('price')) is not None for t in tickers)
    summary = {'requested': len(tickers), 'refreshed': len(refreshed),
               'retained': retained, 'unavailable': len(tickers) - len(refreshed) - retained}
    payload = {'updatedAt': completed_at, 'source': 'Yahoo Finance via yfinance (research only)',
               'refreshSummary': summary, 'funds': result}
    content = json.dumps(payload, indent=2, allow_nan=False) + '\n'
    # Replace only a completely written snapshot. A failed refresh leaves the
    # previous file, including its update timestamp, intact.
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=dest.parent,
                                         prefix=dest.name + '.', suffix='.tmp', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, dest)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    print('Refresh summary:', summary)
    print('Saved', dest, 'tickers', len(result), 'with price', sum(v['price'] is not None for v in result.values()), 'with AUM', sum(v['aum'] is not None for v in result.values()))


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--project', type=Path, default=Path.cwd())
    p.add_argument('--metadata', action='store_true', help='Fetch slow per-fund AUM and expense ratio too')
    args = p.parse_args()
    snapshot(args.project.resolve(), args.metadata)
