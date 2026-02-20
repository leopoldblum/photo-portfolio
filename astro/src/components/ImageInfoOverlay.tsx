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
      className="absolute bottom-full mb-3 right-0 z-30 rounded-lg overflow-hidden pointer-events-auto whitespace-nowrap"
      style={{
        backgroundColor: 'rgba(18, 18, 18, 0.82)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
      }}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-[#cd5c5c]/25 to-transparent" />

      <div className="px-4 py-3">
        {description && (
          <p className={`text-sm text-neutral-200/90 ${exifParts.length > 0 ? 'mb-0' : ''}`}>
            {description}
          </p>
        )}

        {description && exifParts.length > 0 && (
          <div className="h-px bg-gradient-to-r from-neutral-600/40 via-neutral-500/20 to-transparent my-2.5" />
        )}

        {exifParts.length > 0 && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400/80">
            {exifParts.map((part, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-2 text-neutral-600">·</span>}
                {part}
              </span>
            ))}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default ImageInfoOverlay
