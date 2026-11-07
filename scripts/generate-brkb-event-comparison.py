#!/usr/bin/env python3
"""Berkshire event comparisons from the existing synchronized daily dataset.
No downloads, application build, or publication. NBER chronology is versioned
separately: market episodes refresh automatically; new recession dates require
an official NBER announcement and a chronology update.
"""
from pathlib import Path
from datetime import date
import json
import math
import tempfile
import os
from PIL import Image, ImageDraw, ImageFont

NBER_SOURCE = 'https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions'
RECESSIONS = [
    ('2001 recession', '2001-03', '2001-11'),
    ('2007–09 recession', '2007-12', '2009-06'),
    ('2020 recession', '2020-02', '2020-04'),
]
NAVY = '#10233f'
BLUE = '#174fa6'
RED = '#b51f35'


def worst_drawdown(rows, key):
    peak = rows[0][key]
    peak_date = rows[0]['date']
    worst = 0.0
    result_peak = result_trough = peak_date
    for row in rows:
        price = row[key]
        if price >= peak:
            peak, peak_date = price, row['date']
        dd = (price / peak - 1) * 100
        if dd < worst:
            worst = dd
            result_peak, result_trough = peak_date, row['date']
    return {'drawdown_pct': round(worst, 4), 'peak_date': result_peak,
            'trough_date': result_trough,
            'window_return_pct': round((rows[-1][key] / rows[0][key] - 1)*100, 4)}


def make_event(rows, start, end, label, kind, recovery=None):
    window = rows[start:end+1]
    a = worst_drawdown(window, 'asset_adjusted_close')
    b = worst_drawdown(window, 'benchmark_adjusted_close')
    return {'id': f'{kind}-{window[0]["date"]}', 'label': label,
            'kind': kind, 'start': window[0]['date'], 'end': window[-1]['date'],
            'observations': len(window), 'asset': a, 'benchmark': b,
            'difference_pp': round(a['drawdown_pct'] - b['drawdown_pct'], 4),
            'sp500_recovery': recovery}


def corrections(rows):
    # Matches the existing TNI S&P 500 distinct peak-to-recovery convention.
    events = []
    peak = trough = 0
    active = False
    def add(recovery):
        level = (rows[trough]['benchmark_adjusted_close'] /
                 rows[peak]['benchmark_adjusted_close'] - 1) * 100
        kind = 'Bear market' if level <= -20 else 'Correction'
        first, last = rows[peak]['date'][:4], rows[trough]['date'][:4]
        label = first if first == last else f'{first}–{last[2:]}'
        event = make_event(rows, peak, trough, label, kind, recovery)
        event['episode_status'] = 'Recovered' if recovery else 'Not yet recovered'
        event['recession_overlap'] = [name for name, p, t in RECESSIONS
            if rows[peak]['date'][:7] <= t and rows[trough]['date'][:7] > p]
        events.append(event)
    for i in range(1, len(rows)):
        value = rows[i]['benchmark_adjusted_close']
        high = rows[peak]['benchmark_adjusted_close']
        if value >= high:
            if active:
                add(rows[i]['date'])
            peak = trough = i
            active = False
        elif value / high <= 0.9:
            active = True
            if value < rows[trough]['benchmark_adjusted_close']:
                trough = i
    if active:
        add(None)
    return events


def recession_events(rows):
    result = []
    for label, peak_month, trough_month in RECESSIONS:
        # NBER: peak month is final expansion month. Use its last available
        # close as baseline, then through the last close of the trough month.
        before = [i for i,r in enumerate(rows) if r['date'][:7] == peak_month]
        after = [i for i,r in enumerate(rows) if r['date'][:7] == trough_month]
        if not before or not after:
            raise ValueError(f'Missing complete recession boundary months: {label}')
        event = make_event(rows, before[-1], after[-1], label, 'NBER recession')
        event['peak_month'], event['trough_month'] = peak_month, trough_month
        result.append(event)
    return result


