import { useEffect, useRef, useState } from 'react'

type ShareSnapshot = {
  ticker: string
  kind: 'outlook' | 'replay'
  view: string
  action?: string
  horizon?: number
  asOf?: string
  returnPct?: number
  startDate?: string
  endDate?: string
}
const fmt = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}%`
function record(platform: string, ticker: string) {
  const w = window as Window & { gtag?: (...args: unknown[]) => void }
  w.gtag?.('event', 'mini_lab_share', { platform, ticker, source: 'homepage_mini_lab' })
}
function sharingText(s: ShareSnapshot) {
  if (s.kind === 'replay') return `${s.ticker}: ${fmt(s.returnPct ?? 0)} cumulative market return, ${s.startDate} to ${s.endDate}. Market return—not model performance. Explore the recorded market moves with TNI.`
  const date = s.asOf ? new Date(s.asOf).toISOString().slice(0, 10) : 'recorded snapshot'
  return `${s.view === 'Not selected' ? 'What’s your view' : 'My view: ' + s.view} on ${s.ticker}? TNI outlook: ${s.action} over ${s.horizon} trading days. Generated ${date} (UTC). Research, not investment advice.`
}
function Card({ snapshot, canvasRef, imageFile }: { snapshot: ShareSnapshot; canvasRef: { current: HTMLCanvasElement | null }; imageFile: { current: File | null } }) {
  useEffect(() => {
    let current = true
    imageFile.current = null
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    if (!c) return
    canvas.width = 1080; canvas.height = 1080
    c.fillStyle = '#102b42'; c.fillRect(0, 0, 1080, 1080)
    c.fillStyle = '#b8f4de'; c.font = '850 28px system-ui'; c.fillText('TNI / MARKET INTELLIGENCE', 64, 84)
    c.fillStyle = '#fff'; c.font = '850 62px system-ui'
    c.fillText(snapshot.kind === 'replay' ? `${snapshot.ticker} market replay` : `What’s your call on ${snapshot.ticker}?`, 64, 202)
    c.font = '750 30px system-ui'; c.fillText('Your view. The model. The evidence.', 64, 263)
    c.fillRect(64, 320, 952, 550)
    c.fillStyle = '#29495e'; c.font = '850 28px system-ui'; c.fillText(snapshot.kind === 'replay' ? 'CUMULATIVE MARKET RETURN' : 'YOUR VIEW', 100, 389)
    c.fillStyle = snapshot.kind === 'replay' && (snapshot.returnPct ?? 0) < 0 ? '#ae1639' : '#066756'
    c.font = '900 88px system-ui'; c.fillText(snapshot.kind === 'replay' ? fmt(snapshot.returnPct ?? 0) : snapshot.view, 100, 505)
    c.fillStyle = '#102b42'
    if (snapshot.kind === 'replay') {
      c.font = '850 34px system-ui'; c.fillText(`${snapshot.startDate} → ${snapshot.endDate}`, 100, 600)
      c.font = '750 30px system-ui'; c.fillText('Adjusted daily closes', 100, 676)
      c.fillText('Market return—not model performance', 100, 755)
    } else {
      c.font = '850 30px system-ui'; c.fillText('TNI OUTLOOK', 100, 588)
      c.font = '900 70px system-ui'; c.fillText(snapshot.action || 'Unavailable', 100, 681)
      c.font = '750 29px system-ui'; c.fillText(`Next ${snapshot.horizon} trading days`, 100, 745)
      c.font = '750 24px system-ui'; c.fillText('Generated ' + new Date(snapshot.asOf!).toISOString().replace('T', ' ').slice(0, 16) + ' UTC', 100, 822)
    }
    c.fillStyle = '#b8f4de'; c.font = '850 34px system-ui'; c.fillText('Make your call. Compare with TNI. →', 64, 946)
    c.fillStyle = '#fff'; c.font = '750 23px system-ui'; c.fillText('app.tradingninvestment.com/prediction-lab', 64, 1001)
    c.font = '750 21px system-ui'; c.fillText('Dated snapshot · Research, not investment advice', 64, 1042)
    canvas.toBlob(blob => { if (current && blob) imageFile.current = new File([blob], `TNI-${snapshot.ticker}-${snapshot.kind}.png`, {type:'image/png'}) }, 'image/png')
    return () => { current = false; imageFile.current = null }
  }, [snapshot, canvasRef, imageFile])
  return <canvas ref={canvasRef} aria-label={`${snapshot.ticker} ${snapshot.kind} share card`} />
}
export default function MiniLabSharing({ snapshot, onOpen }: { snapshot: ShareSnapshot; onOpen?: () => void }) {
  const [saved, setSaved] = useState<ShareSnapshot | null>(null)
  const [message, setMessage] = useState('')
  const [manualCopy, setManualCopy] = useState('')
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const field = useRef<HTMLTextAreaElement | null>(null)
  const imageFile = useRef<File | null>(null)
  useEffect(() => { if (manualCopy) { field.current?.focus(); field.current?.select() } }, [manualCopy])
  const link = (platform: string) => `https://app.tradingninvestment.com/prediction-lab?ticker=${encodeURIComponent((saved || snapshot).ticker)}&utm_source=${platform}&utm_medium=share&utm_campaign=mini_lab`
  const text = saved ? sharingText(saved) : ''
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setMessage(label + ' copied.'); record('copy', snapshot.ticker) }
    catch { setManualCopy(value); setMessage('Select and copy the text below using your browser menu.') }
  }
  async function nativeShare() {
    if (!saved) return
    if (!navigator.share) { setMessage('This browser has no share menu. Use the platform buttons, copy, or download.'); return }
    const data: ShareData = { title: `TNI ${saved.ticker} ${saved.kind}`, text, url: link('native') }
    const file = imageFile.current
    if(file && navigator.canShare?.({files:[file]})){data.files=[file];data.text=text+'\n'+link('native');delete data.url}
    try { await navigator.share(data); setMessage('Share menu closed.'); record('native', saved.ticker) }
    catch (e) { setMessage(e instanceof Error && e.name === 'AbortError' ? 'Sharing cancelled. Your card is still available.' : 'Sharing is unavailable here. Use copy or download.') }
  }
  function download() {
    if (!canvas.current || !saved) return
    const a = document.createElement('a'); a.href = canvas.current.toDataURL('image/png'); a.download = `TNI-${saved.ticker}-${saved.kind}.png`
    document.body.append(a); a.click(); a.remove(); setMessage('Download requested. Attach the image to your social post.'); record('download', saved.ticker)
  }
  return <div className="tni-mini-sharing">
    <button className="tni-mini-share-trigger" aria-expanded={!!saved} onClick={() => { if(saved) setSaved(null); else { onOpen?.(); setSaved({...snapshot}); setMessage(''); setManualCopy('') } }}>{snapshot.kind === 'outlook' ? 'Share my view ↗' : 'Share this replay ↗'}</button>
    {saved && <section className="tni-mini-share-panel" aria-label="Personalized sharing preview">
      <h4>Your share card</h4><p>This preview captures the values when you open it.</p><Card snapshot={saved} canvasRef={canvas} imageFile={imageFile}/>
      <div className="tni-mini-social">
        <a href={'https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(link('linkedin'))} target="_blank" rel="noopener noreferrer" onClick={()=>record('linkedin',saved.ticker)}>LinkedIn ↗</a>
        <a href={'https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(link('x'))} target="_blank" rel="noopener noreferrer" onClick={()=>record('x',saved.ticker)}>X ↗</a>
        <a href={'https://wa.me/?text='+encodeURIComponent(text+'\n'+link('whatsapp'))} target="_blank" rel="noopener noreferrer" onClick={()=>record('whatsapp',saved.ticker)}>WhatsApp ↗</a>
      </div>
      <div className="tni-mini-share-actions"><button onClick={()=>void nativeShare()}>More sharing options…</button><button onClick={()=>void copy(text+'\n'+link('copy'),'Personalized caption')}>Copy caption</button><button onClick={()=>void copy(link('copy'),'Link')}>Copy link</button><button onClick={download}>Download card</button></div>
      <p role="status">{message}</p>{manualCopy&&<textarea ref={field} readOnly value={manualCopy} aria-label="Text to copy"/>}
      <p>LinkedIn opens with the link; paste your caption to include your view. X and WhatsApp include text. To share the image, download and attach it.</p>
      <p>The link opens Prediction Lab; it does not restore this exact vote or replay session. You review and publish the post yourself.</p>
    </section>}
  </div>
}
