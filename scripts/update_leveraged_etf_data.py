#!/usr/bin/env python3
"""Research-only Yahoo snapshot builder. Run after US market close."""
import argparse
import json
import math
import os
import time
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
    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    for offset in range(0, len(tickers), 20):
        batch = tickers[offset:offset+20]
        try:
            df = yf.download(batch, period='10d', interval='1d', auto_adjust=False, progress=False, threads=False, group_by='ticker', timeout=20)
        except Exception as exc:
            print('Batch failed:', batch, str(exc)[:150]); df = pd.DataFrame()
        for ticker in batch:
            old = prior.get('funds', {}).get(ticker, {})
            row = {'price': None, 'changePct': None, 'volume': None, 'sessionDate': None,
                   'aum': old.get('aum'), 'expenseRatioPct': old.get('expenseRatioPct'),
                   'fundAsOf': old.get('fundAsOf')}
            try:
                frame = df[ticker] if isinstance(df.columns, pd.MultiIndex) else df
                frame = frame.dropna(subset=['Close'])
                # Exclude today's potentially incomplete bar (America/New_York).
                today_et = pd.Timestamp.now(tz='America/New_York').date()
                frame = frame[[pd.Timestamp(i).date() < today_et for i in frame.index]]
                if len(frame):
                    last = frame.iloc[-1]
                    row['price'] = number(last.get('Close'))
                    vol = number(last.get('Volume'))
                    row['volume'] = int(vol) if vol is not None else None
                    row['sessionDate'] = str(pd.Timestamp(frame.index[-1]).date())
                    if len(frame) > 1:
                        prev = number(frame.iloc[-2].get('Close'))
                        if prev and row['price'] is not None:
                            row['changePct'] = round(100 * (row['price']/prev - 1), 4)
            except Exception as exc:
                print('Price unavailable', ticker, str(exc)[:90])
            result[ticker] = row
        print('Price batch', offset//20+1, '/', (len(tickers)+19)//20)
        time.sleep(1)
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
                if aum is not None or expense is not None: row['fundAsOf'] = now[:10]
            except Exception as exc:
                print('Metadata unavailable', ticker, str(exc)[:90])
            if (i+1) % 10 == 0: print('Metadata', i+1, '/', len(tickers))
            time.sleep(0.4)
    payload = {'updatedAt': now, 'source': 'Yahoo Finance via yfinance (research only)', 'funds': result}
    dest.write_text(json.dumps(payload, indent=2, allow_nan=False)+'\n')
    print('Saved', dest, 'tickers', len(result), 'with price', sum(v['price'] is not None for v in result.values()), 'with AUM', sum(v['aum'] is not None for v in result.values()))


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--project', type=Path, default=Path.cwd())
    p.add_argument('--metadata', action='store_true', help='Fetch slow per-fund AUM and expense ratio too')
    args = p.parse_args()
    snapshot(args.project.resolve(), args.metadata)
