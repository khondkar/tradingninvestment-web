import type { CSSProperties } from 'react'

// Keep data-driven prose readable without changing its words or punctuation.
// Long individual sentences remain intact for editorial review.
export function splitResearchParagraphs(text: string): string[] {
  const sentences = text.trim().split(/(?<=[.!?])\s+(?=[A-Z])/u)
  const paragraphs: string[] = []
  let current = ''
  for (const sentence of sentences) {
    const combined = current ? `${current} ${sentence}` : sentence
    if (current && combined.split(/\s+/u).length > 50) {
      paragraphs.push(current)
      current = sentence
    } else {
      current = combined
    }
  }
  if (current) paragraphs.push(current)
  return paragraphs
}

export default function ResearchParagraphs({
  text, className, style,
}: { text: string; className?: string; style?: CSSProperties }) {
  return <>{splitResearchParagraphs(text).map((paragraph, index) => (
    <p key={index} className={className} style={style}>{paragraph}</p>
  ))}</>
}
