export type ShareSnapshot = {
  ticker: string; kind: 'outlook' | 'replay'; view: string;
  action?: string; horizon?: number; asOf?: string;
  returnPct?: number; startDate?: string; endDate?: string;
  community?: { total: number; counts: { BULLISH: number; NEUTRAL: number; BEARISH: number } } | null;
  priceSeries?: { date: string; close: number }[];
  signalStatus?: string;
  recordedSignals?: {signal_date:string;action:string;horizon:number}[];
}

const navy = '#102b42', teal = '#006b57', red = '#b51d40', blue = '#2457a7';
const pct = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}%`;
export function drawMiniLabShareCard(c: CanvasRenderingContext2D, s: ShareSnapshot) {
  if (s.kind === 'replay') drawReplayCard(c, s); else drawVoteCard(c, s);
}
function drawVoteCard(c: CanvasRenderingContext2D, s: ShareSnapshot) {
  const text = (value: string, x: number, y: number, size: number, color = navy, max = 1100) => {
    c.fillStyle = color; c.textAlign = 'left';
    let fit = size; c.font = `800 ${fit}px Arial, sans-serif`;
    while (c.measureText(value).width > max && fit > 16) { fit--; c.font = `800 ${fit}px Arial, sans-serif`; }
    c.fillText(value, x, y);
  };
  const box = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color; c.fillRect(x, y, w, h);
  };
  const action = ['BUY', 'HOLD', 'SELL'].includes(s.action || '') ? s.action! : 'No recorded signal';
  const actionColor = action === 'SELL' ? red : action === 'BUY' ? teal : navy;
  box(0, 0, 1200, 630, '#edf3f7');
  box(0, 0, 1200, 151, navy); box(0, 0, 10, 151, '#20ccab');
  text('TNI MINI LAB  /  ' + s.ticker, 38, 42, 24, '#ffffff');
  text(s.kind === 'outlook' ? 'Your call. The crowd. TNI’s outlook.' : 'The market moved. What did TNI say?', 38, 101, 43, '#ffffff', 1120);
  text(s.kind === 'outlook' ? `NEXT ${s.horizon ?? '—'} TRADING DAYS` : 'RECORDED MARKET REPLAY', 40, 136, 19, '#ffffff');
  box(30, 172, 550, 350, '#ffffff'); box(600, 172, 570, 350, '#ffffff');
  if (s.kind === 'outlook') {
    text('MY VIEW', 54, 209, 21);
    text(s.view || 'Not selected', 54, 264, 45, navy, 490);
    box(54, 284, 502, 2, '#b5c7d3');
    text('TNI MODEL OUTLOOK', 54, 324, 21);
    text(action, 54, 393, 64, actionColor, 490);
    text(`Forecast horizon: ${s.horizon ?? '—'} trading days`, 54, 430, 24, navy, 490);
    const date = s.asOf ? new Date(s.asOf) : null;
    const stamp = date && Number.isFinite(date.getTime()) ? date.toISOString().slice(0,16).replace('T',' ')+' UTC' : 'Timestamp unavailable';
    text('Generated ' + stamp, 54, 486, 19, navy, 490);
    text('COMMUNITY VOTE', 624, 209, 24);
    const community = s.community;
    const entries = [ ['BULLISH', 'Go up', teal], ['NEUTRAL', 'Stay flat', blue], ['BEARISH', 'Go down', red] ] as const;
    const valid = community && Number.isInteger(community.total) && community.total >= 0 && entries.every(([key]) => Number.isInteger(community.counts[key]) && community.counts[key] >= 0) && entries.reduce((sum,[key]) => sum + community.counts[key],0) === community.total;
    entries.forEach(([key,label,color], i) => {
      const y = 251 + i*72;
      const ratio = valid && community.total > 0 ? community.counts[key]/community.total : null;
      text(label + (s.view === label ? '  ·  MY VIEW' : ''), 624, y, 22, navy, 380);
      text(ratio === null ? '—' : (ratio*100).toFixed(1)+'%', 1050, y, 23, navy, 100);
      box(624,y+12,522,18,'#dce6ed');
      if (ratio !== null && ratio > 0) box(624,y+12,522*ratio,18,color);
    });
    text(valid ? `${community.total.toLocaleString('en-US')} vote submissions` : 'Vote totals unavailable', 624, 466, 26, navy, 520);
    text('Repeat votes allowed · Not unique voters', 624, 496, 19, navy, 520);
  } else {
    text('CUMULATIVE MARKET RETURN', 54, 209, 21, navy, 490);
    text(Number.isFinite(s.returnPct) ? pct(s.returnPct!) : 'Unavailable', 54, 282, 66, (s.returnPct ?? 0) < 0 ? red : teal, 490);
    text(`${s.startDate ?? '—'} → ${s.endDate ?? '—'}`, 54, 315, 23, navy, 490);
    const prices = s.priceSeries || [];
    const valid = prices.length >= 2 && prices.every(p => Number.isFinite(p.close) && p.close > 0);
    if (valid) {
      const values = prices.map(p => (p.close/prices[0].close-1)*100);
      const lo = Math.min(0,...values), hi = Math.max(0,...values), span = Math.max(hi-lo,0.2);
      const x = (i: number) => 62+i/(values.length-1)*482;
      const y = (v: number) => 438-(v-lo)/span*93;
      c.setLineDash([5,5]); c.strokeStyle='#637d91'; c.lineWidth=2;
      c.beginPath();c.moveTo(62,y(0));c.lineTo(544,y(0));c.stroke();c.setLineDash([]);
      for(let i=1;i<values.length;i++) {
        c.strokeStyle=values[i]<values[i-1]?red:teal;c.lineWidth=5;c.lineCap='round';
        c.beginPath();c.moveTo(x(i-1),y(values[i-1]));c.lineTo(x(i),y(values[i]));c.stroke();
      }
      text(`${prices.length-1} completed sessions · Adjusted closes`,54,484,20,navy,490);
    } else text('More completed prices needed for a chart',54,395,21,navy,490);
    text('SIGNAL ON ' + (s.endDate || 'SELECTED DATE'),624,209,21,navy,520);
    text(action,624,278,60,actionColor,520);
    text(s.horizon ? `Forecast horizon: ${s.horizon} trading days` : 'Forecast horizon unavailable',624,316,24,navy,520);
    box(624,338,522,2,'#b5c7d3');
    text('DIRECTION CHECK',624,374,20);
    text(s.signalStatus || 'No recorded signal',624,411,30,navy,520);
    text('My view now: '+(s.view || 'Not selected'),624,458,24,navy,520);
    text('My current view is not a historical forecast.',624,492,19,navy,520);
  }
  text(s.kind === 'replay' ? 'Market return ≠ model performance. Check the forecast horizon.' : 'Crowd votes are opinions, not evidence of model accuracy.',38,550,22,navy,1120);
  box(0,569,1200,61,navy);
  text('MAKE YOUR CALL → tradingninvestment.com/#prediction-lab',38,607,25,'#ffffff',1120);
}

function drawReplayCard(c: CanvasRenderingContext2D, s: ShareSnapshot) {
  const text=(v:string,x:number,y:number,size:number,color=navy,max=1120)=>{
    c.textAlign='left';c.fillStyle=color;c.font=`800 ${size}px Arial, sans-serif`;
    while(c.measureText(v).width>max && size>16)c.font=`800 ${--size}px Arial, sans-serif`;
    c.fillText(v,x,y);
  };
  const box=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
  const action=['BUY','HOLD','SELL'].includes(s.action||'')?s.action!:'No signal';
  box(0,0,1200,630,'#edf3f7');box(0,0,1200,115,navy);box(0,0,10,115,'#20ccab');
  text('TNI MINI LAB / '+s.ticker+' · RECORDED REPLAY',38,37,23,'#ffffff');
  text('The market moved. What did TNI say?',38,88,43,'#ffffff');
  box(30,130,550,225,'#ffffff');box(600,130,570,225,'#ffffff');
  text('CUMULATIVE MARKET RETURN',50,160,20);
  text(Number.isFinite(s.returnPct)?pct(s.returnPct!):'Unavailable',50,220,60,(s.returnPct??0)<0?red:teal,500);
  const prices=s.priceSeries||[];
  if(prices.length>=2 && prices.every(p=>Number.isFinite(p.close)&&p.close>0)){
    const values=prices.map(p=>(p.close/prices[0].close-1)*100);
    const lo=Math.min(0,...values),hi=Math.max(0,...values),span=Math.max(.2,hi-lo);
    const x=(i:number)=>56+i/(values.length-1)*490, y=(v:number)=>308-(v-lo)/span*64;
    c.strokeStyle='#637d91';c.lineWidth=1;c.setLineDash([5,5]);c.beginPath();c.moveTo(56,y(0));c.lineTo(546,y(0));c.stroke();c.setLineDash([]);
    for(let i=1;i<values.length;i++){c.strokeStyle=values[i]<values[i-1]?red:teal;c.lineWidth=4;c.beginPath();c.moveTo(x(i-1),y(values[i-1]));c.lineTo(x(i),y(values[i]));c.stroke();}
  }else text('Replay starting point',50,280,24);
  text(`${s.startDate??'—'} → ${s.endDate??'—'}`,50,340,22,navy,510);
  text('SIGNAL ON '+(s.endDate||'SELECTED DATE'),620,160,20);
  text(action,620,215,48,action==='BUY'?teal:action==='SELL'?red:navy,520);
  text(s.horizon?`Forecast horizon: ${s.horizon} trading days`:'Forecast horizon unavailable',620,245,22,navy,520);
  text('Direction check: '+(s.signalStatus||'No recorded signal'),620,280,24,navy,520);
  text('My view now: '+s.view,620,312,23,navy,520);
  text('Current view, not a historical forecast.',620,340,19,navy,520);
  const sessions=prices.slice(1).slice(-15);
  text(`${sessions.length} TRADING SESSIONS · DATED SIGNALS`,38,386,22);
  sessions.forEach((p,i)=>{
    const x=38+(i%5)*228,y=410+Math.floor(i/5)*51;
    const signal=s.recordedSignals?.find(r=>r.signal_date===p.date);
    const label=signal&&['BUY','HOLD','SELL'].includes(signal.action)?signal.action:'No signal';
    text(p.date,x,y,17,navy,212);
    box(x,y+5,212,26,label==='BUY'?teal:label==='SELL'?red:label==='HOLD'?blue:navy);
    text(label,x+10,y+25,20,'#ffffff',192);
  });
  if(!sessions.length)text('Play or select a session to show its recorded signal.',38,436,24);
  text('Adjusted closes · Market return ≠ model performance · No signals inferred',38,575,20,navy,1120);
  box(0,590,1200,40,navy);
  text('MAKE YOUR CALL → tradingninvestment.com/#prediction-lab',38,618,23,'#ffffff');
}
