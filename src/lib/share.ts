import html2canvas from 'html2canvas'

export function buildShareText(score: number, total: number, rankTitle: string): string {
  return `Fiz ${score}/${total} no quiz litúrgico do Tarcisius e virei "${rankTitle}"! 🙏`
}

export async function shareResult(text: string): Promise<'shared' | 'copied' | 'unavailable'> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined

  if (nav?.share) {
    try {
      await nav.share({ text })
      return 'shared'
    } catch {
      // User cancelled the native share sheet, or it failed — try clipboard next.
    }
  }

  if (nav?.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(text)
      return 'copied'
    } catch {
      return 'unavailable'
    }
  }

  return 'unavailable'
}

/** Renders a DOM element to a PNG blob. Returns null if rendering fails. */
export async function captureElementAsBlob(element: HTMLElement): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 })
    return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
  } catch {
    return null
  }
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Captures `element` as an image and opens the OS share sheet with it (so the
 * user picks WhatsApp/Instagram/etc. themselves). Three-tier fallback:
 * 1. Share sheet with the image file attached (needs `canShare({ files })` support —
 *    common on mobile, rare on desktop).
 * 2. Share sheet with just the text (still a real native "choose an app" picker —
 *    supported much more broadly, including most desktop browsers). The image is
 *    also downloaded alongside so the user still has it to attach manually.
 * 3. Straight download, when `navigator.share` isn't available at all (e.g. no
 *    secure context, or a browser with no Web Share API support).
 */
export async function shareResultImage(
  element: HTMLElement,
  text: string,
  fileName = 'tarcisius-resultado.png',
): Promise<'shared' | 'shared-image-saved' | 'downloaded' | 'copied' | 'unavailable'> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined
  const blob = await captureElementAsBlob(element)

  if (!blob) return shareResult(text)

  if (nav?.share) {
    const file = new File([blob], fileName, { type: 'image/png' })
    const canShareFiles = nav.canShare?.({ files: [file] }) ?? false

    if (canShareFiles) {
      try {
        await nav.share({ files: [file], text })
        return 'shared'
      } catch {
        // User cancelled the native share sheet, or it failed — try text-only next.
      }
    }

    try {
      await nav.share({ text })
      downloadBlob(blob, fileName)
      return 'shared-image-saved'
    } catch {
      // User cancelled, or text-only sharing isn't supported either — fall through to download.
    }
  }

  downloadBlob(blob, fileName)
  return 'downloaded'
}
