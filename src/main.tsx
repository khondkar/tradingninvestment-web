import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App, { prepareApp } from './App.tsx'

async function start() {
  const container = document.getElementById('root')!
  // Preserve the existing article HTML until its code, CSS, and data are ready.
  await prepareApp(window.location.pathname)
  const app = <StrictMode><App /></StrictMode>
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
