import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildShareText, shareResult } from './share'

describe('buildShareText', () => {
  it('includes score, total, and rank title', () => {
    const text = buildShareText(8, 10, 'Servidor Dedicado')
    expect(text).toContain('8/10')
    expect(text).toContain('Servidor Dedicado')
  })
})

describe('shareResult', () => {
  const originalNavigator = globalThis.navigator

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true })
  })

  it('uses navigator.share when available and resolves "shared"', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', { value: { share }, configurable: true })
    const result = await shareResult('hello')
    expect(share).toHaveBeenCalledWith({ text: 'hello' })
    expect(result).toBe('shared')
  })

  it('falls back to clipboard when navigator.share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText } }, configurable: true })
    const result = await shareResult('hello')
    expect(writeText).toHaveBeenCalledWith('hello')
    expect(result).toBe('copied')
  })

  it('returns "unavailable" when neither API exists', async () => {
    Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true })
    const result = await shareResult('hello')
    expect(result).toBe('unavailable')
  })

  it('falls back to clipboard if navigator.share rejects (user cancelled)', async () => {
    const share = vi.fn().mockRejectedValue(new Error('cancelled'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', {
      value: { share, clipboard: { writeText } }, configurable: true,
    })
    const result = await shareResult('hello')
    expect(result).toBe('copied')
  })
})
