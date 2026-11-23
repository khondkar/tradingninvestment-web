import article from './SecCasesBody.html?raw'
import './AnthropicIpoResearch.css'
import './SecCasesResearch.css'

export default function SecCasesResearch() {
  return <main className="ipo-study sec-research">
    <article dangerouslySetInnerHTML={{ __html: article }} />
  </main>
}
