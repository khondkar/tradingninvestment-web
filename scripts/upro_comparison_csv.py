"""Export the same common-history observations used by the three-fund card."""
import csv,json,math
from pathlib import Path

def write_comparison_csv(dd,pair,destination):
    if dd['range']['last_date']!=pair['through']:raise ValueError('Comparison dates differ')
    lookup={row['date']:row for row in dd['data']}
    if not pair['data']:raise ValueError('Empty comparison')
    start=pair['data'][0]['date']
    if [row['date'] for row in dd['data'] if row['date']>=start]!=[row['date'] for row in pair['data']]:raise ValueError('Trading dates differ')
    first=None;peaks={};rows=[]
    for row in pair['data']:
        base=lookup[row['date']]
        if not math.isclose(base['asset_adjusted_close'],row['upro'],rel_tol=1e-5,abs_tol=1e-5):raise ValueError('UPRO observations differ')
        prices={'upro':base['asset_adjusted_close'],'tqqq':row['tqqq'],'spy':base['benchmark_adjusted_close']}
        if any(not math.isfinite(v) or v<=0 for v in prices.values()):raise ValueError('Invalid prices')
        if first is None:first=prices.copy()
        out={'date':row['date']}
        for ticker,value in prices.items():
            peaks[ticker]=max(peaks.get(ticker,value),value)
            out[ticker+'_adjusted_close']=value
            out[ticker+'_growth_of_10000']=round(value/first[ticker]*10000,6)
            out[ticker+'_drawdown_pct']=round((value/peaks[ticker]-1)*100,6)
        rows.append(out)
    destination=Path(destination);destination.parent.mkdir(parents=True,exist_ok=True)
    pending=destination.with_suffix('.pending.csv')
    with pending.open('w',newline='') as stream:
        writer=csv.DictWriter(stream,fieldnames=list(rows[0]),lineterminator='\n')
        writer.writeheader();writer.writerows(rows)
    pending.replace(destination)
    return len(rows)

if __name__=='__main__':
    root=Path(__file__).resolve().parents[1]
    dd=json.loads((root/'src/data/charts/uproVsSpyDrawdowns.json').read_text())
    pair=json.loads((root/'src/data/charts/uproVsTqqqComparison.json').read_text())
    count=write_comparison_csv(dd,pair,root/'public/data/upro-tqqq-spy-comparison.csv')
    print(f'PASS: {count} common-date comparison rows exported through {pair["through"]}')
