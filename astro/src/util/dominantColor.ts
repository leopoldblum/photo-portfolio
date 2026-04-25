const colorCache = new Map<string, [number, number, number]>()

/**
 * Extract the dominant color from an image URL by sampling a tiny version.
 * Returns an RGB tuple. Results are cached by URL.
 */
export function extractDominantColor(imageUrl: string): Promise<[number, number, number]> {
  const cached = colorCache.get(imageUrl)
  if (cached) return Promise.resolve(cached)

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 8
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve([120, 80, 180])
        return
      }
      ctx.drawImage(img, 0, 0, size, size)
      const data = ctx.getImageData(0, 0, size, size).data

      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        count++
      }
      const result: [number, number, number] = [
        Math.round(r / count),
        Math.round(g / count),
        Math.round(b / count),
      ]
      colorCache.set(imageUrl, result)
      resolve(result)
    }
    img.onerror = () => resolve([120, 80, 180])
    img.src = imageUrl
  })
}

/**
 * Convert RGB to a hex color string, optionally darkened/lightened.
 */
export function rgbToHex(r: number, g: number, b: number, factor = 1): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)))
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`
}

/**
 * Generate a palette of 4 dark-tinted variants from a dominant color,
 * suitable for the GrainGradient shader.
 */
export function buildPalette(rgb: [number, number, number]): [string, string, string, string] {
  const [r, g, b] = rgb
  return [
    rgbToHex(r, g, b, 0.35), // darkened main
    rgbToHex(r, g, b, 0.2),  // very dark
    rgbToHex(r, g, b, 0.12), // near-black
    rgbToHex(r, g, b, 0.5),  // slightly brighter accent
  ]
}

/**
 * Dispatch a background color change event.
 */
export function dispatchBackgroundColor(rgb: [number, number, number]) {
  document.dispatchEvent(
    new CustomEvent<[number, number, number]>('background-color', { detail: rgb }),
  )
}