def calculate(dataset):
    rows = dataset['data']
    if dataset['asset'] not in ('BRK-B','BRK.B') or dataset['benchmark'] != 'S&P 500':
        raise ValueError('Expected BRK.B versus S&P 500, not a substitute dataset.')
    if len(rows) < 100:
        raise ValueError('Insufficient history.')
    for i,r in enumerate(rows):
        date.fromisoformat(r['date'])
        if i and r['date'] <= rows[i-1]['date']:
            raise ValueError('Dates must be unique and increasing.')
        for key in ('asset_adjusted_close','benchmark_adjusted_close'):
            if not math.isfinite(r[key]) or r[key] <= 0:
                raise ValueError(f'Invalid {key} at {r["date"]}')
    if dataset['range']['last_date'] != rows[-1]['date']:
        raise ValueError('Range metadata differs from data.')
    events = corrections(rows)
    if not events:
        raise ValueError('No qualifying market episodes.')
    return {
        'asset':'BRK.B', 'benchmark':'S&P 500',
        'through_date':rows[-1]['date'], 'first_date':rows[0]['date'],
        'source':dataset['source'], 'nber_source':NBER_SOURCE,
        'recession_chronology_checked':'2026-11-07',
        'methodology':{
            'episodes':'Distinct 10%+ S&P 500 running-peak declines; a new episode begins only after the previous peak is regained. Nested selloffs are not counted separately.',
            'comparison':'Maximum closing drawdown for each asset within the same S&P 500 peak-to-trough window, resetting each running peak at the window start. This is not necessarily the return between the endpoints.',
            'recessions':'Last available close in the NBER peak month through last available close in the trough month. Peak month is the final expansion month; these windows differ from stock-market peaks and troughs.',
            'benchmark':'S&P 500 price index, excluding reinvested dividends. This is a market benchmark proxy, not actual SPY ETF returns.',
        },
        'corrections':events, 'recessions':recession_events(rows),
        'asset_shallower_count':sum(e['difference_pp'] > 0.0001 for e in events),
        'asset_deeper_count':sum(e['difference_pp'] < -0.0001 for e in events),
        'ties':sum(abs(e['difference_pp']) <= 0.0001 for e in events),
    }


def font(size):
    for path in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
                 '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
                 'C:/Windows/Fonts/arialbd.ttf'):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    raise RuntimeError('A bold DejaVu, Liberation Sans or Arial font is required.')


def render_og(payload, target):
    # Deterministic selection by benchmark severity, never by Berkshire success.
    selected = sorted(payload['corrections'], key=lambda e:e['benchmark']['drawdown_pct'])[:4]
    selected.sort(key=lambda e:e['start'])
    im = Image.new('RGB',(1200,630),'#f7fafd')
    d = ImageDraw.Draw(im)
    def text(x,y,value,size=22,color=NAVY):
        d.text((x,y),value,font=font(size),fill=color)
    text(42,24,'TNI  /  MARKET INTELLIGENCE',21,BLUE)
    text(42,62,'BRK.B vs S&P 500',44)
    text(42,119,'Drawdowns in the four deepest market declines',26)
    text(42,160,'Same event windows • Maximum loss within each window',20)
    d.rounded_rectangle((42,202,1158,525),radius=16,fill='white',outline='#9badc2',width=2)
    d.rounded_rectangle((67,218,87,236),radius=3,fill=BLUE)
    text(97,212,'BRK.B',21)
    d.rounded_rectangle((222,218,242,236),radius=3,fill=RED)
    text(252,212,'S&P 500',21)
    text(770,212,'Longer bar = deeper loss',19)
    max_loss=max(-e[k]['drawdown_pct'] for e in selected for k in ('asset','benchmark'))
    scale=math.ceil(max_loss/10)*10
    left, width = 330, 690
    for idx,e in enumerate(selected):
        y=260+idx*63
        text(65,y,e['label'],23)
        text(65,y+29,f'{e["start"][5:]} → {e["end"][5:]}',16)
        for offset,key,color in ((0,'asset',BLUE),(27,'benchmark',RED)):
            val=e[key]['drawdown_pct']; length=-val/scale*width
            d.rounded_rectangle((left,y+offset,left+max(length,1),y+offset+20),radius=4,fill=color)
            text(left+length+10,y+offset-4,f'{val:.1f}%',20,color)
    text(42,544,f'{len(payload["corrections"])} qualifying episodes in full study • Through {payload["through_date"]}',20)
    text(42,577,'S&P 500 price index; excludes dividends. Source: Yahoo Finance.',17)
    text(874,577,'tradingninvestment.com',17)
    im.save(target,'PNG',optimize=True)


def generate(root):
    source=root/'src/data/charts/brkbVsSp500Drawdowns.json'
    payload=calculate(json.loads(source.read_text()))
    with tempfile.TemporaryDirectory(prefix='tni-brkb-events-') as temp:
        temp=Path(temp)
        out=temp/'brkbMarketEvents.json'
        out.write_text(json.dumps(payload,indent=2,allow_nan=False)+'\n')
        png=temp/'brkb-stock-intelligence-og.png'
        render_og(payload,png)
        for src,relative in ((out,'src/data/charts/brkbMarketEvents.json'),
                             (png,'public/images/social/brkb-stock-intelligence-og.png')):
            dest=root/relative
            dest.parent.mkdir(parents=True,exist_ok=True)
            # Stage on destination filesystem for atomic replace.
            staged=dest.with_name(dest.name+'.pending')
            try:
                staged.write_bytes(src.read_bytes())
                os.replace(staged,dest)
            finally:
                if staged.exists(): staged.unlink()
    print(f'BRK.B event chart + OG refreshed through {payload["through_date"]}')
    print(f'{len(payload["corrections"])} market episodes; {len(payload["recessions"])} NBER recession windows.')
    print(f'BRK.B shallower in {payload["asset_shallower_count"]}; deeper in {payload["asset_deeper_count"]}; tied in {payload["ties"]}.')
    return payload

if __name__=='__main__':
    generate(Path(__file__).resolve().parents[1])
