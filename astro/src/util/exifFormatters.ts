import type { ExifData } from '../../../photo-cms/src/types/apiTypes'

export function formatShutterSpeed(seconds: number): string {
  if (seconds >= 1) return `${seconds}s`
  return `1/${Math.round(1 / seconds)}s`
}

export function formatAperture(fNumber: number): string {
  return `f/${fNumber % 1 === 0 ? fNumber : fNumber.toFixed(1)}`
}

export function formatFocalLength(mm: number): string {
  return `${Math.round(mm)}mm`
}

export function hasAnyExif(exif: ExifData | null | undefined): boolean {
  if (!exif) return false
  return Boolean(
    exif.cameraMake ||
      exif.cameraModel ||
      exif.lens ||
      exif.focalLength ||
      exif.aperture ||
      exif.shutterSpeed ||
      exif.iso,
  )
}
