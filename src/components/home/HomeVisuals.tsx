export function HomeIcon({kind}: {kind: 'brain' | 'market' | 'cap' | 'grid' | 'book' | 'search'}) {
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'brain' ? <><path d="M29 10c-7-9-17-2-16 6-9 0-11 12-5 16-7 6-4 17 4 18 0 9 13 12 17 4V10Zm6 0c7-9 17-2 16 6 9 0 11 12 5 16 7 6 4 17-4 18 0 9-13 12-17 4V10Z"/><path d="M13 16v8m-5 8h9m-5 18 7-4m32-30v8m5 8h-9m5 18-7-4M24 23h16v18H24zM20 28h4m-4 8h4m16-8h4m-4 8h4m-16-17v4m8-4v4m-8 18v4m8-4v4"/></> :
    kind === 'market' ? <><path d="m7 29 15-15 12 8L55 3m-13 0h13v13"/><path d="M7 40h10v20H7zM27 32h10v28H27zM47 23h10v37H47z" fill="currentColor" strokeWidth="1"/></> :
    kind === 'cap' ? <><path d="m3 24 29-14 29 14-29 14L3 24Z" fill="currentColor"/><path d="M15 31v15l17 8 17-8V31M59 27v19"/></> :
    kind === 'grid' ? <g stroke="#092c31" strokeWidth="1.2">
      <rect x="2" y="2" width="60" height="60" rx="4" fill="#092c31" />
      <rect x="5" y="5" width="31" height="29" rx="1" fill="#159b62" />
      <rect x="38" y="5" width="21" height="17" rx="1" fill="#d74b52" />
      <rect x="38" y="24" width="21" height="22" rx="1" fill="#087b50" />
      <rect x="5" y="36" width="17" height="23" rx="1" fill="#c83f48" />
      <rect x="24" y="36" width="12" height="23" rx="1" fill="#50bd85" />
      <rect x="38" y="48" width="10" height="11" rx="1" fill="#ee7779" />
      <rect x="50" y="48" width="9" height="11" rx="1" fill="#1fa96e" />
    </g> :
    kind === 'book' ? <><path d="M32 14C23 7 13 7 4 12v43c9-5 19-5 28 1 9-6 19-6 28-1V12C51 7 41 7 32 14v42"/></> :
    <><circle cx="27" cy="27" r="21"/><path d="m43 43 16 16M15 31l8-9 8 5 8-13"/></>}
  </svg>
}
export function HomeGlobe() {
  // Decorative rising candle series; not market data. Draw over the globe so
  // candle bodies and wicks remain visible instead of being hidden behind it.
  const candles = Array.from({length: 21}, (_, i) => ({
    x: 250 + i * 21,
    y: 255 - i * 10 + [0, -9, 5, -4, 8][i % 5],
    height: 22 + (i % 4) * 6,
  }))
  return <svg className="tni-home-globe" viewBox="0 0 700 360" aria-hidden="true">
    <defs><radialGradient id="home-globe-fill" cx="32%" cy="25%"><stop stopColor="#75c7ff"/><stop offset=".5" stopColor="#1682dc"/><stop offset="1" stopColor="#063a89"/></radialGradient><linearGradient id="home-globe-fade" x2="0" y2="1"><stop stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient><mask id="home-globe-mask"><rect width="700" height="360" fill="url(#home-globe-fade)"/></mask><clipPath id="home-globe-clip"><circle cx="524" cy="236" r="204"/></clipPath></defs>
    <g mask="url(#home-globe-mask)"><g stroke="#4fa9f1" opacity=".32">{Array.from({length:22},(_,i)=><g key={i}><path d={`M${110+i*20} ${295-i*10}v75`}/><rect x={105+i*20} y={307-i*10} width="10" height={20+(i%4)*8} fill="#5ba9ee"/></g>)}</g><circle cx="524" cy="236" r="207" fill="#a7d9ff" opacity=".5"/><circle cx="524" cy="236" r="204" fill="url(#home-globe-fill)"/><g clipPath="url(#home-globe-clip)" stroke="#bce9ff" fill="none" opacity=".65"><ellipse cx="524" cy="236" rx="75" ry="204"/><ellipse cx="524" cy="236" rx="150" ry="204"/><path d="M320 236h408M524 32v408"/>{[90,145,205,265,325,385].map(y=><ellipse key={y} cx="524" cy={y} rx="207" ry="35"/>)}<path d="m375 155 58-35 30 22 18 46 55 5 17 32-40 26-20 69-30 20-24-67-42-25-12-51-26-11m165-95 44-25 72 35 31 58-38 36-47-7-22 32-37-22-18-52Z" fill="#65b8f0" opacity=".7"/>{[[400,160],[470,120],[515,210],[570,150],[620,190],[485,285],[660,120]].map(([x,y])=><g key={x}><circle cx={x} cy={y} r="6" fill="#fff3b4" stroke="none"/><circle cx={x} cy={y} r="12" opacity=".25" fill="#fff3b4" stroke="none"/></g>)}</g></g>
    <g className="tni-home-candles" strokeWidth="1.5">
      {candles.map(({x,y,height},i) => <g key={x} stroke={i % 4 === 2 ? '#62b3ef' : '#1687e0'} opacity={.38 + i / 50}>
        <path d={`M${x} ${y - 12}v${height + 26}`} />
        <rect x={x - 5} y={y} width="10" height={height} rx="1" fill={i % 4 === 2 ? '#e0f3ff' : '#369ee9'} />
      </g>)}
    </g>
  </svg>
}
