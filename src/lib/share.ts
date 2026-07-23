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
