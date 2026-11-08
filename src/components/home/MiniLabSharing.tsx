import { useEffect, useRef, useState } from 'react'

const SHARE_API = ((import.meta as ImportMeta & { env?: { VITE_MINI_LAB_API_URL?: string } }).env?.VITE_MINI_LAB_API_URL || 'https://quant-ai-agent.onrender.com').replace(/\/$/, '')

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
function Card({ snapshot, canvasRef, imageFile, onReady }: { snapshot: ShareSnapshot; canvasRef: { current: HTMLCanvasElement | null }; imageFile: { current: File | null }; onReady: (blob: Blob) => void }) {
  useEffect(() => {
    let current = true
    imageFile.current = null
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    if (!c) return
    canvas.width = 1200; canvas.height = 630
    c.fillStyle = '#102b42'; c.fillRect(0, 0, 1200, 630)
    c.fillStyle = '#b8f4de'; c.font = '850 25px system-ui'; c.fillText('TNI / MARKET INTELLIGENCE', 48, 58)
    c.fillStyle = '#fff'; c.font = '850 47px system-ui'
    c.fillText(snapshot.kind === 'replay' ? `${snapshot.ticker} market replay` : `What’s your call on ${snapshot.ticker}?`, 48, 132)
    c.fillRect(48, 172, 1104, 330)
    c.fillStyle = '#29495e'; c.font = '850 24px system-ui'
    c.fillText(snapshot.kind === 'replay' ? 'CUMULATIVE MARKET RETURN' : 'YOUR VIEW', 80, 222)
    c.fillStyle = snapshot.kind === 'replay' && (snapshot.returnPct ?? 0) < 0 ? '#ae1639' : '#066756'
    c.font = '900 76px system-ui'; c.fillText(snapshot.kind === 'replay' ? fmt(snapshot.returnPct ?? 0) : snapshot.view, 80, 320)
    c.fillStyle = '#102b42'
    if (snapshot.kind === 'replay') {
      c.font = '850 27px system-ui'; c.fillText(`${snapshot.startDate} → ${snapshot.endDate}`, 80, 385)
      c.font = '750 24px system-ui'; c.fillText('Adjusted daily closes · Market return—not model performance', 80, 457)
    } else {
      c.fillStyle = '#29495e'; c.font = '850 24px system-ui'; c.fillText('TNI OUTLOOK', 660, 222)
      c.fillStyle = '#102b42'; c.font = '900 76px system-ui'; c.fillText(snapshot.action || 'Unavailable', 660, 320)
      c.font = '750 26px system-ui'; c.fillText(`Next ${snapshot.horizon} trading days`, 660, 377)
      c.font = '750 24px system-ui'; c.fillText('Generated ' + new Date(snapshot.asOf!).toISOString().replace('T', ' ').slice(0, 16) + ' UTC', 80, 457)
    }
    c.fillStyle = '#b8f4de'; c.font = '850 29px system-ui'; c.fillText('Make your call. Compare with TNI. →', 48, 553)
    c.fillStyle = '#fff'; c.font = '750 21px system-ui'; c.fillText('tradingninvestment.com/#prediction-lab', 48, 594)
    c.font = '750 18px system-ui'; c.textAlign = 'right'; c.fillText('Dated snapshot · Not investment advice', 1152, 594); c.textAlign = 'left'
    canvas.toBlob(blob => {
      if (current && blob) {
        imageFile.current = new File([blob], `TNI-${snapshot.ticker}-${snapshot.kind}.png`, {type:'image/png'})
        onReady(blob)
      }
    }, 'image/png')
    return () => { current = false; imageFile.current = null }
  }, [snapshot, canvasRef, imageFile, onReady])
  return <canvas ref={canvasRef} aria-label={`${snapshot.ticker} ${snapshot.kind} share card`} />
}
export default function MiniLabSharing({ snapshot, onOpen }: { snapshot: ShareSnapshot; onOpen?: () => void }) {
  const [saved, setSaved] = useState<ShareSnapshot | null>(null)
  const [message, setMessage] = useState('')
  const [blob, setBlob] = useState<Blob | null>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [manualCopy, setManualCopy] = useState('')
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const field = useRef<HTMLTextAreaElement | null>(null)
  const imageFile = useRef<File | null>(null)
  useEffect(() => { if (manualCopy) { field.current?.focus(); field.current?.select() } }, [manualCopy])
  useEffect(() => {
    if (!saved || !blob) return
    const controller = new AbortController()
    let current = true
    const timeout = window.setTimeout(() => controller.abort(), 45000)
    setShareUrl(''); setUploadError('')
    void fetch(SHARE_API + '/market/share-snapshots/mini?ticker=' + encodeURIComponent(saved.ticker) + '&kind=' + saved.kind, {
      method: 'POST', headers: {'Content-Type':'image/png'}, body: blob, signal: controller.signal, credentials: 'omit',
    }).then(async response => {
      if (!response.ok) throw new Error(response.status === 503 ? 'Public share storage is unavailable. Please retry shortly.' : 'Your share card could not be prepared. Please retry.')
      const data = await response.json()
      if (!/^[a-f0-9]{64}$/.test(data.id) || typeof data.url !== 'string') throw new Error('Invalid share link response.')
      const url = new URL(data.url)
      if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/market/share-snapshots/mini/' + data.id || url.search || url.hash) throw new Error('Invalid share link response.')
      if (current) setShareUrl(url.href)
    }).catch(error => {
      if(current) setUploadError(error instanceof Error && error.name === 'AbortError' ? 'Preparing your share card timed out. Retry to continue.' : error instanceof Error ? error.message : 'Your share card could not be prepared.')
    }).finally(() => window.clearTimeout(timeout))
    return () => { current = false; controller.abort(); window.clearTimeout(timeout) }
  }, [saved, blob, attempt])
  const link = () => shareUrl
  const text = saved ? sharingText(saved) : ''
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setMessage(label + ' copied.'); record('copy', snapshot.ticker) }
    catch { setManualCopy(value); setMessage('Select and copy the text below using your browser menu.') }
  }
  async function nativeShare() {
    if (!saved || !shareUrl) return
    if (!navigator.share) { setMessage('This browser has no share menu. Use the platform buttons, copy, or download.'); return }
    const data: ShareData = { title: `TNI ${saved.ticker} ${saved.kind}`, text, url: link() }
    const file = imageFile.current
    if(file && navigator.canShare?.({files:[file]})){data.files=[file];data.text=text+'\n'+link();delete data.url}
    try { await navigator.share(data); setMessage('Share menu closed.'); record('native', saved.ticker) }
    catch (e) { setMessage(e instanceof Error && e.name === 'AbortError' ? 'Sharing cancelled. Your card is still available.' : 'Sharing is unavailable here. Use copy or download.') }
  }
  function download() {
    if (!canvas.current || !saved) return
    const a = document.createElement('a'); a.href = canvas.current.toDataURL('image/png'); a.download = `TNI-${saved.ticker}-${saved.kind}.png`
    document.body.append(a); a.click(); a.remove(); setMessage('Image download requested. The personalized link also provides an image preview.'); record('download', saved.ticker)
  }
  return <div className="tni-mini-sharing">
    <button className="tni-mini-share-trigger" aria-expanded={!!saved} onClick={() => { if(saved) { setSaved(null); setBlob(null); setShareUrl('') } else { onOpen?.(); setBlob(null); setShareUrl(''); setUploadError(''); setSaved({...snapshot}); setMessage(''); setManualCopy('') } }}>{snapshot.kind === 'outlook' ? 'Share my view ↗' : 'Share this replay ↗'}</button>
    {saved && <section className="tni-mini-share-panel" aria-label="Personalized sharing preview">
      <h4>Your share card</h4><p>This creates a public, dated card of the values shown here.</p><Card snapshot={saved} canvasRef={canvas} imageFile={imageFile} onReady={setBlob}/>
      {!shareUrl && !uploadError && <p role="status">Preparing your personalized share link…</p>}
      {uploadError && <div role="alert"><p>{uploadError}</p><button onClick={()=>setAttempt(value=>value+1)}>Retry share link</button></div>}
      {shareUrl && <div className="tni-mini-social">
        <a href={'https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(link())} target="_blank" rel="noopener noreferrer" onClick={()=>record('linkedin',saved.ticker)}>LinkedIn ↗</a>
        <a href={'https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(link())} target="_blank" rel="noopener noreferrer" onClick={()=>record('x',saved.ticker)}>X ↗</a>
        <a href={'https://wa.me/?text='+encodeURIComponent(text+'\n'+link())} target="_blank" rel="noopener noreferrer" onClick={()=>record('whatsapp',saved.ticker)}>WhatsApp ↗</a>
      </div>}
      <div className="tni-mini-share-actions"><button disabled={!shareUrl} onClick={()=>void nativeShare()}>More sharing options…</button><button disabled={!shareUrl} onClick={()=>void copy(text+'\n'+link(),'Personalized caption')}>Copy caption</button><button disabled={!shareUrl} onClick={()=>void copy(link(),'Link')}>Copy link</button><button onClick={download}>Download card</button></div>
      <p role="status">{message}</p>{manualCopy&&<textarea ref={field} readOnly value={manualCopy} aria-label="Text to copy"/>}
      <p>Your personalized link supplies the card image to social platforms—no manual upload is needed for a link preview. The platform controls whether and when the preview appears.</p>
      <p>The link opens this saved card with a button back to the Mini Lab. X and WhatsApp include your caption; LinkedIn lets you add text. Nothing posts automatically.</p>
    </section>}
  </div>
}
