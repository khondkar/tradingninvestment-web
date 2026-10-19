#!/usr/bin/env python3
"""Populate iPhone study from daily CLOSE price CSVs (AAPL and SPX).
CSV format: Date,Close ; dates YYYY-MM-DD; CLOSE is split-adjusted for AAPL.
AAPL close should be adjusted for corporate actions consistently; dividend handling must be documented.
Usage: python3 scripts/build-iphone-returns.py aapl.csv spx.csv
"""
import csv,json,sys
from pathlib import Path
from bisect import bisect_left
if len(sys.argv)!=3: raise SystemExit('Usage: build-iphone-returns.py aapl.csv spx.csv')
def load(path):
 d={}
 with open(path,newline='') as f:
  for row in csv.DictReader(f):
   date=row.get('Date') or row.get('date'); close=row.get('Close') or row.get('close')
   if date and close:d[date]=float(close.replace(',',''))
 return d
ap=load(sys.argv[1]);sp=load(sys.argv[2]);common=sorted(set(ap)&set(sp)); offsets={'1D':1,'5D':5,'10D':10,'20D':20,'3M':63,'6M':126,'1Y':252}
p=Path('public/data/iphone/announcement-events.json');rows=json.loads(p.read_text())
for row in rows:
 i=bisect_left(common,row['date'])-1
 if i<0:continue
 # baseline: latest session strictly BEFORE announcement
 for key,n in offsets.items():
  j=i+n
  if j>=len(common):continue
  d0,d1=common[i],common[j]
  if (int(d0[:4])<int(row['date'][:4])-1):continue
  row.setdefault('returns',{})[key]=round((ap[d1]/ap[d0]-1)*100,4)
  row.setdefault('benchmark',{})[key]=round((sp[d1]/sp[d0]-1)*100,4)
p.write_text(json.dumps(rows,indent=2)+'\n')
print('Updated',p,'using',len(common),'common market sessions')
