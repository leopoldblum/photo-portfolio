'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'
import styles from './styles.module.css'

type ImageRow = {
  description?: string | null
  isThumbnail?: boolean | null
}

const ImageRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<ImageRow>()

  const labelText = data?.description || `Image ${(rowNumber ?? 0) + 1}`

  return (
    <span className={styles.row}>
      <span className={styles.label}>{labelText}</span>
      {data?.isThumbnail && (
        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          Thumbnail
        </span>
      )}
    </span>
  )
}

export default ImageRowLabel
