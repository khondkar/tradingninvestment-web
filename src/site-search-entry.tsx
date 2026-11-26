import { createRoot } from 'react-dom/client'
import HomeSearch from './components/home/HomeSearch'

let host = document.getElementById('tni-site-search')
if (!host) {
  host = document.createElement('aside')
  host.id = 'tni-site-search'
  document.body.prepend(host)
}
createRoot(host).render(<HomeSearch />)
