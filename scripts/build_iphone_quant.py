#!/usr/bin/env python3
"""Build iPhone event-study JSON with Yahoo Finance historical adjusted prices.
Requires: pip install yfinance pandas
Run from tradingninvestment-web repository root.
"""
import json, sys, math
from pathlib import Path
from datetime import date
from bisect import bisect_left

ROOT = Path('public/data/iphone')
EVENTS = ROOT / 'announcement-events.json'
HORIZONS = {'1D':1,'5D':5,'10D':10,'20D':20,'3M':63,'6M':126,'1Y':252}
try:
    import pandas as pd
    import yfinance as yf
except ImportError:
    raise SystemExit('Install dependencies first: python3 -m pip install pandas yfinance')

def get_prices(symbol):
    frame = yf.download(symbol, start='2006-01-01', end=(date.today()+pd.Timedelta(days=1)).isoformat(), auto_adjust=True, progress=False, threads=False)
    if frame.empty: raise RuntimeError(f'No market data downloaded for {symbol}')
    closes = frame['Close']
    if hasattr(closes, 'columns'): closes = closes.iloc[:,0]
    result = {pd.Timestamp(d).strftime('%Y-%m-%d'):float(v) for d,v in closes.items() if pd.notna(v) and float(v)>0}
    return result

ap = get_prices('AAPL')
sp = get_prices('^GSPC')
dates = sorted(set(ap)&set(sp))
if len(dates)<3000: raise RuntimeError(f'Only {len(dates)} shared sessions; refusing to publish incomplete study')
rows = json.loads(EVENTS.read_text())
if not isinstance(rows,list): raise RuntimeError('Event JSON must be an array')
for row in rows:
    announcement = row['date']
    # Use prior session as baseline, including announcements during market hours.
    # For same-day events, this measures the announcement-session reaction + horizon.
    idx = bisect_left(dates,announcement)-1
    if idx < 0 or (pd.Timestamp(announcement)-pd.Timestamp(dates[idx])).days > 7:
        raise RuntimeError(f'Missing baseline near {announcement}')
    row['returns'] = {}; row['benchmark'] = {}
    row['baselineDate'] = dates[idx]
    row['methodology'] = 'Adjusted AAPL close versus S&P 500 price-index close; baseline previous trading session; no dividends in index'
    for key,period in HORIZONS.items():
        end = idx+period
        if end>=len(dates):
            row['returns'][key]=None;row['benchmark'][key]=None
        else:
            row['returns'][key]=round(100*(ap[dates[end]]/ap[dates[idx]]-1),4)
            row['benchmark'][key]=round(100*(sp[dates[end]]/sp[dates[idx]]-1),4)
    row['priceSource'] = 'Yahoo Finance historical daily series via yfinance; downloaded on '+date.today().isoformat()

# Avoid overwriting with incomplete data; write only after every event processed.
output = json.dumps(rows,indent=2,ensure_ascii=False)+'\n'
EVENTS.write_text(output)
print(f'Updated {len(rows)} events across {len(dates)} common sessions. Source: Yahoo Finance via yfinance.')
for key in HORIZONS:
    usable=[r for r in rows if isinstance(r['returns'].get(key),(int,float)) and isinstance(r['benchmark'].get(key),(int,float))]
    if usable:
        a=sum(r['returns'][key] for r in usable)/len(usable)
        e=sum(r['returns'][key]-r['benchmark'][key] for r in usable)/len(usable)
        print(f'{key:>3}: N={len(usable):2} mean AAPL={a:+.2f}% mean excess={e:+.2f} pp')
