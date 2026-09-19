import './ResearchShareButtons.css'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type ResearchShareButtonsProps = {
  title: string
  symbol: string
  researchType: 'annual' | 'monthly' | 'drawdowns'
}

export default function ResearchShareButtons({
  title,
  symbol,
  researchType,
}: ResearchShareButtonsProps) {
  const getPageUrl = () => window.location.href

  const trackShare = (platform: string) => {
    window.gtag?.('event', 'research_share', {
      platform,
      symbol,
      research_type: researchType,
      page_path: window.location.pathname,
    })
  }

  const openShareWindow = (
    platform: string,
    shareUrl: string,
  ) => {
    trackShare(platform)

    window.open(
      shareUrl,
      '_blank',
      'noopener,noreferrer,width=720,height=640',
    )
  }

  const shareLinkedIn = () => {
    const url = encodeURIComponent(getPageUrl())

    openShareWindow(
      'linkedin',
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    )
  }

  const shareX = () => {
    const url = encodeURIComponent(getPageUrl())
    const text = encodeURIComponent(title)

    openShareWindow(
      'x',
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    )
  }

  const shareFacebook = () => {
    const url = encodeURIComponent(getPageUrl())

    openShareWindow(
      'facebook',
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    )
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        getPageUrl(),
      )

      trackShare('copy_link')
    } catch {
      const textarea =
        document.createElement('textarea')

      textarea.value = getPageUrl()
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'

      document.body.appendChild(textarea)

      textarea.select()
      document.execCommand('copy')
      textarea.remove()

      trackShare('copy_link')
    }
  }

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyLink()
      return
    }

    try {
      await navigator.share({
        title,
        url: getPageUrl(),
      })

      trackShare('native')
    } catch {
      // User cancelled the native share sheet.
    }
  }

  return (
    <section
      className="research-share"
      aria-label="Share this research"
    >
      <span className="research-share-label">
        Share this research
      </span>

      <div className="research-share-actions">
        <button
          type="button"
          onClick={shareLinkedIn}
        >
          LinkedIn
        </button>

        <button
          type="button"
          onClick={shareX}
        >
          X
        </button>

        <button
          type="button"
          onClick={shareFacebook}
        >
          Facebook
        </button>

        <button
          type="button"
          onClick={copyLink}
        >
          Copy Link
        </button>

        <button
          type="button"
          className="research-share-native"
          onClick={nativeShare}
        >
          Share
        </button>
      </div>
    </section>
  )
}
