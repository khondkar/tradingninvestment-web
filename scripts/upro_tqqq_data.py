"""Build the UPRO/TQQQ comparison on identical adjusted-close dates."""
from pathlib import Path
import json
import pandas as pd
import numpy as np
import yfinance as yf

def build_comparison(upro, through):
    raw=yf.download('TQQQ',start='2010-02-01',end=(pd.Timestamp(through)+pd.Timedelta(days=1)).date().isoformat(),auto_adjust=False,progress=False)
    if raw.empty: raise RuntimeError('No TQQQ history returned')
    tqqq=raw['Adj Close']
    if isinstance(tqqq,pd.DataFrame):tqqq=tqqq.iloc[:,0]
    tqqq.index=pd.to_datetime(tqqq.index).tz_localize(None)
    upro.index=pd.to_datetime(upro.index).tz_localize(None)
    first=max(upro.index[0],tqqq.index[0])
    upro=upro.loc[first:];tqqq=tqqq.loc[first:]
    if not upro.index.equals(tqqq.index):raise RuntimeError('UPRO/TQQQ dates differ; refresh held')
    frame=pd.DataFrame({'upro':upro,'tqqq':tqqq})
    if frame.index.has_duplicates or not np.isfinite(frame.to_numpy()).all() or (frame<=0).any().any():raise RuntimeError('Invalid comparison prices')
    if frame.index[-1].date().isoformat()!=through:raise RuntimeError('Comparison end date differs from article')
    return {'through':through,'first_date':frame.index[0].date().isoformat(),
      'price_basis':'Yahoo Finance adjusted close; distribution-adjusted return proxy',
      'data':[{'date':date.date().isoformat(),'upro':float(row.upro),'tqqq':float(row.tqqq)} for date,row in frame.iterrows()]}

if __name__=='__main__':
    root=Path(__file__).resolve().parents[1]
    dd=json.loads((root/'src/data/charts/uproVsSpyDrawdowns.json').read_text())
    upro=pd.Series([r['asset_adjusted_close'] for r in dd['data']],index=pd.to_datetime([r['date'] for r in dd['data']]))
    payload=build_comparison(upro,dd['range']['last_date'])
    target=root/'src/data/charts/uproVsTqqqComparison.json'
    pending=target.with_suffix('.pending.json')
    pending.write_text(json.dumps(payload,separators=(',',':'),allow_nan=False)+'\n')
    pending.replace(target)
    print(f"PASS: UPRO/TQQQ matched history {payload['first_date']} to {payload['through']}")
