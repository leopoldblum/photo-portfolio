const colorCache = new Map<string, [number, number, number]>()

type RGB = [number, number, number]
type HSL = [number, number, number]

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break
    case gn: h = (bn - rn) / d + 2; break
    case bn: h = (rn - gn) / d + 4; break
  }
  return [h / 6, s, l]
}

function hslToRgb(h: number, s: number, l: number): RGB {
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ]
}

/**
 * Extract a vivid dominant color from an image URL by sampling a small
 * version and averaging pixels weighted by their saturation. Mid-toned,
 * chromatic pixels dominate over neutral sky/shadow areas. Saturation is
 * then boosted so the result is recognizably colorful even for muted images.
 */
export function extractDominantColor(imageUrl: string): Promise<RGB> {
  const cached = colorCache.get(imageUrl)
  if (cached) return Promise.resolve(cached)

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 16
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve([120, 80, 180])
        return
      }
      ctx.drawImage(img, 0, 0, size, size)
      const data = ctx.getImageData(0, 0, size, size).data

      let wr = 0, wg = 0, wb = 0, weightSum = 0
      let fr = 0, fg = 0, fb = 0, fallbackCount = 0

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        fr += r; fg += g; fb += b; fallbackCount++

        const [, s, l] = rgbToHsl(r, g, b)
        if (l < 0.1 || l > 0.92) continue
        const weight = s * s
        if (weight < 0.01) continue
        wr += r * weight
        wg += g * weight
        wb += b * weight
        weightSum += weight
      }

      let result: RGB
      if (weightSum > 0) {
        const ar = wr / weightSum
        const ag = wg / weightSum
        const ab = wb / weightSum
        const [h, s, l] = rgbToHsl(ar, ag, ab)
        const boostedS = Math.min(0.9, Math.max(s, 0.55))
        const boostedL = Math.min(0.65, Math.max(l, 0.4))
        result = hslToRgb(h, boostedS, boostedL)
      } else {
        result = [
          Math.round(fr / fallbackCount),
          Math.round(fg / fallbackCount),
          Math.round(fb / fallbackCount),
        ]
      }
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
 * Generate a 4-stop palette from a dominant color, suitable for the
 * GrainGradient shader. Slot 0 carries the dominant tint, slots 1-2 give the
 * shader darker contrast stops, slot 3 is the bright accent.
 */
export function buildPalette(rgb: RGB): [string, string, string, string] {
  const [r, g, b] = rgb
  return [
    rgbToHex(r, g, b, 0.65),
    rgbToHex(r, g, b, 0.40),
    rgbToHex(r, g, b, 0.22),
    rgbToHex(r, g, b, 0.85),
  ]
}

/**
 * Dispatch a background color change event.
 */
export function dispatchBackgroundColor(rgb: RGB) {
  document.dispatchEvent(
    new CustomEvent<RGB>('background-color', { detail: rgb }),
  )
}
