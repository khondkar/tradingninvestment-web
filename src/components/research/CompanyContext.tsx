export type CompanyContextData = {
  eyebrow?: string
  title: string
  paragraphs: string[]
  closing?: string
}

type CompanyContextProps = {
  context: CompanyContextData
}

export default function CompanyContext({
  context,
}: CompanyContextProps) {
  return (
    <section
      aria-label={context.title}
      style={{
        marginBottom: '32px',
      }}
    >
      <div
        style={{
          marginBottom: '8px',
          color: '#64748b',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {context.eyebrow ?? 'BUSINESS & INNOVATION CONTEXT'}
      </div>

      <h2
        style={{
          margin: '0 0 14px',
          color: '#10233f',
          fontSize: '26px',
          lineHeight: 1.2,
        }}
      >
        {context.title}
      </h2>

      {context.paragraphs.map((paragraph, index) => (
        <p
          key={index}
          style={{
            margin: index === 0 ? '0 0 14px' : '0 0 14px',
            color: '#43546a',
            fontSize: '16px',
            lineHeight: 1.7,
          }}
        >
          {paragraph}
        </p>
      ))}

      {context.closing && (
        <p
          style={{
            margin: 0,
            color: '#10233f',
            fontSize: '16px',
            lineHeight: 1.7,
            fontWeight: 700,
          }}
        >
          {context.closing}
        </p>
      )}
    </section>
  )
}
