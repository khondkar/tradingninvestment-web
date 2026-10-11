const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
export function applyArticleImage(html, image) {
  if (!html.includes('</head>')) throw new Error('Missing document head')
  // Remove only image-related social metadata; retain all unrelated metadata.
  html = html.replace(/<meta\b[^>]*>/gi, (tag) => /\b(?:property|name)\s*=\s*["'](?:og:image(?::[^"']*)?|twitter:image(?::[^"']*)?|twitter:card)["']/i.test(tag) ? '' : tag)
  html = html.replace('</head>', `<meta property="og:image" content="${escape(image)}" />\n<meta name="twitter:image" content="${escape(image)}" />\n<meta name="twitter:card" content="summary_large_image" />\n</head>`)
  return html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (all,start,text,end) => {
    const data = JSON.parse(text)
    function visit(value) {
      if (Array.isArray(value)) { value.forEach(visit); return }
      if (!value || typeof value !== 'object') return
      const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']]
      if (types.some((type) => ['Article','BlogPosting','NewsArticle','ScholarlyArticle'].includes(type))) value.image = image
      if (value['@graph']) visit(value['@graph'])
    }
    visit(data)
    return start + JSON.stringify(data).replace(/</g,'\\u003c') + end
  })
}
