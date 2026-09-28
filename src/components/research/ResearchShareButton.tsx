import {
  useEffect,
  useRef,
  useState,
} from 'react'

type ResearchShareButtonProps = {
  title: string
  text?: string
  url?: string
}

export default function ResearchShareButton({
  title,
  text,
  url,
}: ResearchShareButtonProps) {
  const [copied, setCopied] =
    useState(false)

  const timeoutRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current,
        )
      }
    }
  }, [])

  async function copyLink(
    shareUrl: string,
  ) {
    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(
        shareUrl,
      )
      return
    }

    const textarea =
      document.createElement(
        'textarea',
      )

    textarea.value =
      shareUrl

    textarea.setAttribute(
      'readonly',
      '',
    )

    textarea.style.position =
      'fixed'
    textarea.style.opacity =
      '0'

    document.body.appendChild(
      textarea,
    )

    textarea.select()

    const copiedSuccessfully =
      document.execCommand(
        'copy',
      )

    document.body.removeChild(
      textarea,
    )

    if (!copiedSuccessfully) {
      throw new Error(
        'Unable to copy link',
      )
    }
  }

  async function handleShare() {
    const shareUrl =
      url ??
      window.location.href

    const shareData = {
      title,
      text,
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(
          shareData,
        )
        return
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name ===
            'AbortError'
        ) {
          return
        }

        // If native sharing fails for
        // another reason, fall through
        // to copy-link behavior.
      }
    }

    try {
      await copyLink(
        shareUrl,
      )

      setCopied(true)

      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current,
        )
      }

      timeoutRef.current =
        setTimeout(
          () => {
            setCopied(false)
          },
          2200,
        )
    } catch {
      // Last-resort fallback:
      // expose the URL using the
      // browser's standard prompt.
      window.prompt(
        'Copy this research link:',
        shareUrl,
      )
    }
  }

  return (
    <button
      type="button"
      className="tni-research-share"
      onClick={handleShare}
      aria-label={
        copied
          ? 'Research link copied'
          : 'Share this research'
      }
    >
      <span
        className="tni-research-share__icon"
        aria-hidden="true"
      >
        ↗
      </span>

      <span>
        {copied
          ? 'COPIED'
          : 'SHARE RESEARCH'}
      </span>
    </button>
  )
}
