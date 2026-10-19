
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import './components/research/ArticleProse.css'
import App, { prepareApp } from './App.tsx'

async function start() {
  const dowPath = '/100-years-dow-jones-industrial-average-djia-events-history-chart'

  if (window.location.pathname.replace(/\/$/, '') === dowPath) {
    const response = await fetch(dowPath + '/index.html', {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Dow Jones article could not be loaded')
    }

    const html = await response.text()
    document.open()
    document.write(html)
    document.close()
    return
  }

  const container = document.getElementById('root')!
  // Let the browser paint the fully styled server-rendered homepage before
  // hydration competes for the main thread. No idle timeout or interaction gate.
  const homePage = new URLSearchParams(window.location.search).get('page')
  if (container.dataset.tniHydrate === 'home' && window.location.pathname === '/'
      && homePage !== 'articles' && homePage !== 'about'
      && document.visibilityState === 'visible') {
    await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)))
  }
  // Preserve the existing article HTML until its code, CSS, and data are ready.
  await prepareApp(window.location.pathname)
  const app = <StrictMode>{window.location.pathname.replace(/\/$/, '') === '/100-years-dow-jones-industrial-average-djia-events-history-chart' ? <App /> : <App />}</StrictMode>
  const page = new URLSearchParams(window.location.search).get('page')
  if (container.dataset.tniHydrate === 'article' || (container.dataset.tniHydrate === 'home' && window.location.pathname === '/'
      && page !== 'articles' && page !== 'about')) {
    hydrateRoot(container, app)
  } else {
    // Legacy article generators produce different markup; do not hydrate it.
    createRoot(container).render(app)
  }
}

void start().catch(error => {
  console.error('TNI page loading failed:', error)
  const notice = document.createElement('p')
  notice.setAttribute('role', 'alert')
  notice.textContent = 'Interactive tools could not load. '
  const retry = document.createElement('button')
  retry.type = 'button'
  retry.textContent = 'Retry'
  retry.onclick = () => window.location.reload()
  notice.append(retry)
  document.body.append(notice)
})
