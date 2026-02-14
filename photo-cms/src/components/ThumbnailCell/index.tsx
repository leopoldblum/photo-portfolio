'use client'

import React from 'react'
import type { DefaultCellComponentProps } from 'payload'
import styles from './styles.module.css'

type ImageEntry = {
  image?: string | { thumbnailURL?: string | null; url?: string | null }
  isThumbnail?: boolean
}

const ThumbnailCell: React.FC<DefaultCellComponentProps> = ({ rowData }) => {
  const images = rowData?.images as ImageEntry[] | undefined
  if (!images?.length) return <span className={styles.empty}>No images</span>

  const thumb = images.find((img) => img.isThumbnail) ?? images[0]
  const media = thumb?.image

  if (!media || typeof media === 'string') {
    return <span className={styles.empty}>—</span>
  }

  const src = media.thumbnailURL ?? media.url
  if (!src) return <span className={styles.empty}>—</span>

  return <img src={src} alt="" className={styles.thumb} />
}

export default ThumbnailCell
