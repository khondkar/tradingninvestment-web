import { kamalResearchAuthor } from '../../research/author'

const sectionStyle = { margin: '36px 0', padding: '24px', border: '1px solid #bbc9da', borderRadius: 12, background: '#f5f8fc', color: '#10233f', fontSize: 17, fontWeight: 600, lineHeight: 1.75 } as const

export function ArticleAuthorBio() {
  return <aside aria-label="About the author" style={sectionStyle}>
    <h2 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 800 }}>About the author</h2>
    <p style={{ margin: '0 0 12px', color: '#10233f', fontWeight: 600 }}><a href={kamalResearchAuthor.url} rel="author" style={{ color: "#064ca1", fontWeight: 800 }}>{kamalResearchAuthor.name}</a>{kamalResearchAuthor.bio.slice(kamalResearchAuthor.name.length)}</p>
    <a href={kamalResearchAuthor.url} rel="author" style={{ color: '#064ca1', fontWeight: 800 }}>More about Kamal →</a>
  </aside>
}

export function AboutAuthorBio() {
  const person = {
    '@context': 'https://schema.org', '@type': 'Person',
    '@id': 'https://tradingninvestment.com/about/#kamal-khondkar',
    name: kamalResearchAuthor.name, url: 'https://tradingninvestment.com/about/',
    jobTitle: 'Quantitative Researcher', description: kamalResearchAuthor.bio,
  }
  return <section id="kamal-khondkar" aria-labelledby="kamal-bio-heading" style={sectionStyle}>
    <h2 id="kamal-bio-heading" style={{ margin: '0 0 18px', fontSize: 28, lineHeight: 1.3, fontWeight: 800 }}>About Kamal Khondkar</h2>
    <p style={{ color: "#10233f", fontWeight: 600 }}>I’m Kamal Khondkar, a quantitative researcher focused on one question: how can data and models support better investment decisions when markets are uncertain?</p>
    <p style={{ color: "#10233f", fontWeight: 600 }}>I bring more than a decade of experience in financial markets to my research across equities, ETFs, options, and other derivatives. My work centers on systematic trading, momentum, volatility, machine learning, and risk management. I evaluate investment opportunities alongside their risks and the practical constraints of trading.</p>
    <p style={{ color: "#10233f", fontWeight: 600 }}>I’m a Quantitative Researcher at ABX and a Quantitative Finance Fellow at Handshake AI, where I contribute to financial reasoning and model evaluation. I hold an M.S. in Finance from the University of Rochester’s Simon Business School and an M.S. in Economics from the University of Dhaka, and I completed MIT’s Applied Data Science Program.</p>
    <p style={{ color: "#10233f", fontWeight: 600 }}>I’m also the author of <em>The Key to a Bank Job</em>, a best-selling book in Bangladesh.</p>
    <p style={{ color: "#10233f", fontWeight: 600 }}>I’m fascinated by how people, markets, and intelligent systems make decisions. That curiosity shapes the research you’ll find here.</p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, '\\u003c') }} />
  </section>
}
