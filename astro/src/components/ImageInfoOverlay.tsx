import type { ImageWrapper } from '../../../photo-cms/src/types/apiTypes'
import { motion } from 'motion/react'
import {
  formatShutterSpeed,
  formatAperture,
  formatFocalLength,
  hasAnyExif,
} from '../util/exifFormatters'

interface ImageInfoOverlayProps {
  imageWrapper: ImageWrapper
}

const ImageInfoOverlay = ({ imageWrapper }: ImageInfoOverlayProps) => {
  const { description } = imageWrapper
  const exif = imageWrapper.image.exif
  const hasExif = hasAnyExif(exif)

  if (!description && !hasExif) return null

  const exifParts: string[] = []
  if (exif) {
    if (exif.cameraModel) exifParts.push(exif.cameraModel)
    if (exif.focalLength) exifParts.push(formatFocalLength(exif.focalLength))
    if (exif.aperture) exifParts.push(formatAperture(exif.aperture))
    if (exif.shutterSpeed) exifParts.push(formatShutterSpeed(exif.shutterSpeed))
    if (exif.iso) exifParts.push(`ISO ${exif.iso}`)
  }

  return (
    <motion.div
      className="absolute bottom-full mb-2 right-0 z-30 rounded-md px-4 py-2.5 pointer-events-auto whitespace-nowrap"
      style={{
        backgroundColor: 'rgba(38, 38, 38, 0.7)',
        boxShadow: '0 0 0 2px rgba(245, 245, 245, 0.3)',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
    >
      {description && (
        <p className={`text-sm text-neutral-200 ${exifParts.length > 0 ? 'mb-0' : ''}`}>
          {description}
        </p>
      )}

      {description && exifParts.length > 0 && (
        <div className="h-px bg-neutral-500/30 my-2" />
      )}

      {exifParts.length > 0 && (
        <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">
          {exifParts.map((part, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-2 text-neutral-500/50">·</span>}
              {part}
            </span>
          ))}
        </p>
      )}
    </motion.div>
  )
}

export default ImageInfoOverlay
